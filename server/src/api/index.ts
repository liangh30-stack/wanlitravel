/**
 * 面向前端的 JSON API（Express）。
 *
 * 安全设计：
 * - T10 凭证只存在于服务端环境变量，前端永远不直连 T10
 * - 所有 /api 请求经过共享密钥鉴权（X-Api-Key）+ 限流
 * - 所有输入经 zod 校验后才进入 T10 客户端
 * - confirm 成功落地本地订单库；cancel 必须命中本地订单（归属校验），
 *   防止通过枚举 locator 取消非本系统的订单
 *
 * 启动：npm run server:dev（需先在 .env.local 配置 T10_* 与 API_SHARED_KEY）
 */
import express from 'express';
import { ZodError } from 'zod';
import { T10Client, createHttpTransport, T10Error, ConfirmTimeoutError } from '../t10/index.js';
import { OrderStore } from '../store/orders.js';
import { InquiryStore } from '../store/inquiries.js';
import { apiKeyAuth, generalLimiter, bookingLimiter, inquiryLimiter } from './middleware.js';
import { searchSchema, valueSchema, confirmSchema, cancelSchema, inquirySchema } from './schemas.js';

const {
  T10_BASE_URL = '',
  T10_USER = '',
  T10_PASSWORD = '',
  T10_LOG_DIR = './logs/t10',
  API_SHARED_KEY,
  INQUIRY_WEBHOOK_URL,
  PORT = '3001',
} = process.env;

if (!T10_BASE_URL || !T10_USER || !T10_PASSWORD) {
  console.warn('[t10] 缺少 T10_BASE_URL / T10_USER / T10_PASSWORD 环境变量 — API 将以未配置状态启动');
}
if (!API_SHARED_KEY) {
  console.warn('[auth] 未配置 API_SHARED_KEY — 仅接受本机请求（开发模式）');
}

const client = new T10Client({
  user: T10_USER,
  password: T10_PASSWORD,
  transport: createHttpTransport({ baseUrl: T10_BASE_URL, logDir: T10_LOG_DIR }),
});
const orders = new OrderStore();
const inquiries = new InquiryStore();

/** 新询盘 webhook 通知（飞书/企微/Slack 皆兼容 {text} 格式；不配置则跳过） */
async function notifyInquiry(r: { type: string; companyName: string; workEmail: string; message?: string; routeCode?: string }) {
  if (!INQUIRY_WEBHOOK_URL) return;
  const text = `📩 新询盘 [${r.type === 'partner' ? '合作伙伴申请' : `路线报价 ${r.routeCode ?? ''}`}]\n公司: ${r.companyName}\n邮箱: ${r.workEmail}\n留言: ${r.message ?? '-'}`;
  await fetch(INQUIRY_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, msg_type: 'text', content: { text } }),
  });
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

// 健康检查不鉴权（供负载均衡探活）
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(T10_BASE_URL && T10_USER && T10_PASSWORD) });
});

/**
 * 公开询盘端点 —— 网站访客提交表单，无法要求 API key。
 * 防护：独立更严限流（5/分钟/IP）+ 蜜罐字段 + zod 校验 + body 大小限制。
 */
app.post('/api/inquiries', inquiryLimiter, async (req, res) => {
  // 蜜罐：机器人填了隐藏字段 → 假装成功，静默丢弃
  if (typeof req.body?.website === 'string' && req.body.website.length > 0) {
    res.json({ ok: true });
    return;
  }
  try {
    const input = inquirySchema.parse(req.body);
    const { consent, ...fields } = input;
    const record = inquiries.create({ ...fields, consentAt: new Date().toISOString() });
    notifyInquiry(record).catch(err => console.error('[inquiries] webhook 通知失败:', err));
    res.json({ ok: true, id: record.id });
  } catch (err) { handleError(err, res); }
});

// 其余 /api 全部鉴权 + 限流
app.use('/api', apiKeyAuth(API_SHARED_KEY), generalLimiter);

/** 询盘管理（需鉴权）：列表 / 标记已处理 / 删除（GDPR） */
app.get('/api/inquiries', (_req, res) => { res.json(inquiries.list()); });
app.post('/api/inquiries/:id/handled', (req, res) => {
  res.json({ ok: inquiries.markHandled(req.params.id) });
});
app.delete('/api/inquiries/:id', (req, res) => {
  res.json({ ok: inquiries.delete(req.params.id) });
});

const strip = <T extends { raw?: unknown }>(o: T): Omit<T, 'raw'> => {
  const { raw, ...rest } = o;
  return rest;
};

/** 搜索 */
app.post('/api/hotels/search', async (req, res) => {
  try {
    const input = searchSchema.parse(req.body);
    const result = await client.getAccommodationAvail(input);
    res.json({
      idOperation: result.idOperation,
      accommodations: result.accommodations.map(a => ({ ...strip(a), rooms: a.rooms })),
    });
  } catch (err) { handleError(err, res); }
});

/** 核价（下单前必须调用，防 M12） */
app.post('/api/hotels/value', async (req, res) => {
  try {
    res.json(strip(await client.value(valueSchema.parse(req.body))));
  } catch (err) { handleError(err, res); }
});

/** 确认下单：成功落库；成交价与 expectedNeto 比对返回 priceChanged */
app.post('/api/hotels/confirm', bookingLimiter, async (req, res) => {
  try {
    const input = confirmSchema.parse(req.body);
    // clientLocalizer 幂等保护：同一参考号已有订单则拒绝重复下单
    const existing = orders.findByClientLocalizer(input.clientLocalizer);
    if (existing) {
      res.status(409).json({ error: 'DUPLICATE_CLIENT_LOCALIZER', order: existing });
      return;
    }
    const { expectedNeto, hotelCode, checkIn, checkOut, ...confirmReq } = input;
    try {
      const confirmed = await client.confirm(confirmReq);
      const priceChanged = expectedNeto !== undefined && confirmed.neto !== undefined
        && Number(confirmed.neto) !== Number(expectedNeto);
      const order = orders.create({
        clientLocalizer: input.clientLocalizer,
        locator: confirmed.locator,
        status: 'CONFIRMED',
        hotelCode: hotelCode ?? input.code,
        checkIn, checkOut,
        valuedNeto: expectedNeto !== undefined ? String(expectedNeto) : undefined,
        confirmedNeto: confirmed.neto,
        currencyCode: confirmed.currencyCode,
        priceChanged,
      });
      res.json({ ...strip(confirmed), priceChanged, orderId: order.id });
    } catch (err) {
      if (err instanceof ConfirmTimeoutError) {
        // 状态未知：落库为 PENDING_UNKNOWN，由对账流程核实，前端展示"处理中"
        const order = orders.create({
          clientLocalizer: input.clientLocalizer,
          status: 'PENDING_UNKNOWN',
          hotelCode: hotelCode ?? input.code,
          checkIn, checkOut,
          valuedNeto: expectedNeto !== undefined ? String(expectedNeto) : undefined,
        });
        res.status(504).json({ error: 'CONFIRM_TIMEOUT', orderId: order.id, message: err.message });
        return;
      }
      throw err;
    }
  } catch (err) { handleError(err, res); }
});

/** 查询取消费用（须为本系统订单） */
app.post('/api/hotels/cancel-quote', async (req, res) => {
  try {
    const { locator } = cancelSchema.parse(req.body);
    if (!orders.findByLocator(locator)) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND', message: '该订单不属于本系统' });
      return;
    }
    res.json(strip(await client.cancel({ locator, execute: false })));
  } catch (err) { handleError(err, res); }
});

/** 执行取消（须为本系统订单，成功后更新状态） */
app.post('/api/hotels/cancel', bookingLimiter, async (req, res) => {
  try {
    const { locator } = cancelSchema.parse(req.body);
    const order = orders.findByLocator(locator);
    if (!order) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND', message: '该订单不属于本系统' });
      return;
    }
    const outcome = await client.cancel({ locator, execute: true });
    orders.update(order.id, { status: 'CANCELLED' });
    res.json(strip(outcome));
  } catch (err) { handleError(err, res); }
});

/** 待对账订单列表（confirm 超时后状态未知的单） */
app.get('/api/orders/pending', (_req, res) => {
  res.json(orders.listPendingUnknown());
});

function handleError(err: unknown, res: express.Response) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'VALIDATION', issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })) });
    return;
  }
  if (err instanceof T10Error) {
    const status = err.isSessionExpired ? 401 : err.needsManualHandling ? 409 : 502;
    res.status(status).json({
      error: err.code,
      message: err.message,
      needsManualHandling: err.needsManualHandling,
      retryable: err.isRetryable,
    });
    return;
  }
  console.error('[api] unexpected error:', err);
  res.status(500).json({ error: 'INTERNAL' });
}

app.listen(Number(PORT), () => {
  console.log(`[t10 api] listening on http://localhost:${PORT}`);
});
