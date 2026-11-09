import { vi } from '@/i18n/vi';
import type { BaoMood } from '@/types/ui';

/** Màu cố định của linh vật (giữ nguyên ở giao diện tối — là hình minh họa). */
const INK = '#2B2118';
const DOUGH = '#FFF4E2';
const CHEEK = '#F7A1A1';
const MOUTH = '#C8414D';

const line = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round' } as const;

/** Mắt + miệng + chi tiết riêng của từng trạng thái (toạ độ trong viewBox 0 0 100 100). */
function Face({ mood }: { mood: BaoMood }) {
  switch (mood) {
    case 'happy':
      return (
        <>
          <circle cx="38" cy="55" r="4" fill={INK} />
          <circle cx="62" cy="55" r="4" fill={INK} />
          <path d="M43 64 Q50 71 57 64" {...line} />
        </>
      );
    case 'cheer':
      return (
        <>
          <path d="M32 56 Q38 49 44 56 M56 56 Q62 49 68 56" {...line} />
          <path d="M41 62 Q50 77 59 62 Z" fill={MOUTH} stroke={INK} strokeWidth="2.5" />
          <path d="M12 32 l7 4 M17 22 l3 8 M88 32 l-7 4 M83 22 l-3 8" {...line} />
        </>
      );
    case 'oops':
      return (
        <>
          <circle cx="38" cy="56" r="3.5" fill={INK} />
          <circle cx="62" cy="56" r="3.5" fill={INK} />
          <path d="M42 68 Q46 64 50 68 Q54 72 58 68" {...line} />
          <path
            d="M80 34 Q75 43 80 47 Q85 43 80 34 Z"
            fill="#8FD3F4"
            stroke={INK}
            strokeWidth="2"
          />
        </>
      );
    case 'sleepy':
      return (
        <>
          <path d="M32 55 Q38 60 44 55 M56 55 Q62 60 68 55" {...line} />
          <circle cx="50" cy="67" r="2.5" fill={INK} />
          <path d="M72 22 h8 l-8 8 h8 M84 10 h6 l-6 6 h6" {...line} strokeWidth={2.5} />
        </>
      );
    case 'proud':
      return (
        <>
          <path d="M32 54 Q38 57 44 54 M56 54 Q62 57 68 54" {...line} />
          <path d="M40 63 Q50 73 60 63" {...line} />
          <path
            d="M82 14 L84.4 19.6 L90.5 20 L85.8 23.9 L87.3 29.8 L82 26.6 L76.7 29.8 L78.2 23.9 L73.5 20 L79.6 19.6 Z"
            fill="#F4A261"
            stroke={INK}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </>
      );
  }
}

interface BaoProps {
  mood?: BaoMood;
  /** Cạnh hình vuông, px. */
  size?: number;
  className?: string;
}

/** Linh vật Bao — chiếc bánh bao tròn, mắt, má hồng (SPEC M1). */
export function Bao({ mood = 'happy', size = 96, className = '' }: BaoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={vi.bao[mood]}
      className={className}
    >
      <ellipse cx="50" cy="90" rx="30" ry="4" fill={INK} opacity="0.12" />
      <path
        d="M12 70 C8 44 28 22 50 22 C72 22 92 44 88 70 C86 82 72 86 50 86 C28 86 14 82 12 70 Z"
        fill={DOUGH}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M40 27 Q50 14 60 27 M50 22 Q49 30 46 34 M50 22 Q51 30 54 34" {...line} />
      <ellipse cx="29" cy="64" rx="6" ry="4" fill={CHEEK} />
      <ellipse cx="71" cy="64" rx="6" ry="4" fill={CHEEK} />
      <Face mood={mood} />
    </svg>
  );
}
