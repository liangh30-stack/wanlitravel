/** 前端询盘提交工具。开发环境经 vite 代理 /api → localhost:3001。 */

export type InquiryStatus = 'idle' | 'sending' | 'success' | 'error' | 'needConsent';

export interface InquiryPayload {
  type: 'partner' | 'quote';
  companyName: string;
  businessType?: string;
  workEmail: string;
  region?: string;
  monthlyPax?: string;
  message?: string;
  routeCode?: string;
  language?: string;
  consent: true;
  /** 蜜罐字段（正常提交为空字符串） */
  website?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.ok === true;
  } catch {
    return false;
  }
}
