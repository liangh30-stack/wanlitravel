# TourDiez (T10) 对接层

TourDiez「Sirio Integration Web Services」的服务端 adapter：把 XML over HTTP POST 的老式接口，翻译成前端可用的 JSON API。**T10 凭证只存在于服务端，前端永远不直连。**

文档依据：`DOCU_APIs_TOURDIEZ_SP.zip`（Booking v2.9.3 / Mapping v3.1.8 / Reservations v3.1.8，西班牙语）。

## 目录

```
server/
  src/t10/
    client.ts     # T10Client：login/搜索/核价/确认/取消 + Mapping + Reservations
                  #（含会话管理：M5 过期自动重登并重放一次）
    transport.ts  # HTTP 传输（ISO-8859-1 表单编码）+ 原始报文落盘日志
    xml.ts        # XML 组装/宽松解析、T10 日期格式
    codes.ts      # M1–M81 错误码表 + 处置分类（可重试/需人工/会话过期）
    types.ts      # 业务实体类型
  src/api/
    index.ts      # Express JSON API（/api/hotels/search|value|confirm|cancel）
  fixtures/       # 从官方文档提取的示例报文（已修正文档转录笔误，见下）
  test/           # 基于示例报文的单元测试
```

## 配置与运行

在项目根目录 `.env.local` 中配置（参考 `.env.example`）：

```
T10_BASE_URL=https://…      # T10 提供的服务器地址（证书/测试环境向 T10 索取）
T10_USER=…
T10_PASSWORD=…
T10_LOG_DIR=./logs/t10      # 原始报文日志目录（认证与对账依据）
```

```bash
npm run server:dev    # 启动 JSON API（默认 :3001）
npm run server:test   # 跑单元测试（无需凭证，用文档示例报文）
npm run server:lint   # 服务端类型检查
```

## 测试环境（T10 提供，2026-07-31）

| 模块 | URL |
|---|---|
| Booking 2.9 | `http://testapi.tourdiez.com/2.9/booking/ApiServlet.Srv` |
| Reservations 3.1 | `http://testapi.tourdiez.com/3.1/reservations/ApiServlet.Srv` |
| Mapping 3.1 | `http://testapi.tourdiez.com/3.1/mapping/ApiServlet.Srv` |

三个模块共用同一组测试凭证（经一次性链接发放，只放 `.env.local`）。

测试环境须知：

- **可搜索数据只有**：城市 `ES00634`（马拉加）与 4 家酒店 `Mlg0846, Mlg1295, Mlg1141, Mlg0902`（含认证所需全部价目）。建议搜索多种天数（4/5/6 晚）并提前数月。
- **NS 取消政策**：正式环境下少数可用性响应的取消政策为 `NS`（Next Step，须核价后才知道）；**测试环境下 100% 返回 NS**。因此取消政策的各种取值只能在 `value`（核价）响应中测试。代码已按此处理：可用性响应带 `cancelPoliciesPending: true` 标记，核价响应为取消政策的权威来源。

## 预订链路（必须按此顺序）

1. `getAccommodationAvail` — 查房态报价（T10 侧默认 30s 超时），`retrieveCancelPolicies` 默认开启
2. `value` — **用户确认下单前必须重新核价**（间隔太久会收 M12），核价有时效
3. `confirm` — 默认 150s 超时；返回 M1 也可能改价，`/api/hotels/confirm` 会用 `expectedNeto` 比对并返回 `priceChanged`
4. `cancel` — 先 `execute:false` 查取消费用，再 `execute:true` 实际取消

### ⚠ confirm 超时的处理（防双重预订）

confirm 网络超时会抛 `ConfirmTimeoutError`（API 返回 504 + `CONFIRM_TIMEOUT`）。此时订单状态未知，**不能直接重试**：先用 `getReservations` 按 `clientLocalizer` 查订单是否已生成，确认不存在才可重发。

## 错误码处置

`T10Error` 携带三个标记：`isSessionExpired`（M5，client 内部已自动重登）、`isRetryable`（M3/M4/M30）、`needsManualHandling`（M40/M41/M60/M81，转人工，API 返回 409）。完整码表见 `codes.ts`。

## 已验证（entorno TEST, 2026-08-04）

- ✔ Ciclo completo Booking: login → avail (ES00634, 5 ofertas) → value (políticas
  reales por tramos) → confirm (locator 1031120) → getReservations/Details → cancel
  （el último cancel dio un M3 puntual y funcionó al reintentar — M3 es reintentable）
- ✔ Mapping: getAllHotels paginado (801 hoteles), países/provincias/regímenes/categorías,
  getHotelDetails (campo `hotelID`). `getCities` responde "sin datos" incluso con
  provinceCode+countryCode correctos — pendiente confirmar con T10 si es limitación del test
- ✔ Conciliación: `server/scripts/reconcile.ts` (cron diario en producción)
- Scripts: `smoke.ts` / `cert-booking.ts` / `cancel-retry.ts` / `mapping-smoke.ts` / `reconcile.ts`
  — todos con `npx tsx --env-file=.env.local server/scripts/<script>.ts`

## 目的地目录（Mapping 同步）

搜索页的目的地下拉框**不再手写** —— 由 `sync-mapping.ts` 从 Mapping 模块拉取
全量酒店目录，按城市聚合后写入 SQLite（`destinations` 表），API 直接读该表：

```bash
npx tsx --env-file=.env.local server/scripts/sync-mapping.ts            # 全部国家
npx tsx --env-file=.env.local server/scripts/sync-mapping.ts --country=ES
```

测试环境实测：801 家酒店 → **237 个城市**（ES 205 / PT 32），前五名为
Benidorm(63)、Torremolinos(29)、Benalmádena Costa(25)、Fuengirola(25)、
La Manga(22)。建议生产环境每周跑一次 cron。

⚠ 注意：测试环境**只有 ES00634（Torremolinos）挂了价格**，其余城市搜索会
正常返回"无可用房态"。这是数据限制而非代码问题。

`/api/hotels/destinations` 的优先级：同步表 → `T10_DESTINATIONS` 手写列表 → 演示数据。

## 尚未实现

- 对账任务的自动调度（脚本已就绪，需接 cron）与状态告警
- 酒店详情（getHotelDetails）的本地缓存与图片同步
- T10 认证（certificación）表单/Excel 的正式提交

## 关于 fixtures

示例报文提取自官方 Word 文档，文档本身存在转录笔误（`</commission>`、孤立 `</eMail>`、`</comfirm>`、截断的结尾等），fixtures 已修正为合法 XML；真实接口响应不应包含这些错误，但 `xml.ts` 的解析器仍保持宽松模式以防万一。
