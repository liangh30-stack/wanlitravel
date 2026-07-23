/**
 * TourDiez (T10) Sirio Integration Web Services — 结果码表
 * 来源: SirioIntegrationWebServicesBooking_2_9_3_T10.docx §7
 */

export const T10_RESULT_CODES: Record<string, string> = {
  M1: '操作成功（confirm 时注意：可能以与核价不同的价格成交，必须比对最终价格）',
  M2: '拒绝访问：用户名或密码错误',
  M3: '系统内部错误，可重试；持续出错请联系供应商',
  M4: '与服务器连接丢失，请稍后重试',
  M5: '会话已过期或无效，需要重新登录获取新会话',
  M8: '结束日期必须大于开始日期',
  M9: '所填日期必须大于当前日期',
  M10: '缺少必填字段',
  M11: '字段格式错误',
  M12: '搜索与下单间隔过久，出于安全原因未能成交（需重新核价）',
  M13: '预订无效',
  M14: '该酒店不存在或不允许销售',
  M15: '一个或多个房间的旅客分配不正确',
  M16: '输入 XML 不正确、不存在或无法处理',
  M17: '服务无法识别所请求的操作',
  M18: '取消预订时发生错误',
  M19: '在指定供应商下找不到该订单号的预订',
  M20: '该预订此前已被取消',
  M21: '供应商无法计算取消费用',
  M22: '不允许取消',
  M23: '执行该操作的参数数量不正确',
  M24: '可选附加/折扣的核价或确认请求不正确',
  M25: '预订未能完成：无可用库存',
  M30: '当前无法执行该操作，请稍后重试；持续出错请联系供应商',
  M39: '该预订已开票，无法执行所请求的操作',
  M40: '当前无法执行该操作，请联系供应商预订部门（人工处理）',
  M41: '该预订有取消费用且酒店不允许在线取消，请联系供应商预订部门（人工处理）',
  M60: '预订未能取消，请联系供应商 Booking 部门（人工处理）',
  M80: '按酒店列表搜索时超出单次最大酒店数量限制',
  M81: '该预订需要立即付款，无法通过接口确认，请联系供应商（人工处理）',
};

export const OK_CODE = 'M1';
/** 会话失效：重新登录后重放请求即可 */
export const SESSION_EXPIRED_CODE = 'M5';
/** 可安全自动重试的错误（幂等操作） */
export const RETRYABLE_CODES = new Set(['M3', 'M4', 'M30']);
/** 需要转人工的错误 */
export const MANUAL_HANDLING_CODES = new Set(['M40', 'M41', 'M60', 'M81']);

export interface T10Result {
  cod_result: string;
  des_result: string;
  type_message?: string;
}

export class T10Error extends Error {
  constructor(
    public readonly code: string,
    public readonly serverMessage: string,
    public readonly operation: string,
  ) {
    super(`[T10 ${operation}] ${code}: ${T10_RESULT_CODES[code] ?? serverMessage}`);
    this.name = 'T10Error';
  }
  get isSessionExpired() { return this.code === SESSION_EXPIRED_CODE; }
  get isRetryable() { return RETRYABLE_CODES.has(this.code); }
  get needsManualHandling() { return MANUAL_HANDLING_CODES.has(this.code); }
}
