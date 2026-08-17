/**
 * T10 客户端单元测试 — 基于官方文档提取的示例报文（server/fixtures/）。
 * 运行：npm run server:test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { T10Client } from '../src/t10/client.js';
import { T10Error } from '../src/t10/codes.js';
import { parseResponseXml, extractResult, buildRequestXml, toT10Date } from '../src/t10/xml.js';
import type { Transport } from '../src/t10/transport.js';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const fx = (name: string) => readFileSync(path.join(fixturesDir, name), 'utf-8');

/** 用固定应答序列构造 mock transport，并记录每次请求 */
function mockTransport(responses: string[]) {
  const calls: Array<{ operation: string; xml: string }> = [];
  let i = 0;
  const transport: Transport = async (operation, xml) => {
    calls.push({ operation, xml });
    if (i >= responses.length) throw new Error(`mock transport: 第 ${i + 1} 次调用没有预置应答`);
    return responses[i++];
  };
  return { transport, calls };
}

function makeClient(responses: string[]) {
  const { transport, calls } = mockTransport(responses);
  return { client: new T10Client({ user: 'USUARIO000', password: 'PWD0000', transport }), calls };
}

/* ── XML 工具 ─────────────────────────────────── */

test('toT10Date 输出 DDMMYYYY', () => {
  assert.equal(toT10Date(new Date(2026, 5, 22)), '22062026');
});

test('buildRequestXml 携带 ISO-8859-1 声明并跳过 undefined 字段', () => {
  const xml = buildRequestXml('Login', { user: 'U', password: 'P', skip: undefined });
  assert.match(xml, /^<\?xml version="1.0" encoding="ISO-8859-1"\?>/);
  assert.match(xml, /<user>U<\/user>/);
  assert.ok(!xml.includes('skip'));
});

test('parseResponseXml 解析文档示例 LoginResult', () => {
  const parsed = parseResponseXml(fx('booking_LoginResult.xml'));
  assert.equal(extractResult(parsed).cod_result, 'M1');
  assert.equal(parsed.sessionID, '58ace5e3-d0b6-4b0f-8c11-018cdd3440fc');
});

/* ── 会话管理 ─────────────────────────────────── */

test('login 提取 sessionID；会话制调用自动附带', async () => {
  const { client, calls } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_AccomodationInfoResult_empty.xml'),
  ]);
  await client.getAccommodationAvail({
    checkIn: new Date(2026, 5, 22), checkOut: new Date(2026, 5, 26),
    rooms: [{ adults: 2, children: 0, units: 1 }],
  });
  assert.equal(calls[0].operation, 'login');
  assert.equal(calls[1].operation, 'getAccomodationAvail');
  assert.match(calls[1].xml, /<sessionID>58ace5e3-d0b6-4b0f-8c11-018cdd3440fc<\/sessionID>/);
});

test('遇 M5 会话过期时自动重新登录并重放一次', async () => {
  const m5 = `<?xml version="1.0" encoding="ISO-8859-1"?><AccomodationInfoResult><result><cod_result>M5</cod_result><des_result>Sesion caducada</des_result></result></AccomodationInfoResult>`;
  const { client, calls } = makeClient([
    fx('booking_LoginResult.xml'),   // 首次登录
    m5,                              // 会话过期
    fx('booking_LoginResult.xml'),   // 重新登录
    fx('booking_AccomodationInfoResult_empty.xml'), // 重放成功
  ]);
  const result = await client.getAccommodationAvail({
    checkIn: new Date(2026, 5, 22), checkOut: new Date(2026, 5, 26),
    rooms: [{ adults: 2, children: 0, units: 1 }],
  });
  assert.equal(calls.length, 4);
  assert.deepEqual(calls.map(c => c.operation), ['login', 'getAccomodationAvail', 'login', 'getAccomodationAvail']);
  assert.deepEqual(result.accommodations, []);
});

test('业务错误抛出 T10Error 且携带处置标记', async () => {
  const m41 = `<?xml version="1.0" encoding="ISO-8859-1"?><CancellationResult><result><cod_result>M41</cod_result><des_result>gastos de cancelacion</des_result></result></CancellationResult>`;
  const { client } = makeClient([fx('booking_LoginResult.xml'), m41]);
  await assert.rejects(
    () => client.cancel({ locator: '159413', execute: true }),
    (err: unknown) => {
      assert.ok(err instanceof T10Error);
      assert.equal(err.code, 'M41');
      assert.equal(err.needsManualHandling, true);
      assert.equal(err.isRetryable, false);
      return true;
    },
  );
});

/* ── 搜索/核价/确认/取消 请求构造 ───────────────── */

test('getAccommodationAvail 请求含 room1..n、日期与取消政策开关', async () => {
  const { client, calls } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_AccomodationInfoResult_empty.xml'),
  ]);
  await client.getAccommodationAvail({
    checkIn: new Date(2026, 5, 22), checkOut: new Date(2026, 5, 26),
    rooms: [
      { adults: 2, children: 2, firstChildAge: 6, secondChildAge: 11, units: 1 },
      { adults: 2, children: 0, units: 2 },
    ],
  });
  const xml = calls[1].xml;
  assert.match(xml, /<initialDate>22062026<\/initialDate>/);
  assert.match(xml, /<finalDate>26062026<\/finalDate>/);
  assert.match(xml, /<retrieveCancelPolicies>true<\/retrieveCancelPolicies>/);
  assert.match(xml, /<room1>.*<adult>2<\/adult>.*<firstChildAge>6<\/firstChildAge>.*<\/room1>/s);
  assert.match(xml, /<room2>.*<units>2<\/units>.*<\/room2>/s);
});

test('搜索超过 3 组房间配置时直接拒绝', async () => {
  const { client } = makeClient([fx('booking_LoginResult.xml')]);
  await assert.rejects(() => client.getAccommodationAvail({
    checkIn: '2026-06-22', checkOut: '2026-06-26',
    rooms: Array(4).fill({ adults: 2, children: 0, units: 1 }),
  }), /1–3 组/);
});

test('value 解析文档示例响应中的价格', async () => {
  const { client, calls } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_ReservationValueResult.xml'),
  ]);
  const valued = await client.value({
    idOperation: 'Drej3434sd8s7df9sl=',
    code: '12563',
    idDistributions: '4,6,3,2,11,2,5,3,14.CPM2425.232-2SA22SDF45IOSO=DB285.122-0SA221234JIOSO=',
  });
  assert.match(calls[1].xml, /<IdOperation>Drej3434sd8s7df9sl=<\/IdOperation>/);
  assert.equal(valued.code, '12563');
  assert.equal(valued.pvp, '1207.36');
  assert.equal(valued.neto, '1122.85');
  assert.equal(valued.currencyCode, 'EUR');
  assert.equal(valued.status, 'SALE');
});

test('confirm 构造 clients 结构并解析 localizer 与成交价', async () => {
  const { client, calls } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_reservationConfirmResult.xml'),
  ]);
  const confirmed = await client.confirm({
    idOperation: 'Drej3434sd8s7df9sl=',
    code: '12563',
    idDistributions: '4,6,3,2,11,2,5,3,14.CPM2425.232-2SA22SDF45IOSO=DB285.122-0SA221234JIOSO=',
    clientLocalizer: '65B287',
    remarksForProvider: 'Cama de matrimonio',
    clients: [{ age: 30, name: 'Alejandra', firstSurname: 'Alonso', secondSurname: 'Sanchez' }],
    invoicingRegime: 'E',
  });
  const xml = calls[1].xml;
  assert.match(xml, /<clientLocalizer>65B287<\/clientLocalizer>/);
  assert.match(xml, /<clients><client>.*<name>Alejandra<\/name>.*<\/client><\/clients>/s);
  assert.equal(confirmed.locator, '343jsoisdf=');
  assert.equal(confirmed.pvp, '1207.36');
  assert.equal(confirmed.neto, '1122.85');
});

test('cancel: execute=false 发送 confirm=0 仅查询费用', async () => {
  const { client, calls } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_CancellationResult.xml'),
  ]);
  const outcome = await client.cancel({ locator: '159413', execute: false });
  assert.match(calls[1].xml, /<confirm>0<\/confirm>/);
  assert.match(calls[1].xml, /<localizer>159413<\/localizer>/);
  assert.equal(outcome.cancellationCost, '50');
  assert.equal(outcome.currencyCode, 'EUR');
  assert.equal(outcome.cancelled, false);
});

/* ── Mapping / Reservations（user+password 直接鉴权）── */

test('getReservations 使用 user/password 而非 session，日期为 dd/mm/yyyy', async () => {
  const { client, calls } = makeClient([fx('reservations_getReservationsResult.xml')]);
  await client.getReservations({ initialBookingDate: '01/01/2026', finalBookingDate: '15/01/2026' });
  assert.equal(calls.length, 1); // 不需要 login
  assert.match(calls[0].xml, /<user>USUARIO000<\/user>/);
  assert.match(calls[0].xml, /<initialBookingDate>01\/01\/2026<\/initialBookingDate>/);
});

test('getCountries 解析文档示例静态数据', async () => {
  const { client } = makeClient([fx('mapping_CountriesResult.xml')]);
  const countries = await client.getCountries();
  assert.ok(countries.length > 0, '应解析出至少一个国家');
  assert.ok(countries[0].code, '国家应有编码');
});

/* ── 可用性响应：distributions 展开与取消政策 ────── */

test('可用性响应按 distribution 展开为报价，价格与 idDistributions 取自 distribution 层', async () => {
  const { client } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_AccomodationInfoResult.xml'),
  ]);
  const res = await client.getAccommodationAvail({
    checkIn: '2026-09-10', checkOut: '2026-09-14',
    rooms: [{ adults: 2, children: 0, units: 1 }],
    destinationCode: 'ES00634',
  });
  assert.equal(res.accommodations.length, 2); // 1 家酒店 × 2 个 distribution
  const [d1, d2] = res.accommodations;
  assert.equal(d1.code, '12563');
  assert.equal(d1.name, 'Villa Rosario');
  assert.equal(d1.category, '3');
  assert.equal(d1.pvp, '1207.36');
  assert.match(d1.idDistributions!, /^4,6,3,2,11,2/);
  assert.equal(d1.rooms.length, 2);
  assert.equal(d1.status, 'SALE'); // confirmed=Y
  // 第一 distribution 有结构化政策（1N/2N），非 NS
  assert.equal(d1.structuredCancelPolicies?.length, 2);
  assert.equal(d1.structuredCancelPolicies?.[0].calculationType, '1N');
  assert.notEqual(d1.cancelPoliciesPending, true);
  // 第二 distribution 是 NS（测试环境下 100% 出现）→ 标记待核价
  assert.equal(d2.cancelPoliciesPending, true);
});

test('搜索请求按文档使用 city 与 accomodationsCode 标签', async () => {
  const { client, calls } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_AccomodationInfoResult_empty.xml'),
  ]);
  await client.getAccommodationAvail({
    checkIn: '2026-09-10', checkOut: '2026-09-14',
    rooms: [{ adults: 2, children: 0, units: 1 }],
    destinationCode: 'ES00634',
    hotelCodes: ['Mlg0846', 'Mlg1295'],
  });
  const xml = calls[1].xml;
  // Indicación de Tour10 (correo 12/08/2026): city y accomodationsCode son
  // EXCLUYENTES — con lista de hoteles se omite city — y countryCode es
  // obligatorio en toda búsqueda (aquí inferido del prefijo ES de ES00634).
  assert.match(xml, /<accomodationsCode>Mlg0846,Mlg1295<\/accomodationsCode>/);
  assert.doesNotMatch(xml, /<city>/);
  assert.match(xml, /<countryCode>ES<\/countryCode>/);
  assert.doesNotMatch(xml, /destinationCode|hotelCodes/);
});

test('value 响应携带取消政策（NS 场景的权威来源）', async () => {
  const { client } = makeClient([
    fx('booking_LoginResult.xml'),
    fx('booking_ReservationValueResult.xml'),
  ]);
  const valued = await client.value({
    idOperation: 'op', code: '12563', idDistributions: 'd',
  });
  assert.ok(valued.structuredCancelPolicies?.length, 'value 应返回结构化取消政策');
  assert.ok(valued.cancelPolicies?.length, 'value 应返回文本取消政策');
});

/* ── Regresiones de la auditoría ─────────────────── */

test('toT10Date no se desplaza un día en zonas al oeste de UTC', () => {
  // Con un string YYYY-MM-DD el resultado no debe depender de la TZ del proceso
  assert.equal(toT10Date('2026-06-22'), '22062026');
  assert.equal(toT10Date('2026-01-01'), '01012026');
});

test('máscara de password: se enmascara en operaciones distintas de login', async () => {
  const { logExchange } = await import('../src/t10/transport.js') as any;
  // getAllHotels lleva user+password en el body; el log NO debe contener la password
  const captured: string[] = [];
  const orig = console.log;
  // usamos el propio transport con un logDir temporal
  const { mkdtempSync, readFileSync, readdirSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path2 = await import('node:path');
  const dir = mkdtempSync(path2.join(tmpdir(), 't10log-'));
  const { createHttpTransport } = await import('../src/t10/transport.js');
  // transport que falla al conectar, pero igualmente registra el request
  const t = createHttpTransport({ baseUrl: 'http://127.0.0.1:1/none', logDir: dir });
  await t('getAllHotels', '<getAllHotels><user>U</user><password>SECRET123</password></getAllHotels>', 500).catch(() => {});
  const file = readdirSync(dir).find(f => f.endsWith('.jsonl'))!;
  const content = readFileSync(path2.join(dir, file), 'utf-8');
  assert.ok(!content.includes('SECRET123'), 'la password NO debe aparecer en el log');
  assert.ok(content.includes('***'), 'debe quedar enmascarada');
  void captured; void orig; void logExchange;
});

test('getAllHotels: categoría no queda como [object Object]', async () => {
  const { client } = makeClient([fx('mapping_hotelDescriptionsResult.xml')]);
  const hoteles = await client.getAllHotels({ maxPages: 1 });
  assert.ok(hoteles.length > 0);
  for (const h of hoteles) {
    if (h.category !== undefined) assert.doesNotMatch(h.category, /\[object/);
  }
});

test('getZones: los códigos no vienen vacíos (usa zoneCode)', async () => {
  const { client } = makeClient([fx('mapping_ZonesResult.xml')]);
  const zonas = await client.getZones('ES');
  assert.ok(zonas.length > 0);
  assert.ok(zonas.every(z => z.code.length > 0), 'toda zona debe traer código');
  assert.equal(zonas[0].code, 'Esg0001');
});
