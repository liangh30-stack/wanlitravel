/** API 安全中间件：共享密钥鉴权 + 限流。 */
import type { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import rateLimit from 'express-rate-limit';

/**
 * 共享密钥鉴权（X-Api-Key 头）。
 * - 配置了 API_SHARED_KEY：所有 /api 请求必须携带正确的 key
 * - 未配置：仅允许本机访问并打警告（开发模式）；生产环境（NODE_ENV=production）直接拒绝启动请求
 */
export function apiKeyAuth(sharedKey: string | undefined) {
  const isProd = process.env.NODE_ENV === 'production';
  if (!sharedKey && isProd) {
    console.error('[auth] 生产环境必须配置 API_SHARED_KEY');
  }
  return (req: Request, res: Response, next: NextFunction) => {
    if (!sharedKey) {
      if (isProd) { res.status(503).json({ error: 'NOT_CONFIGURED', message: '服务端未配置 API_SHARED_KEY' }); return; }
      const ip = req.ip ?? '';
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') { next(); return; }
      res.status(401).json({ error: 'UNAUTHORIZED', message: '开发模式仅允许本机访问' });
      return;
    }
    const given = String(req.header('x-api-key') ?? '');
    const a = Buffer.from(given), b = Buffer.from(sharedKey);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }
    next();
  };
}

/** 普通接口限流：每 IP 每分钟 60 次 */
export const generalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

/** 交易接口限流（confirm/cancel）：每 IP 每分钟 10 次 */
export const bookingLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
