/**
 * 询盘存储 —— 表单提交落库（合作伙伴申请 / 路线报价请求）。
 * 与 OrderStore 相同的文件型骨架实现（server/data/inquiries.json，已 gitignore），
 * 生产环境可换 Postgres/SQLite，接口不变。
 *
 * GDPR 注意：这里存的是个人数据（姓名可能出现在留言里、公司邮箱）。
 * 保留期与删除义务见 /privacy 页面声明，收到删除请求时按 id 删除即可。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

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

export class InquiryStore {
  private items = new Map<string, InquiryRecord>();
  private readonly file: string;

  constructor(dataDir = './server/data') {
    this.file = path.join(dataDir, 'inquiries.json');
    if (existsSync(this.file)) {
      try {
        const list: InquiryRecord[] = JSON.parse(readFileSync(this.file, 'utf-8'));
        for (const i of list) this.items.set(i.id, i);
      } catch {
        console.error('[inquiries] 询盘文件损坏，从空库启动（原文件保留）');
      }
    } else {
      mkdirSync(path.dirname(this.file), { recursive: true });
    }
  }

  private persist() {
    writeFileSync(this.file, JSON.stringify([...this.items.values()], null, 2));
  }

  create(fields: Omit<InquiryRecord, 'id' | 'createdAt' | 'handled'>): InquiryRecord {
    const record: InquiryRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      handled: false,
      ...fields,
    };
    this.items.set(record.id, record);
    this.persist();
    return record;
  }

  list(): InquiryRecord[] {
    return [...this.items.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  markHandled(id: string): boolean {
    const cur = this.items.get(id);
    if (!cur) return false;
    cur.handled = true;
    this.persist();
    return true;
  }

  /** GDPR 删除请求 */
  delete(id: string): boolean {
    const ok = this.items.delete(id);
    if (ok) this.persist();
    return ok;
  }
}
