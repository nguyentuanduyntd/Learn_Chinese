import type { ReactNode } from 'react';
import { clamp01 } from '@/utils/math';

interface RingProps {
  /** 0..1 (ngoài đoạn sẽ bị kẹp). */
  value: number;
  /** Nhãn cho trình đọc màn hình, VD "XP hôm nay". */
  label: string;
  size?: number;
  stroke?: number;
  /** Nội dung ở tâm vòng, VD "35/50". */
  children?: ReactNode;
  className?: string;
}

/** Vòng tiến độ tròn (XP mục tiêu ngày ở header, SPEC 8.2). */
export function Ring({ value, label, size = 56, stroke = 6, children, className = '' }: RingProps) {
  const percent = Math.round(clamp01(value) * 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="stroke-accent transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      {children !== undefined && (
        <span className="absolute text-xs font-extrabold text-text">{children}</span>
      )}
    </div>
  );
}
