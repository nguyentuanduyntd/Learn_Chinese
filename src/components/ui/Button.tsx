import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'ghost';

/**
 * Nút 3D "nhấn lún" (SPEC 9.3): viền dưới 4px màu đậm, khi nhấn dịch xuống 2px.
 * Chữ 1.2rem đậm = "chữ lớn" theo WCAG → đạt tương phản 3:1 trên nền màu.
 * Ở giao diện tối, nút nền màu dùng chữ tối vì nền sáng hơn.
 */
const VARIANT: Record<Variant, string> = {
  primary: 'border-b-4 border-primary-dark bg-primary text-white dark:text-bg',
  secondary: 'border-2 border-b-4 border-line bg-surface text-text',
  success: 'border-b-4 border-success-dark bg-success text-white dark:text-bg',
  ghost: 'bg-transparent text-primary',
};

const BASE =
  'inline-flex min-h-14 select-none items-center justify-center gap-2 rounded-btn px-6 ' +
  'text-[1.2rem] font-extrabold transition-transform ' +
  'active:enabled:translate-y-0.5 active:enabled:border-b-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Chiếm hết chiều ngang (nút chính ở vùng ngón cái). */
  block?: boolean;
}

export function Button({
  variant = 'primary',
  block = false,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANT[variant]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  );
}
