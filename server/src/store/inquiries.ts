/**
 * 询盘存储 —— 表单提交落库（合作伙伴申请 / 路线报价请求）。
 * 实现：SQLite（node:sqlite，与订单同库 server/data/wanli.db）。
 * 首次启动时自动导入旧的 inquiries.json（若存在），导入后重命名为 .imported。
 *
 * GDPR 注意：这里存的是个人数据（姓名可能出现在留言里、公司邮箱）。
 * 保留期与删除义务见 /privacy 页面声明，收到删除请求时按 id 删除即可。
 */
import { readFileSync, existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { openDb } from './db.js';

export interface InquiryRecord {
  id: string;
  type: 'partner' | 'quote';
  companyName: string;
  businessType?: string;
  workEmail: string;
  region?: string;
  monthlyPax?: string;
  message?: string;
  /** 报价请求关联的路线编码（如 ES-AD02） */
  routeCode?: string;
  language?: string;
  consentAt: string;   // GDPR 同意时间戳
  createdAt: string;
  handled: boolean;
}

const COLS = ['id', 'type', 'companyName', 'businessType', 'workEmail', 'region',
  'monthlyPax', 'message', 'routeCode', 'language', 'consentAt', 'createdAt', 'handled'] as const;

function fromRow(row: any): InquiryRecord {
  const o: any = {};
  for (const c of COLS) {
    if (row[c] === null || row[c] === undefined) continue;
    o[c] = c === 'handled' ? Boolean(row[c]) : row[c];
  }
  return o as InquiryRecord;
}

function toParams(o: InquiryRecord): Record<string, string | number | null> {
  const p: Record<string, string | number | null> = {};
  for (const c of COLS) {
    const v = (o as any)[c];
    p[c] = v === undefined ? null : c === 'handled' ? (v ? 1 : 0) : String(v);
  }
  return p;
}

export class InquiryStore {
  private readonly db: DatabaseSync;

  constructor(dataDir = process.env.DATA_DIR ?? './server/data') {
    this.db = openDb(dataDir);
    this.importLegacyJson(path.join(dataDir, 'inquiries.json'));
  }

  private importLegacyJson(file: string) {
    if (!existsSync(file)) return;
    try {
      const list: InquiryRecord[] = JSON.parse(readFileSync(file, 'utf-8'));
      const insert = this.db.prepare(
        `INSERT OR IGNORE INTO inquiries (${COLS.join(',')}) VALUES (${COLS.map(c => `:${c}`).join(',')})`);
      for (const i of list) insert.run(toParams(i));
      renameSync(file, `${file}.imported`);
      console.log(`[inquiries] importadas ${list.length} inquiries de inquiries.json a SQLite`);
    } catch (err) {
      console.error('[inquiries] fallo importando inquiries.json (se deja intacto):', err);
    }
  }

  create(fields: Omit<InquiryRecord, 'id' | 'createdAt' | 'handled'>): InquiryRecord {
    const record: InquiryRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      handled: false,
      ...fields,
    };
    this.db.prepare(
      `INSERT INTO inquiries (${COLS.join(',')}) VALUES (${COLS.map(c => `:${c}`).join(',')})`,
    ).run(toParams(record));
    return record;
  }

  list(): InquiryRecord[] {
    return (this.db.prepare('SELECT * FROM inquiries ORDER BY createdAt DESC').all() as any[]).map(fromRow);
  }

  markHandled(id: string): boolean {
    const res = this.db.prepare('UPDATE inquiries SET handled = 1 WHERE id = ?').run(id);
    return Number(res.changes) > 0;
  }

  /** GDPR 删除请求 */
  delete(id: string): boolean {
    const res = this.db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    return Number(res.changes) > 0;
  }
}
