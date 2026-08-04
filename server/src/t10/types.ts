/** TourDiez (T10) 主要业务实体类型。基于文档 v2.9.3 (Booking) / v3.1.8 (Mapping, Reservations) 的示例报文整理。 */

/* ── 搜索 ─────────────────────────────────────────── */

export interface RoomRequest {
  adults: number;
  children: number;
  /** 有儿童时必填 */
  firstChildAge?: number;
  secondChildAge?: number;
  /** 相同配置的房间数 */
  units: number;
}

export interface AvailabilitySearch {
  /** 入住日期 */
  checkIn: Date | string;
  /** 退房日期 */
  checkOut: Date | string;
  /** true = 只要即时确认（不含 on request） */
  onlyConfirmed?: boolean;
  /** true = 返回结构化取消政策（强烈建议开启，欧盟销售必须向客人展示） */
  retrieveCancelPolicies?: boolean;
  /** 最多支持 room1..room3 */
  rooms: RoomRequest[];
  /** 目的地/酒店过滤，二选一 */
  destinationCode?: string;
  hotelCodes?: string[];
}

export interface CancelPolicy {
  from?: string;
  amount?: string;
  raw?: unknown;
}

/**
 * 结构化取消政策（Booking §structuredCancelPolicies）。
 * calculationType === 'NS'（Next Step）表示本步骤未能取回政策，
 * 必须在 value（核价）步骤重新获取 —— 测试环境下可用性响应几乎 100% 返回 NS。
 */
export interface StructuredCancelPolicy {
  /** 入住前 N 小时起适用本政策；NS 时为 9999 */
  hoursFrom?: string;
  /** NS / 1N / 2N / …（按前 N 晚计算） */
  calculationType?: string;
  /** PJ = 百分比；MD = 金额 */
  amountType?: string;
  amount?: string;
  raw?: unknown;
}

export interface RoomOffer {
  code: string;
  name?: string;
  units?: number;
  adults?: number;
  children?: number;
  /** 零售价 */
  pvp?: string;
  /** 净价（B2B 结算价） */
  neto?: string;
  observations?: unknown;
}

export interface AccommodationOffer {
  /** T10 酒店/产品编码 */
  code: string;
  name?: string;
  /** 星级/类别（如 "4"） */
  category?: string;
  /** 餐型编码，如 SA（只住宿） */
  mealPlan?: string;
  pvp?: string;
  neto?: string;
  currencyCode?: string;
  /** SALE = 即时确认；ON_REQUEST = 需请求确认 */
  status?: string;
  /** 后续 value 调用需要的房型分配串 */
  idDistributions?: string;
  rooms: RoomOffer[];
  cancelPolicies?: CancelPolicy[];
  structuredCancelPolicies?: StructuredCancelPolicy[];
  /** true = 本步骤未能取回取消政策（NS），需在 value 步骤获取后才能展示 */
  cancelPoliciesPending?: boolean;
  /** 城市名（可用性响应的 cityName） */
  cityName?: string;
  raw?: unknown;
}

export interface AvailabilityResponse {
  /** 后续 value/confirm 必须回传的操作标识 */
  idOperation: string;
  accommodations: AccommodationOffer[];
  timeStamp?: string;
}

/* ── 核价 / 确认 / 取消 ───────────────────────────── */

export interface ValueRequest {
  idOperation: string;
  /** 所选酒店编码 */
  code: string;
  /** 从可用性响应中原样取出的 idDistributions */
  idDistributions: string;
}

export interface ValuedReservation {
  idOperation: string;
  code?: string;
  mealPlan?: string;
  pvp?: string;
  neto?: string;
  currencyCode?: string;
  status?: string;
  rooms: RoomOffer[];
  cancelPolicies?: CancelPolicy[];
  structuredCancelPolicies?: StructuredCancelPolicy[];
  raw?: unknown;
}

export interface Passenger {
  age: number;
  /** 证件号，可空 */
  dni?: string;
  name: string;
  firstSurname: string;
  secondSurname?: string;
}

export interface ConfirmRequest {
  idOperation: string;
  /** 所选酒店编码（与 value 一致） */
  code: string;
  /** 从可用性响应中原样取出的 idDistributions */
  idDistributions: string;
  /** 你方订单参考号（clientLocalizer，对账用，强烈建议必填） */
  clientLocalizer: string;
  /** 给酒店的备注，如 "Cama de matrimonio" */
  remarksForProvider?: string;
  clients: Passenger[];
  /** 开票制度，示例值 E */
  invoicingRegime?: string;
}

export interface ConfirmedReservation {
  /** T10 订单号（localizador），取消/查询都用它 */
  locator: string;
  status?: string;
  /** 最终成交价 —— 必须与核价比对（M1 可能带价格变动） */
  pvp?: string;
  neto?: string;
  currencyCode?: string;
  raw?: unknown;
}

export interface CancelRequest {
  locator: string;
  /** false = 只查询取消费用；true = 实际执行取消 */
  execute: boolean;
}

export interface CancellationOutcome {
  locator: string;
  /** 取消费用 */
  cancellationCost?: string;
  currencyCode?: string;
  cancelled: boolean;
  raw?: unknown;
}

/* ── Mapping 静态数据 ─────────────────────────────── */

export interface T10Hotel {
  code: string;
  name?: string;
  category?: string;
  countryCode?: string;
  provinceCode?: string;
  cityCode?: string;
  address?: string;
  raw?: unknown;
}

export interface CodeName { code: string; name: string; raw?: unknown }

/* ── Reservations 对账 ────────────────────────────── */

export interface ReservationSummary {
  locator?: string;
  clientReference?: string;
  status?: string;
  checkIn?: string;
  checkOut?: string;
  pvp?: string;
  neto?: string;
  raw?: unknown;
}
