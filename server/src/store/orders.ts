/**
 * 本地订单库 —— confirm 成功即落库，是三件事的基础：
 * 1. cancel 归属校验（防止用 locator 枚举取消他人订单）
 * 2. confirm 超时后的状态核实（对照 getReservations）
 * 3. 每日对账
 *
 * 实现：SQLite（node:sqlite，server/data/wanli.db，已 gitignore）。
 * 首次启动时自动导入旧的 orders.json（若存在），导入后重命名为 .imported。
 */
import { readFileSync, existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { openDb } from './db.js';

export type OrderStatus =
  | 'CONFIRMED'        // confirm 成功
  | 'PENDING_UNKNOWN'  // confirm 超时，状态未知，待对账核实
  | 'CANCELLED';

export interface OrderRecord {
  id: string;
  /** 我方订单参考号（发给 T10 的 clientLocalizer） */
  clientLocalizer: string;
  /** T10 订单号 */
  locator?: string;
  status: OrderStatus;
  hotelCode?: string;
  checkIn?: string;
  checkOut?: string;
  valuedNeto?: string;
  confirmedNeto?: string;
  /** PVP confirmado — el precio que ve el partner (el neto es confidencial) */
  pvp?: string;
  /** Cuenta de partner que hizo la reserva desde el portal (null = mesa interna) */
  partnerId?: string;
  currencyCode?: string;
  priceChanged?: boolean;
  createdAt: string;
  updatedAt: string;
}

const COLS = ['id', 'clientLocalizer', 'locator', 'status', 'hotelCode', 'checkIn', 'checkOut',
  'valuedNeto', 'confirmedNeto', 'pvp', 'partnerId', 'currencyCode', 'priceChanged', 'createdAt', 'updatedAt'] as const;

function fromRow(row: any): OrderRecord {
  const o: any = {};
  for (const c of COLS) {
    if (row[c] === null || row[c] === undefined) continue;
    o[c] = c === 'priceChanged' ? Boolean(row[c]) : row[c];
  }
  return o as OrderRecord;
}

function toParams(o: OrderRecord): Record<string, string | number | null> {
  const p: Record<string, string | number | null> = {};
  for (const c of COLS) {
    const v = (o as any)[c];
    p[c] = v === undefined ? null : c === 'priceChanged' ? (v ? 1 : 0) : String(v);
  }
  return p;
}

export class OrderStore {
  private readonly db: DatabaseSync;

  constructor(dataDir = process.env.DATA_DIR ?? './server/data') {
    this.db = openDb(dataDir);
    this.importLegacyJson(path.join(dataDir, 'orders.json'));
  }

  /** 一次性迁移：旧 JSON 存量导入 SQLite 后把文件改名留档 */
  private importLegacyJson(file: string) {
    if (!existsSync(file)) return;
    try {
      const list: OrderRecord[] = JSON.parse(readFileSync(file, 'utf-8'));
      const insert = this.db.prepare(
        `INSERT OR IGNORE INTO orders (${COLS.join(',')}) VALUES (${COLS.map(c => `:${c}`).join(',')})`);
      for (const o of list) insert.run(toParams(o));
      renameSync(file, `${file}.imported`);
      console.log(`[orders] importados ${list.length} pedidos de orders.json a SQLite`);
    } catch (err) {
      console.error('[orders] fallo importando orders.json (se deja intacto):', err);
    }
  }

  create(fields: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>): OrderRecord {
    const now = new Date().toISOString();
    const record: OrderRecord = { id: randomUUID(), createdAt: now, updatedAt: now, ...fields };
    this.db.prepare(
      `INSERT INTO orders (${COLS.join(',')}) VALUES (${COLS.map(c => `:${c}`).join(',')})`,
    ).run(toParams(record));
    return record;
  }

  update(id: string, patch: Partial<OrderRecord>): OrderRecord | undefined {
    const cur = this.get(id);
    if (!cur) return undefined;
    const next: OrderRecord = { ...cur, ...patch, id: cur.id, updatedAt: new Date().toISOString() };
    this.db.prepare(
      `UPDATE orders SET ${COLS.filter(c => c !== 'id').map(c => `${c} = :${c}`).join(', ')} WHERE id = :id`,
    ).run(toParams(next));
    return next;
  }

  get(id: string): OrderRecord | undefined {
    const row = this.db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    return row ? fromRow(row) : undefined;
  }

  findByLocator(locator: string): OrderRecord | undefined {
    const row = this.db.prepare('SELECT * FROM orders WHERE locator = ?').get(locator);
    return row ? fromRow(row) : undefined;
  }

  findByClientLocalizer(clientLocalizer: string): OrderRecord | undefined {
    const row = this.db.prepare('SELECT * FROM orders WHERE clientLocalizer = ?').get(clientLocalizer);
    return row ? fromRow(row) : undefined;
  }

  list(): OrderRecord[] {
    return (this.db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all() as any[]).map(fromRow);
  }

  /** Pedidos de un partner concreto (para el portal: solo se ven los propios) */
  listByPartner(partnerId: string): OrderRecord[] {
    return (this.db.prepare('SELECT * FROM orders WHERE partnerId = ? ORDER BY createdAt DESC')
      .all(partnerId) as any[]).map(fromRow);
  }

  /** 待对账的订单（confirm 超时后状态未知） */
  listPendingUnknown(): OrderRecord[] {
    return (this.db.prepare(
      "SELECT * FROM orders WHERE status = 'PENDING_UNKNOWN' ORDER BY createdAt DESC",
    ).all() as any[]).map(fromRow);
  }
}
