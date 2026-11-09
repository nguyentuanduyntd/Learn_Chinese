import { vi } from '@/i18n/vi';

interface HanVietBadgeProps {
  /** Âm Hán-Việt, VD "hảo" (hiển thị in hoa: HẢO). */
  reading: string;
  className?: string;
}

/** Huy hiệu âm Hán-Việt — cầu nối riêng cho người Việt (SPEC 1, 4.2). */
export function HanVietBadge({ reading, className = '' }: HanVietBadgeProps) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full bg-accent/25 px-3 text-sm text-text ${className}`}
    >
      <span className="sr-only">{vi.hanzi.hanVietLabel(reading)}</span>
      <span aria-hidden="true" className="text-xs font-semibold">
        {vi.hanzi.hanViet}
      </span>
      <span aria-hidden="true" className="font-extrabold uppercase tracking-wide">
        {reading}
      </span>
    </span>
  );
}
