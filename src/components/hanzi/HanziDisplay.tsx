import { vi } from '@/i18n/vi';

type Size = 'xl' | 'lg' | 'md';

/** xl = chữ lớn ở thẻ Khám phá / màn hình làm bài (SPEC 4.2: 96–120px). */
const SIZE: Record<Size, string> = {
  xl: 'text-[112px] leading-none',
  lg: 'text-6xl leading-none',
  md: 'text-3xl leading-none',
};

interface HanziDisplayProps {
  text: string;
  size?: Size;
  /** Có thì chữ thành nút "chạm để nghe" (phát âm do services/tts lo, M3). */
  onSpeak?: () => void;
  className?: string;
}

/** Hiển thị chữ Hán bằng font Noto Sans SC, gắn lang="zh-CN". */
export function HanziDisplay({ text, size = 'xl', onSpeak, className = '' }: HanziDisplayProps) {
  const glyph = (
    <span lang="zh-CN" className={`font-han text-text ${SIZE[size]}`}>
      {text}
    </span>
  );
  if (!onSpeak) return <span className={className}>{glyph}</span>;
  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label={vi.hanzi.speak(text)}
      className={`min-h-12 min-w-12 rounded-card px-2 transition-transform active:scale-95 ${className}`}
    >
      {glyph}
    </button>
  );
}
