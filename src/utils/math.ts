/** Kẹp giá trị vào đoạn [0, 1]; NaN → 0. */
export function clamp01(value: number): number {
  return Number.isNaN(value) ? 0 : Math.min(1, Math.max(0, value));
}
