/** API 输入校验（zod）。所有进入 T10 的数据先过这里。 */
import { z } from 'zod';

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式须为 YYYY-MM-DD');

export const roomSchema = z.object({
  adults: z.number().int().min(1).max(6),
  // T10 solo admite dos edades de niño por habitación (first/second childAge)
  children: z.number().int().min(0).max(2),
  firstChildAge: z.number().int().min(0).max(17).optional(),
  secondChildAge: z.number().int().min(0).max(17).optional(),
  units: z.number().int().min(1).max(9),
})
  .refine(r => r.children < 1 || r.firstChildAge !== undefined,
    { message: 'falta la edad del primer niño (firstChildAge)' })
  .refine(r => r.children < 2 || r.secondChildAge !== undefined,
    { message: 'falta la edad del segundo niño (secondChildAge)' });

export const searchSchema = z.object({
  checkIn: dateStr,
  checkOut: dateStr,
  onlyConfirmed: z.boolean().optional(),
  retrieveCancelPolicies: z.boolean().optional(),
  rooms: z.array(roomSchema).min(1).max(3),
  destinationCode: z.string().max(20).optional(),
  hotelCodes: z.array(z.string().max(20)).max(50).optional(),
  countryCode: z.string().length(2).optional(),
}).refine(s => s.checkOut > s.checkIn, { message: 'checkOut 必须晚于 checkIn' })
  // 用马德里当地日期做“今天”的下限，避免 UTC 边界把当天的合法查询判为过去
  .refine(s => s.checkIn >= madridToday(), { message: 'checkIn 不能早于今天' });

/** 马德里本地的 YYYY-MM-DD（供应商与业务所在时区），避免 UTC 跨日误差 */
function madridToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export const valueSchema = z.object({
  idOperation: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  idDistributions: z.string().min(1).max(500),
});

export const confirmSchema = z.object({
  idOperation: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  idDistributions: z.string().min(1).max(500),
  clientLocalizer: z.string().min(1).max(40),
  remarksForProvider: z.string().max(500).optional(),
  clients: z.array(z.object({
    age: z.number().int().min(0).max(120),
    dni: z.string().max(30).optional(),
    name: z.string().min(1).max(60),
    firstSurname: z.string().min(1).max(60),
    secondSurname: z.string().max(60).optional(),
  })).min(1).max(20),
  invoicingRegime: z.string().max(5).optional(),
  expectedNeto: z.union([z.string(), z.number()]).optional(),
  hotelCode: z.string().max(20).optional(),
  checkIn: dateStr.optional(),
  checkOut: dateStr.optional(),
});

export const cancelSchema = z.object({
  locator: z.string().min(1).max(60),
});

/** 公开询盘表单（合作伙伴申请 / 路线报价请求） */
export const inquirySchema = z.object({
  type: z.enum(['partner', 'quote']),
  companyName: z.string().trim().min(1).max(120),
  businessType: z.string().max(60).optional(),
  workEmail: z.string().trim().email().max(160),
  region: z.string().max(80).optional(),
  monthlyPax: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  routeCode: z.string().max(20).optional(),
  language: z.enum(['en', 'zh', 'es']).optional(),
  /** GDPR：必须显式同意隐私政策 */
  consent: z.literal(true),
});
// 注：蜜罐字段 website 不进 schema —— 在路由层检测到非空时静默丢弃并返回“成功”，
// 避免给机器人任何反馈信号。
