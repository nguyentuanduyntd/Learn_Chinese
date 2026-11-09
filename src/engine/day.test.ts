import { describe, expect, it } from 'vitest';
import { dayDiff, dayKey } from './day';

/** Tạo timestamp theo giờ máy (test không phụ thuộc múi giờ). */
const local = (y: number, m: number, d: number, h: number, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime();

describe('dayKey', () => {
  it('trước 4:00 sáng vẫn tính là hôm trước', () => {
    expect(dayKey(local(2026, 11, 9, 3, 59))).toBe('2026-11-08');
    expect(dayKey(local(2026, 11, 9, 4, 0))).toBe('2026-11-09');
    expect(dayKey(local(2026, 11, 9, 23, 30))).toBe('2026-11-09');
  });

  it('qua năm mới lúc 1:00 sáng vẫn là 31/12', () => {
    expect(dayKey(local(2027, 1, 1, 1))).toBe('2026-12-31');
  });

  it('mốc tùy chỉnh', () => {
    expect(dayKey(local(2026, 11, 9, 1), 0)).toBe('2026-11-09');
  });
});

describe('dayDiff', () => {
  it('đếm số ngày giữa hai khóa', () => {
    expect(dayDiff('2026-11-07', '2026-11-09')).toBe(2);
    expect(dayDiff('2026-11-09', '2026-11-09')).toBe(0);
    expect(dayDiff('2026-12-31', '2027-01-01')).toBe(1);
    expect(dayDiff('2026-11-09', '2026-11-07')).toBe(-2);
  });
});
