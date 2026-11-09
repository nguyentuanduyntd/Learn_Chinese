import type { HTMLAttributes } from 'react';

/** Khối nội dung bo góc 20px (SPEC 9.3). */
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card border border-line bg-surface p-4 ${className}`} {...rest} />
  );
}
