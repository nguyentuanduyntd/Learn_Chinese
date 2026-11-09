import { vi } from '@/i18n/vi';
import type { Tone } from '@/types/content';

/**
 * Viền + ký hiệu đường cong mang màu thanh (SPEC 9.1); số thanh dùng màu chữ chính
 * để đủ tương phản — màu thanh không bao giờ là tín hiệu duy nhất (SPEC 9.6).
 */
const TONE: Record<Tone, { border: string; text: string; curve: string }> = {
  1: { border: 'border-tone1', text: 'text-tone1', curve: '‾' },
  2: { border: 'border-tone2', text: 'text-tone2', curve: '↗' },
  3: { border: 'border-tone3', text: 'text-tone3', curve: '↘↗' },
  4: { border: 'border-tone4', text: 'text-tone4', curve: '↘' },
  5: { border: 'border-tone5', text: 'text-tone5', curve: '·' },
};

interface ToneBadgeProps {
  tone: Tone;
  className?: string;
}

/** Huy hiệu thanh điệu: số thanh + đường cong, VD "3 ↘↗". */
export function ToneBadge({ tone, className = '' }: ToneBadgeProps) {
  const style = TONE[tone];
  return (
    <span
      role="img"
      aria-label={vi.hanzi.tone(tone)}
      className={`inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border-2 bg-surface px-2 text-sm font-extrabold text-text ${style.border} ${className}`}
    >
      {tone !== 5 && <span aria-hidden="true">{tone}</span>}
      <span aria-hidden="true" className={style.text}>
        {style.curve}
      </span>
    </span>
  );
}
