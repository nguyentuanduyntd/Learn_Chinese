import type { HTMLAttributes } from 'react';

type Variant = 'neutral' | 'primary' | 'accent' | 'success';

/** Nền nhạt theo màu, chữ luôn dùng màu chữ chính để đủ tương phản 4.5:1. */
const VARIANT: Record<Variant, string> = {
  neutral: 'bg-surface2',
  primary: 'bg-primary/15',
  accent: 'bg-accent/25',
  success: 'bg-success/20',
};

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

/** Nhãn nhỏ bo tròn hoàn toàn (SPEC 9.3: chip 999px). */
export function Chip({ variant = 'neutral', className = '', ...rest }: ChipProps) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm font-semibold text-text ${VARIANT[variant]} ${className}`}
      {...rest}
    />
  );
}
