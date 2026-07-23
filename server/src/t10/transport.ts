/**
 * HTTP 传输层：POST pOperacion + pRequest（ISO-8859-1 编码的表单）。
 *
 * 独立成接口是为了：1) 单元测试可注入 mock；2) 落盘原始报文日志（认证与对账的依据）。
 */
import iconv from 'iconv-lite';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export type Transport = (operation: string, requestXml: string, timeoutMs: number) => Promise<string>;

export interface HttpTransportOptions {
  baseUrl: string;
  /** 原始报文日志目录；不传则不落盘 */
  logDir?: string;
}

/** 按 ISO-8859-1 对表单参数做百分号编码（URLSearchParams 只支持 UTF-8，不能用） */
function encodeFormLatin1(params: Record<string, string>): string {
  const encodeValue = (value: string) =>
    Array.from(iconv.encode(value, 'latin1'))
      .map(b => {
        const c = String.fromCharCode(b);
        return /[A-Za-z0-9\-_.~]/.test(c) ? c : '%' + b.toString(16).toUpperCase().padStart(2, '0');
      })
      .join('');
  return Object.entries(params).map(([k, v]) => `${k}=${encodeValue(v)}`).join('&');
}

export function createHttpTransport(opts: HttpTransportOptions): Transport {
  return async (operation, requestXml, timeoutMs) => {
    const body = encodeFormLatin1({ pOperacion: operation, pRequest: requestXml });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = new Date();
    try {
      const res = await fetch(opts.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1' },
        body,
        signal: controller.signal,
      });
      const buf = Buffer.from(await res.arrayBuffer());
      const responseXml = iconv.decode(buf, 'latin1');
      if (opts.logDir) await logExchange(opts.logDir, operation, startedAt, requestXml, responseXml);
      if (!res.ok) throw new Error(`T10 HTTP ${res.status} on ${operation}`);
      return responseXml;
    } catch (err) {
      if (opts.logDir) await logExchange(opts.logDir, operation, startedAt, requestXml, `!! ERROR: ${String(err)}`);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };
}

async function logExchange(dir: string, operation: string, startedAt: Date, req: string, res: string) {
  try {
    await mkdir(dir, { recursive: true });
    const day = startedAt.toISOString().slice(0, 10);
    const line = JSON.stringify({
      ts: startedAt.toISOString(),
      operation,
      // 登录报文含密码，脱敏后再落盘
      request: operation.toLowerCase() === 'login' ? req.replace(/<password>.*?<\/password>/, '<password>***</password>') : req,
      response: res,
    });
    await appendFile(path.join(dir, `t10-${day}.jsonl`), line + '\n');
  } catch {
    /* 日志失败不影响主流程 */
  }
}
