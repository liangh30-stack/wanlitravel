/**
 * 面向前端的 JSON API（Express）。
 *
 * 前端永远不直接触达 T10：凭证只存在于服务端环境变量，
 * 这里把 XML 接口翻译成干净的 JSON，并在响应里屏蔽 raw 报文。
 *
 * 启动：npm run server:dev（需先在 .env.local 配置 T10_* 变量）
 */
import express from 'express';
import { T10Client, createHttpTransport, T10Error, ConfirmTimeoutError } from '../t10/index.js';

const {
  T10_BASE_URL = '',
  T10_USER = '',
  T10_PASSWORD = '',
  T10_LOG_DIR = './logs/t10',
  PORT = '3001',
} = process.env;

if (!T10_BASE_URL || !T10_USER || !T10_PASSWORD) {
  console.warn('[t10] 缺少 T10_BASE_URL / T10_USER / T10_PASSWORD 环境变量 — API 将以未配置状态启动');
}

const client = new T10Client({
  user: T10_USER,
  password: T10_PASSWORD,
  transport: createHttpTransport({ baseUrl: T10_BASE_URL, logDir: T10_LOG_DIR }),
});

const app = express();
app.use(express.json());

const strip = <T extends { raw?: unknown }>(o: T): Omit<T, 'raw'> => {
  const { raw, ...rest } = o;
  return rest;
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(T10_BASE_URL && T10_USER && T10_PASSWORD) });
});

/** 搜索：POST /api/hotels/search { checkIn, checkOut, rooms: [{adults, children, units, ...}] } */
app.post('/api/hotels/search', async (req, res) => {
  try {
    const result = await client.getAccommodationAvail(req.body);
    res.json({
      idOperation: result.idOperation,
      accommodations: result.accommodations.map(a => ({ ...strip(a), rooms: a.rooms })),
    });
  } catch (err) { handleError(err, res); }
});

/** 核价（下单前必须调用，防 M12）：POST /api/hotels/value { idOperation, code, idDistributions } */
app.post('/api/hotels/value', async (req, res) => {
  try {
    res.json(strip(await client.value(req.body)));
  } catch (err) { handleError(err, res); }
});

/** 确认：POST /api/hotels/confirm — 响应中的 priceChanged 字段提示成交价与核价是否一致 */
app.post('/api/hotels/confirm', async (req, res) => {
  try {
    const { expectedNeto, ...confirmReq } = req.body;
    const confirmed = await client.confirm(confirmReq);
    const priceChanged = expectedNeto !== undefined && confirmed.neto !== undefined
      && Number(confirmed.neto) !== Number(expectedNeto);
    res.json({ ...strip(confirmed), priceChanged });
  } catch (err) {
    if (err instanceof ConfirmTimeoutError) {
      // 状态未知：告知前端进入"处理中"状态，由对账任务或人工核实
      res.status(504).json({ error: 'CONFIRM_TIMEOUT', clientLocalizer: err.clientLocalizer, message: err.message });
      return;
    }
    handleError(err, res);
  }
});

/** 查询取消费用：POST /api/hotels/cancel-quote { locator } */
app.post('/api/hotels/cancel-quote', async (req, res) => {
  try {
    res.json(strip(await client.cancel({ locator: req.body.locator, execute: false })));
  } catch (err) { handleError(err, res); }
});

/** 执行取消：POST /api/hotels/cancel { locator } */
app.post('/api/hotels/cancel', async (req, res) => {
  try {
    res.json(strip(await client.cancel({ locator: req.body.locator, execute: true })));
  } catch (err) { handleError(err, res); }
});

function handleError(err: unknown, res: express.Response) {
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
  res.status(500).json({ error: 'INTERNAL', message: String(err) });
}

app.listen(Number(PORT), () => {
  console.log(`[t10 api] listening on http://localhost:${PORT}`);
});
