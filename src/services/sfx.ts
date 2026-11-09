/**
 * Âm thanh UI ngắn bằng Web Audio oscillator (SPEC 9.5) — không cần file.
 * Bỏ qua êm nếu trình duyệt không có AudioContext hoặc người dùng tắt âm.
 */
export type Sfx = 'tap' | 'correct' | 'wrong' | 'complete' | 'levelup';

/** [tần số Hz, bắt đầu (s), dài (s)] của từng nốt. */
const PATTERNS: Record<Sfx, [number, number, number][]> = {
  tap: [[600, 0, 0.05]],
  correct: [
    [660, 0, 0.1],
    [880, 0.1, 0.15],
  ],
  wrong: [
    [220, 0, 0.12],
    [180, 0.12, 0.18],
  ],
  complete: [
    [523, 0, 0.1],
    [659, 0.1, 0.1],
    [784, 0.2, 0.1],
    [1047, 0.3, 0.25],
  ],
  levelup: [
    [523, 0, 0.12],
    [784, 0.12, 0.12],
    [1047, 0.24, 0.3],
  ],
};

let ctx: AudioContext | undefined;

function getContext(): AudioContext | undefined {
  if (ctx) return ctx;
  const Ctor = typeof window !== 'undefined' ? window.AudioContext : undefined;
  if (!Ctor) return undefined;
  ctx = new Ctor();
  return ctx;
}

export function playSfx(kind: Sfx, enabled = true): void {
  if (!enabled) return;
  const ac = getContext();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  const t0 = ac.currentTime;
  for (const [freq, start, dur] of PATTERNS[kind]) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = kind === 'wrong' ? 'sawtooth' : 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + start);
    gain.gain.exponentialRampToValueAtTime(0.2, t0 + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.02);
  }
}
