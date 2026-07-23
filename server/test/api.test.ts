/** 订单库与输入校验的单元测试。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { OrderStore } from '../src/store/orders.js';
import { searchSchema, confirmSchema, cancelSchema } from '../src/api/schemas.js';

test('OrderStore: 创建/查询/更新/持久化', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'orders-'));
  const store = new OrderStore(dir);
  const o = store.create({ clientLocalizer: 'WL-001', locator: 'LOC123', status: 'CONFIRMED' });
  assert.equal(store.findByLocator('LOC123')?.id, o.id);
  assert.equal(store.findByClientLocalizer('WL-001')?.id, o.id);
  store.update(o.id, { status: 'CANCELLED' });
  // 重新加载验证持久化
  const store2 = new OrderStore(dir);
  assert.equal(store2.findByLocator('LOC123')?.status, 'CANCELLED');
});

test('OrderStore: listPendingUnknown 只返回待对账订单', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'orders-'));
  const store = new OrderStore(dir);
  store.create({ clientLocalizer: 'A', status: 'CONFIRMED' });
  store.create({ clientLocalizer: 'B', status: 'PENDING_UNKNOWN' });
  const pending = store.listPendingUnknown();
  assert.equal(pending.length, 1);
  assert.equal(pending[0].clientLocalizer, 'B');
});

test('searchSchema: 拒绝过去的入住日期与颠倒的日期区间', () => {
  const base = { rooms: [{ adults: 2, children: 0, units: 1 }] };
  assert.throws(() => searchSchema.parse({ ...base, checkIn: '2020-01-01', checkOut: '2020-01-05' }));
  assert.throws(() => searchSchema.parse({ ...base, checkIn: '2030-01-05', checkOut: '2030-01-01' }));
  assert.doesNotThrow(() => searchSchema.parse({ ...base, checkIn: '2030-01-01', checkOut: '2030-01-05' }));
});

test('searchSchema: 有儿童必须给年龄', () => {
  assert.throws(() => searchSchema.parse({
    checkIn: '2030-01-01', checkOut: '2030-01-05',
    rooms: [{ adults: 2, children: 1, units: 1 }],
  }));
});

test('confirmSchema: 必填 clientLocalizer 与至少一名旅客', () => {
  const valid = {
    idOperation: 'op', code: '123', idDistributions: 'd',
    clientLocalizer: 'WL-1',
    clients: [{ age: 30, name: 'A', firstSurname: 'B' }],
  };
  assert.doesNotThrow(() => confirmSchema.parse(valid));
  assert.throws(() => confirmSchema.parse({ ...valid, clients: [] }));
  assert.throws(() => confirmSchema.parse({ ...valid, clientLocalizer: '' }));
});

test('cancelSchema: locator 必填且限长', () => {
  assert.throws(() => cancelSchema.parse({}));
  assert.throws(() => cancelSchema.parse({ locator: 'x'.repeat(61) }));
  assert.doesNotThrow(() => cancelSchema.parse({ locator: 'LOC1' }));
});
