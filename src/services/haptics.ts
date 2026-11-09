/** Rung phản hồi (SPEC 9.5). iOS Safari không hỗ trợ → bỏ qua êm. */
export type Haptic = 'tap' | 'correct' | 'wrong';

const PATTERNS: Record<Haptic, number | number[]> = {
  tap: 8,
  correct: 15,
  wrong: [30, 40, 30],
};

export const canVibrate = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

/** Trả về true nếu đã gửi lệnh rung. */
export function vibrate(kind: Haptic, enabled = true): boolean {
  if (!enabled || !canVibrate()) return false;
  try {
    return navigator.vibrate(PATTERNS[kind]);
  } catch {
    return false;
  }
}
