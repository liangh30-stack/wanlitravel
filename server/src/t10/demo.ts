/**
 * 演示数据模式 —— 未配置 T10 凭证（或 DEMO_MODE=true）时，
 * /api/hotels/search 返回这里的模拟酒店，响应带 demo:true 标记，前端显示"演示数据"横幅。
 * 配置好 T10_* 环境变量后自动切换为真实库存，前端无需任何改动。
 */
import type { AvailabilitySearch, AccommodationOffer } from './types.js';

export interface DemoDestination { code: string; label: string }

export const DEMO_DESTINATIONS: DemoDestination[] = [
  { code: 'AGP', label: 'Costa del Sol · Málaga' },
  { code: 'MAD', label: 'Madrid' },
  { code: 'BCN', label: 'Barcelona' },
  { code: 'SVQ', label: 'Sevilla' },
  { code: 'GRX', label: 'Granada' },
  { code: 'VLC', label: 'Valencia' },
];

interface DemoHotel {
  code: string;
  name: string;
  category: string;        // 星级
  destinationCode: string;
  mealPlan: string;        // SA=只住宿 BB=含早 HB=半食宿
  nightlyNet: number;      // 每晚净价（双人间基准, EUR）
  status: 'SALE' | 'ON_REQUEST';
  freeCancelDays: number;  // 入住前 N 天免费取消
}

const DEMO_HOTELS: DemoHotel[] = [
  { code: 'D-AGP01', name: 'Hotel Mediterráneo Playa', category: '4', destinationCode: 'AGP', mealPlan: 'BB', nightlyNet: 78, status: 'SALE', freeCancelDays: 7 },
  { code: 'D-AGP02', name: 'Marbella Bahía Resort & Spa', category: '5', destinationCode: 'AGP', mealPlan: 'HB', nightlyNet: 142, status: 'SALE', freeCancelDays: 14 },
  { code: 'D-AGP03', name: 'Costa Sol Urban', category: '3', destinationCode: 'AGP', mealPlan: 'SA', nightlyNet: 52, status: 'SALE', freeCancelDays: 3 },
  { code: 'D-MAD01', name: 'Gran Vía Palacio', category: '4', destinationCode: 'MAD', mealPlan: 'BB', nightlyNet: 96, status: 'SALE', freeCancelDays: 7 },
  { code: 'D-MAD02', name: 'Madrid Río Boutique', category: '4', destinationCode: 'MAD', mealPlan: 'SA', nightlyNet: 84, status: 'ON_REQUEST', freeCancelDays: 5 },
  { code: 'D-MAD03', name: 'Retiro Garden Suites', category: '5', destinationCode: 'MAD', mealPlan: 'BB', nightlyNet: 168, status: 'SALE', freeCancelDays: 10 },
  { code: 'D-BCN01', name: 'Eixample Modernista', category: '4', destinationCode: 'BCN', mealPlan: 'BB', nightlyNet: 110, status: 'SALE', freeCancelDays: 7 },
  { code: 'D-BCN02', name: 'Barceloneta Mar', category: '3', destinationCode: 'BCN', mealPlan: 'SA', nightlyNet: 68, status: 'SALE', freeCancelDays: 3 },
  { code: 'D-SVQ01', name: 'Triana Esencia', category: '4', destinationCode: 'SVQ', mealPlan: 'BB', nightlyNet: 74, status: 'SALE', freeCancelDays: 7 },
  { code: 'D-GRX01', name: 'Mirador de la Alhambra', category: '4', destinationCode: 'GRX', mealPlan: 'BB', nightlyNet: 88, status: 'ON_REQUEST', freeCancelDays: 7 },
  { code: 'D-VLC01', name: 'Turia Riverside', category: '4', destinationCode: 'VLC', mealPlan: 'SA', nightlyNet: 70, status: 'SALE', freeCancelDays: 5 },
];

function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

/** 生成与真实 T10 响应同构的演示可用性结果 */
export function buildDemoAvailability(search: AvailabilitySearch): { idOperation: string; accommodations: AccommodationOffer[] } {
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const totalUnits = search.rooms.reduce((n, r) => n + r.units, 0);
  const totalAdults = search.rooms.reduce((n, r) => n + r.adults * r.units, 0);
  // 人数系数：双人间基准，每多 1 名成人 +30%
  const paxFactor = 1 + Math.max(0, totalAdults - 2 * totalUnits) * 0.3;

  const hotels = DEMO_HOTELS
    .filter(h => !search.destinationCode || h.destinationCode === search.destinationCode)
    .filter(h => !search.onlyConfirmed || h.status === 'SALE');

  const accommodations: AccommodationOffer[] = hotels.map(h => {
    const neto = Math.round(h.nightlyNet * nights * totalUnits * paxFactor);
    const pvp = Math.round(neto * 1.15);
    const cancelFrom = new Date(new Date(search.checkIn).getTime() - h.freeCancelDays * 86_400_000)
      .toISOString().slice(0, 10);
    return {
      code: h.code,
      name: `${h.name}`,
      category: h.category,
      mealPlan: h.mealPlan,
      pvp: String(pvp),
      neto: String(neto),
      currencyCode: 'EUR',
      status: h.status,
      idDistributions: `demo.${h.code}.${nights}n`,
      rooms: search.rooms.map((r, i) => ({
        code: `RM${i + 1}`,
        name: r.adults === 2 ? 'DOBLE' : r.adults === 1 ? 'INDIVIDUAL' : 'FAMILIAR',
        units: r.units, adults: r.adults, children: r.children,
        neto: String(Math.round(neto / search.rooms.length)),
      })),
      cancelPolicies: [{ from: cancelFrom, amount: '0' }],
    };
  });

  return { idOperation: `demo-${Date.now()}`, accommodations };
}
