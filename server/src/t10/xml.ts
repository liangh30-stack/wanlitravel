/**
 * XML 组装/解析工具。
 *
 * T10 接口约定（Booking 文档 §2.1.1）：
 * - HTTP POST，参数 pOperacion（操作名）+ pRequest（XML 报文）
 * - 编码为 ISO-8859-1
 * - 文档承诺后续版本只增加标签、不删除/改名 → 解析必须容忍未知字段
 * - 官方文档示例本身存在标签笔误（如 <comision>…</commission>），解析器开启宽松模式
 */
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,       // 全部按字符串取值，由类型层自行转换，避免 "090" 变 90 等问题
  trimValues: true,
  isArray: (name) =>
    // 这些标签在响应里可能出现 0..n 次，强制数组化，避免单元素时解析成对象
    ['accomodation', 'room', 'hotel', 'category', 'mealPlan', 'country',
     'zone', 'province', 'city', 'reservation', 'cancelPolicy', 'policy',
     'cancelPolicie', 'structuredCancelPolicie', 'restriction',
     'supplement', 'discount', 'observation', 'distribution'].includes(name),
});

const builder = new XMLBuilder({
  ignoreAttributes: true,
  format: false,
  suppressEmptyNode: false,
});

const XML_DECL = '<?xml version="1.0" encoding="ISO-8859-1"?>';

/** 将 JS 对象组装为带声明的请求 XML。undefined 字段自动跳过。 */
export function buildRequestXml(rootTag: string, body: Record<string, unknown>): string {
  const clean = prune(body);
  return XML_DECL + builder.build({ [rootTag]: clean });
}

function prune(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(prune);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = prune(v);
    }
    return out;
  }
  return value;
}

/** 宽松解析响应 XML，返回根节点内容。 */
export function parseResponseXml<T = any>(xml: string, expectedRoot?: string): T {
  const doc = parser.parse(sanitize(xml));
  if (expectedRoot && doc[expectedRoot] !== undefined) return doc[expectedRoot] as T;
  // 根标签大小写在文档中并不完全一致（如 SessionID/sessionID），取第一个非声明节点
  const keys = Object.keys(doc).filter(k => !k.startsWith('?'));
  return doc[keys[0]] as T;
}

/**
 * 清理已知的报文脏数据：
 * - 官方示例/历史响应中出现过的未闭合或错拼标签
 * - BOM、非法控制字符
 */
function sanitize(xml: string): string {
  return xml
    .replace(/^﻿/, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
}

/** 从任意响应对象中取出标准 result 块（cod_result/des_result）。 */
export function extractResult(parsed: any): { cod_result: string; des_result: string; type_message?: string } {
  const r = parsed?.result ?? {};
  return {
    cod_result: String(r.cod_result ?? ''),
    des_result: String(r.des_result ?? ''),
    type_message: r.type_message ? String(r.type_message) : undefined,
  };
}

/** T10 日期格式：DDMMYYYY（如 22062012）
 *
 * ⚠ 一个 'YYYY-MM-DD' 字符串会被 new Date() 解析成 UTC 午夜；若再用本地
 * getDate()/getMonth() 取值，在 UTC 以西的时区会整整差一天（如纽约 → 前一天）。
 * 因此对 'YYYY-MM-DD' 直接按字面拆分，不经过 Date；只有传入 Date 对象时才用本地字段。
 */
export function toT10Date(d: Date | string): string {
  if (typeof d === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
    if (m) return `${m[3]}${m[2]}${m[1]}`;
  }
  const date = typeof d === 'string' ? new Date(d) : d;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}${mm}${date.getFullYear()}`;
}
