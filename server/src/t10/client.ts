/**
 * T10Client — TourDiez Sirio Integration Web Services 客户端。
 *
 * 覆盖三组接口：
 * - Booking v2.9.3：login / getAccomodationAvail / value / confirm / cancel（会话制）
 * - Mapping v3.1.8：getAllHotels / getHotelDetails / … （user+password 直接鉴权）
 * - Reservations v3.1.8：getReservations / getReservationDetails（user+password 直接鉴权）
 *
 * 关键行为：
 * - 会话管理：自动登录；遇 M5（会话过期）自动重新登录并重放一次
 * - 超时：avail 默认 30s、confirm 默认 150s（认证时可向 T10 申请调整，这里留出配置）
 * - confirm 网络超时后不自动重试 —— 抛出 ConfirmTimeoutError，调用方必须先经
 *   getReservations 用 clientLocalizer 核实订单是否已生成，避免双重预订
 */
import { buildRequestXml, parseResponseXml, extractResult, toT10Date } from './xml.js';
import { T10Error, OK_CODE } from './codes.js';
import type { Transport } from './transport.js';
import type {
  AvailabilitySearch, AvailabilityResponse, AccommodationOffer, RoomOffer,
  ValueRequest, ValuedReservation, ConfirmRequest, ConfirmedReservation,
  CancelRequest, CancellationOutcome, T10Hotel, CodeName, ReservationSummary,
  CancelPolicy, StructuredCancelPolicy,
} from './types.js';

export interface T10ClientOptions {
  user: string;
  password: string;
  transport: Transport;
  timeouts?: {
    availMs?: number;    // 默认 35_000（T10 侧 30s + 余量）
    confirmMs?: number;  // 默认 155_000（T10 侧 150s + 余量）
    defaultMs?: number;  // 其他调用默认 30_000
  };
}

/** confirm 网络层超时——订单状态未知，必须对账后再决定是否重试 */
export class ConfirmTimeoutError extends Error {
  constructor(public readonly clientLocalizer: string) {
    super(`confirm 调用超时，订单状态未知（clientLocalizer=${clientLocalizer}）。` +
      `请先调用 getReservations 核实是否已生成订单，切勿直接重试。`);
    this.name = 'ConfirmTimeoutError';
  }
}

export class T10Client {
  private sessionID: string | null = null;

  constructor(private readonly opts: T10ClientOptions) {}

  private get timeouts() {
    return {
      availMs: this.opts.timeouts?.availMs ?? 35_000,
      confirmMs: this.opts.timeouts?.confirmMs ?? 155_000,
      defaultMs: this.opts.timeouts?.defaultMs ?? 30_000,
    };
  }

  /* ── 底层调用 ─────────────────────────────────── */

  private async call(operation: string, rootTag: string, body: Record<string, unknown>, timeoutMs: number): Promise<any> {
    const xml = buildRequestXml(rootTag, body);
    const responseXml = await this.opts.transport(operation, xml, timeoutMs);
    const parsed = parseResponseXml(responseXml);
    const result = extractResult(parsed);
    if (result.cod_result !== OK_CODE) {
      throw new T10Error(result.cod_result, result.des_result, operation);
    }
    return parsed;
  }

  /** 会话制调用：自动补 sessionID；M5 时重新登录并重放一次 */
  private async callWithSession(operation: string, rootTag: string, body: Record<string, unknown>, timeoutMs: number): Promise<any> {
    if (!this.sessionID) await this.login();
    try {
      return await this.call(operation, rootTag, { sessionID: this.sessionID, ...body }, timeoutMs);
    } catch (err) {
      if (err instanceof T10Error && err.isSessionExpired) {
        await this.login();
        return await this.call(operation, rootTag, { sessionID: this.sessionID, ...body }, timeoutMs);
      }
      throw err;
    }
  }

  /* ── Booking ──────────────────────────────────── */

  async login(): Promise<string> {
    const parsed = await this.call('login', 'Login', {
      user: this.opts.user,
      password: this.opts.password,
    }, this.timeouts.defaultMs);
    this.sessionID = String(parsed.sessionID ?? parsed.SessionID ?? '');
    if (!this.sessionID) throw new Error('T10 login: 响应中缺少 sessionID');
    return this.sessionID;
  }

  async getAccommodationAvail(search: AvailabilitySearch): Promise<AvailabilityResponse> {
    const body: Record<string, unknown> = {
      availabilitySearchData: {
        initialDate: toT10Date(search.checkIn),
        finalDate: toT10Date(search.checkOut),
        onlyConfirmed: search.onlyConfirmed ?? false,
        retrieveCancelPolicies: search.retrieveCancelPolicies ?? true,
        ...roomsToT10(search.rooms),
        // 文档 nota1：province / zone / city / accomodationsCode 至少填一个
        ...(search.destinationCode ? { city: search.destinationCode } : {}),
        ...(search.hotelCodes?.length ? { accomodationsCode: search.hotelCodes.join(',') } : {}),
      },
    };
    const parsed = await this.callWithSession('getAccomodationAvail', 'getAccomodationAvail', body, this.timeouts.availMs);
    return {
      idOperation: String(parsed.IdOperation ?? parsed.idOperation ?? ''),
      accommodations: normalizeAccommodations(parsed),
      timeStamp: parsed.timeStamp ? String(parsed.timeStamp) : undefined,
    };
  }

  /** 下单前必须重新核价（防 M12），核价结果有时效性 */
  async value(req: ValueRequest): Promise<ValuedReservation> {
    const parsed = await this.callWithSession('value', 'value', {
      IdOperation: req.idOperation,
      code: req.code,
      idDistributions: req.idDistributions,
    }, this.timeouts.defaultMs);
    // 注意：解析层将 reservation 强制为数组（getReservations 场景需要），这里取首个
    const reservation = toArray(parsed?.reservation)[0] ?? {};
    const acc = firstAccommodation(reservation);
    return {
      idOperation: String(reservation.IdOperation ?? req.idOperation),
      code: acc?.code,
      mealPlan: acc?.mealPlan,
      pvp: acc?.pvp,
      neto: acc?.neto,
      currencyCode: acc?.currencyCode,
      status: acc?.status,
      rooms: acc?.rooms ?? [],
      // 核价响应是取消政策的权威来源（可用性阶段可能只有 NS）
      cancelPolicies: acc?.cancelPolicies,
      structuredCancelPolicies: acc?.structuredCancelPolicies,
      raw: parsed,
    };
  }

  async confirm(req: ConfirmRequest): Promise<ConfirmedReservation> {
    let parsed: any;
    try {
      parsed = await this.callWithSession('confirm', 'confirm', {
        IdOperation: req.idOperation,
        code: req.code,
        idDistributions: req.idDistributions,
        clientLocalizer: req.clientLocalizer,
        ...(req.remarksForProvider ? { remarksForProvider: req.remarksForProvider } : {}),
        clients: {
          client: req.clients.map(c => ({
            age: c.age,
            dni: c.dni ?? '',
            name: c.name,
            firstSurname: c.firstSurname,
            secondSurname: c.secondSurname ?? '',
          })),
        },
        ...(req.invoicingRegime ? { invoicingRegime: req.invoicingRegime } : {}),
      }, this.timeouts.confirmMs);
    } catch (err) {
      // 网络层超时/中断：订单状态未知，交由调用方对账，绝不自动重试
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
        throw new ConfirmTimeoutError(req.clientLocalizer);
      }
      throw err;
    }
    const reservation = toArray(parsed?.reservation)[0] ?? {};
    const acc = firstAccommodation(reservation);
    return {
      locator: String(reservation.localizer ?? ''),
      status: acc?.status,
      pvp: acc?.pvp,     // ⚠ M1 也可能带价格变动：调用方必须与 value 结果比对
      neto: acc?.neto,
      currencyCode: acc?.currencyCode,
      raw: parsed,
    };
  }

  /**
   * 取消。execute=false 时仅查询取消费用（confirm=0），execute=true 才实际取消（confirm=1）。
   * 建议先查费用展示给用户/客服，再执行取消。
   */
  async cancel(req: CancelRequest): Promise<CancellationOutcome> {
    const parsed = await this.callWithSession('cancel', 'Cancellation', {
      localizer: req.locator,
      confirm: req.execute ? 1 : 0,
    }, this.timeouts.defaultMs);
    const c = parsed?.cancellation ?? {};
    return {
      locator: req.locator,
      cancellationCost: c.cancelCost !== undefined ? String(c.cancelCost) : undefined,
      currencyCode: c.currencyCode ? String(c.currencyCode) : undefined,
      cancelled: req.execute,
      raw: parsed,
    };
  }

  /* ── Mapping（静态数据，user/password 直接鉴权）────── */

  private credentialBody(extra: Record<string, unknown> = {}) {
    return { user: this.opts.user, password: this.opts.password, ...extra };
  }

  /**
   * Catálogo completo de hoteles. La respuesta real es paginada
   * (totalHotels / totalHotelsRetrieved / operationCode): se repite la llamada
   * pasando el operationCode devuelto hasta agotar el catálogo.
   */
  async getAllHotels(opts?: { maxPages?: number }): Promise<T10Hotel[]> {
    const out: T10Hotel[] = [];
    let operationCode = '';
    const maxPages = opts?.maxPages ?? 1000;
    for (let page = 0; page < maxPages; page++) {
      const parsed = await this.call('getAllHotels', 'getAllHotels', this.credentialBody({ operationCode }), this.timeouts.defaultMs);
      const beans = toArray(parsed?.hotelDescriptions?.hotelDescriptionsBean ?? parsed?.hotels?.hotel ?? parsed?.hotel);
      for (const h of beans) {
        out.push({
          code: String(h.hotelID ?? h.code ?? ''),
          name: h.hotelName ? String(h.hotelName) : h.name ? String(h.name) : undefined,
          category: h.category?.claveCategoria !== undefined ? String(h.category.claveCategoria) : h.category ? String(h.category) : undefined,
          countryCode: h.codeCountry ? String(h.codeCountry) : h.countryCode ? String(h.countryCode) : undefined,
          provinceCode: h.codeDistrict ? String(h.codeDistrict) : h.provinceCode ? String(h.provinceCode) : undefined,
          cityCode: h.codeCity ? String(h.codeCity) : h.cityCode ? String(h.cityCode) : undefined,
          address: h.address ? String(h.address) : undefined,
          raw: h,
        });
      }
      const total = Number(parsed?.totalHotels ?? 0);
      operationCode = String(parsed?.operationCode ?? '');
      if (!beans.length || !operationCode || out.length >= total) break;
    }
    return out;
  }

  async getHotelDetails(hotelID: string): Promise<any> {
    // 文档字段名为 hotelID（getAllHotels 响应中的 hotelID）
    return this.call('getHotelDetails', 'getHotelDetails', this.credentialBody({ hotelID }), this.timeouts.defaultMs);
  }

  async getMealPlans(): Promise<CodeName[]> {
    const parsed = await this.call('getMealPlans', 'getMealPlans', this.credentialBody(), this.timeouts.defaultMs);
    return codeNameList(parsed?.mealPlans?.mealPlan ?? parsed?.mealPlan);
  }

  async getCountries(): Promise<CodeName[]> {
    const parsed = await this.call('getCountries', 'getCountries', this.credentialBody(), this.timeouts.defaultMs);
    return codeNameList(parsed?.countries?.country ?? parsed?.country);
  }

  async getAccommodationCategories(): Promise<CodeName[]> {
    const parsed = await this.call('getAccomodationCategories', 'getAccomodationCategories', this.credentialBody(), this.timeouts.defaultMs);
    return codeNameList(parsed?.categories?.category ?? parsed?.category);
  }

  async getZones(countryCode?: string): Promise<CodeName[]> {
    const parsed = await this.call('getZones', 'getZones', this.credentialBody(countryCode ? { countryCode } : {}), this.timeouts.defaultMs);
    return codeNameList(parsed?.zones?.zone ?? parsed?.zone);
  }

  async getProvinces(countryCode?: string): Promise<CodeName[]> {
    const parsed = await this.call('getProvinces', 'getProvinces', this.credentialBody(countryCode ? { countryCode } : {}), this.timeouts.defaultMs);
    return codeNameList(parsed?.provinces?.province ?? parsed?.province);
  }

  /**
   * 城市列表。文档要求 provinceCode 不带国家前缀（如 Mlg），并同时提供 countryCode；
   * 传入 getProvinces 返回的组合码（如 ESMlg）时自动拆分。
   */
  async getCities(provinceCode?: string, countryCode?: string): Promise<CodeName[]> {
    let province = provinceCode;
    let country = countryCode;
    if (province && !country && /^[A-Z]{2}/.test(province) && province.length > 2) {
      country = province.slice(0, 2);
      province = province.slice(2);
    }
    const parsed = await this.call('getCities', 'getCities', this.credentialBody({
      ...(province ? { provinceCode: province } : {}),
      ...(country ? { countryCode: country } : {}),
    }), this.timeouts.defaultMs);
    return codeNameList(parsed?.cities?.city ?? parsed?.city);
  }

  /* ── Reservations（对账）──────────────────────── */

  /** 日期格式 dd/mm/yyyy（与 Booking 的 DDMMYYYY 不同，按文档区分） */
  async getReservations(range: { initialBookingDate: string; finalBookingDate: string }): Promise<ReservationSummary[]> {
    const parsed = await this.call('getReservations', 'getReservations', this.credentialBody({
      searchParams: {
        initialBookingDate: range.initialBookingDate,
        finalBookingDate: range.finalBookingDate,
      },
    }), this.timeouts.defaultMs);
    return toArray(parsed?.reservations?.reservation ?? parsed?.reservation).map((r: any) => ({
      locator: r.localizer ? String(r.localizer) : undefined,
      clientReference: r.clientLocalizer ? String(r.clientLocalizer) : undefined,
      status: r.status ? String(r.status) : undefined,
      checkIn: r.initialDate ? String(r.initialDate) : undefined,
      checkOut: r.finalDate ? String(r.finalDate) : undefined,
      pvp: r.pvp ? String(r.pvp) : undefined,
      neto: r.neto ? String(r.neto) : undefined,
      raw: r,
    }));
  }

  async getReservationDetails(locator: string): Promise<any> {
    return this.call('getReservationDetails', 'getReservationDetails', this.credentialBody({ localizer: locator }), this.timeouts.defaultMs);
  }
}

/* ── 解析辅助 ───────────────────────────────────── */

/** mealPlan 等标签因 Mapping 列表被强制数组化，取首个标量值 */
function scalar(v: unknown): string | undefined {
  const first = Array.isArray(v) ? v[0] : v;
  return first === undefined || first === null || first === '' ? undefined : String(first);
}

function toArray<T = any>(v: T | T[] | undefined | null): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

/** Mapping 接口通用的 编码+名称 列表（名称字段在不同接口叫 name 或 description） */
function codeNameList(v: any): CodeName[] {
  return toArray(v).map((item: any) => ({
    code: String(item.code ?? ''),
    name: String(item.name ?? item.description ?? ''),
    raw: item,
  }));
}

/** room1/room2/room3 展开（文档格式，最多 3 组） */
function roomsToT10(rooms: AvailabilitySearch['rooms']): Record<string, unknown> {
  if (!rooms.length || rooms.length > 3) {
    throw new Error('T10 getAccomodationAvail 支持 1–3 组房间配置（room1..room3）');
  }
  const out: Record<string, unknown> = {};
  rooms.forEach((r, i) => {
    out[`room${i + 1}`] = {
      adult: r.adults,
      children: r.children,
      firstChildAge: r.firstChildAge ?? '',
      secondChildAge: r.secondChildAge ?? '',
      units: r.units,
    };
  });
  return out;
}

function normalizeRooms(acc: any): RoomOffer[] {
  return toArray(acc?.rooms?.room).map((room: any) => ({
    code: String(room.code ?? ''),
    name: room.name ? String(room.name) : undefined,
    units: room.units !== undefined ? Number(room.units) : undefined,
    adults: room.adults !== undefined ? Number(room.adults) : undefined,
    children: room.children !== undefined ? Number(room.children) : undefined,
    pvp: room.pvp !== undefined ? String(room.pvp) : undefined,
    neto: room.neto !== undefined ? String(room.neto) : undefined,
    observations: room.observations,
  }));
}

/**
 * 结构化取消政策解析。NS（Next Step）= 本步骤未能取回政策，
 * 需要在 value 步骤重新获取（测试环境下可用性响应 100% 为 NS）。
 */
function normalizeStructuredPolicies(node: any): { policies: StructuredCancelPolicy[]; pending: boolean } {
  const policies = toArray(node?.structuredCancelPolicie).map((p: any) => ({
    hoursFrom: p.hoursFrom !== undefined ? String(p.hoursFrom) : undefined,
    calculationType: p.calculationType !== undefined ? String(p.calculationType) : undefined,
    amountType: p.amountType !== undefined ? String(p.amountType) : undefined,
    amount: p.amount !== undefined ? String(p.amount) : undefined,
    raw: p,
  }));
  // NS 规范上在 calculationType，但文档示例中也出现在 amountType —— 两处都检测
  return { policies, pending: policies.some(p => p.calculationType === 'NS' || p.amountType === 'NS') };
}

function normalizeCancelPolicies(node: any): CancelPolicy[] {
  return toArray(node?.cancelPolicy ?? node?.policy ?? node?.cancelPolicie)
    .map((p: any) => typeof p === 'string'
      ? { raw: p }
      : { from: p.from ? String(p.from) : undefined, amount: p.amount ? String(p.amount) : undefined, raw: p });
}

function normalizeAccommodation(acc: any): AccommodationOffer {
  const structured = normalizeStructuredPolicies(acc.structuredCancelPolicies);
  return {
    code: String(acc.code ?? ''),
    name: acc.name ? String(acc.name) : undefined,
    category: acc.category ? String(acc.category) : acc.categoryCode ? String(acc.categoryCode) : undefined,
    mealPlan: scalar(acc.mealPlan),
    pvp: acc.pvp !== undefined ? String(acc.pvp) : undefined,
    neto: acc.neto !== undefined ? String(acc.neto) : undefined,
    currencyCode: acc.currencyCode ? String(acc.currencyCode) : undefined,
    status: acc.status ? String(acc.status) : undefined,
    idDistributions: acc.idDistributions ? String(acc.idDistributions) : undefined,
    rooms: normalizeRooms(acc),
    cancelPolicies: normalizeCancelPolicies(acc.cancelPolicies),
    structuredCancelPolicies: structured.policies.length ? structured.policies : undefined,
    cancelPoliciesPending: structured.pending || undefined,
    raw: acc,
  };
}

/**
 * 可用性响应实际结构为 accomodation > distributions > distribution[]（价格、
 * idDistributions、房型与取消政策都在 distribution 层）。这里按
 * 酒店 × distribution 展开为一条条报价，酒店层字段（编码/名称/星级/城市/币种）下沉合并。
 */
function normalizeAccommodations(parsed: any): AccommodationOffer[] {
  const list = toArray(parsed?.accomodations?.accomodation ?? parsed?.accomodation);
  return list.flatMap((acc: any) => {
    const distributions = toArray(acc?.distributions?.distribution);
    if (!distributions.length) return [normalizeAccommodation(acc)]; // 兼容无 distributions 的响应
    return distributions.map((d: any) => {
      const structured = normalizeStructuredPolicies(d.structuredCancelPolicies);
      const confirmed = String(d.confirmed ?? acc.confirmed ?? '');
      return {
        code: String(acc.code ?? ''),
        name: acc.name ? String(acc.name) : undefined,
        category: acc.categoryCode ? String(acc.categoryCode) : acc.category ? String(acc.category) : undefined,
        cityName: acc.cityName ? String(acc.cityName) : undefined,
        mealPlan: scalar(d.mealPlan),
        pvp: d.pvp !== undefined ? String(d.pvp) : undefined,
        neto: d.neto !== undefined ? String(d.neto) : undefined,
        currencyCode: acc.currencyCode ? String(acc.currencyCode) : undefined,
        status: confirmed === 'Y' ? 'SALE' : confirmed === 'N' ? 'ON_REQUEST' : undefined,
        idDistributions: d.idDistributions ? String(d.idDistributions) : undefined,
        rooms: normalizeRooms(d),
        cancelPolicies: normalizeCancelPolicies(d.cancelPolicies),
        structuredCancelPolicies: structured.policies.length ? structured.policies : undefined,
        cancelPoliciesPending: structured.pending || undefined,
        raw: d,
      } satisfies AccommodationOffer;
    });
  });
}

function firstAccommodation(reservation: any): AccommodationOffer | undefined {
  const list = toArray(reservation?.accomodation);
  return list.length ? normalizeAccommodation(list[0]) : undefined;
}
