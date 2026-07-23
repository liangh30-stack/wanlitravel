/**
 * 本地订单库 —— confirm 成功即落库，是三件事的基础：
 * 1. cancel 归属校验（防止用 locator 枚举取消他人订单）
 * 2. confirm 超时后的状态核实（对照 getReservations）
 * 3. 每日对账
 *
 * 骨架实现为单文件 JSON 存储（server/data/orders.json，已 gitignore）。
 * 生产环境替换为 Postgres/SQLite 时只需重写本文件，接口保持不变。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

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
  currencyCode?: string;
  priceChanged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export class OrderStore {
  private orders = new Map<string, OrderRecord>();
  private readonly file: string;

  constructor(dataDir = './server/data') {
    this.file = path.join(dataDir, 'orders.json');
    if (existsSync(this.file)) {
      try {
        const list: OrderRecord[] = JSON.parse(readFileSync(this.file, 'utf-8'));
        for (const o of list) this.orders.set(o.id, o);
      } catch {
        console.error('[orders] 订单文件损坏，从空库启动（原文件保留）');
      }
    } else {
      mkdirSync(path.dirname(this.file), { recursive: true });
    }
  }

  private persist() {
    writeFileSync(this.file, JSON.stringify([...this.orders.values()], null, 2));
  }

  create(fields: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>): OrderRecord {
    const now = new Date().toISOString();
    const record: OrderRecord = { id: randomUUID(), createdAt: now, updatedAt: now, ...fields };
    this.orders.set(record.id, record);
    this.persist();
    return record;
  }

  update(id: string, patch: Partial<OrderRecord>): OrderRecord | undefined {
    const cur = this.orders.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id: cur.id, updatedAt: new Date().toISOString() };
    this.orders.set(id, next);
    this.persist();
    return next;
  }

  findByLocator(locator: string): OrderRecord | undefined {
    for (const o of this.orders.values()) if (o.locator === locator) return o;
    return undefined;
  }

  findByClientLocalizer(clientLocalizer: string): OrderRecord | undefined {
    for (const o of this.orders.values()) if (o.clientLocalizer === clientLocalizer) return o;
    return undefined;
  }

  list(): OrderRecord[] {
    return [...this.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** 待对账的订单（confirm 超时后状态未知） */
  listPendingUnknown(): OrderRecord[] {
    return this.list().filter(o => o.status === 'PENDING_UNKNOWN');
  }
}
