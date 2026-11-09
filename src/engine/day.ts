/**
 * "Ngày học" theo múi giờ máy, qua ngày lúc 4:00 sáng (SPEC 13.3) để người học khuya
 * không bị đứt chuỗi. Hàm thuần.
 */
export const DAY_BOUNDARY_HOUR = 4;
const MS_PER_DAY = 86_400_000;

/** Khóa ngày yyyy-MM-dd của một thời điểm, đã lùi về trước mốc 4:00. */
export function dayKey(timestamp: number, boundaryHour = DAY_BOUNDARY_HOUR): string {
  const d = new Date(timestamp - boundaryHour * 3_600_000);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Số ngày học chênh lệch giữa hai khóa ngày (b − a), VD "2026-11-09" − "2026-11-07" = 2. */
export function dayDiff(a: string, b: string): number {
  const toUtc = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / MS_PER_DAY);
}
