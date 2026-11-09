import { clamp01 } from '@/utils/math';

interface ProgressBarProps {
  /** 0..1 (ngoài đoạn sẽ bị kẹp). */
  value: number;
  /** Nhãn cho trình đọc màn hình, VD "Tiến độ bài học". */
  label: string;
  className?: string;
}

/** Thanh tiến độ ngang (màn hình làm bài, SPEC 8.3). */
export function ProgressBar({ value, label, className = '' }: ProgressBarProps) {
  const percent = Math.round(clamp01(value) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`h-4 w-full overflow-hidden rounded-full bg-surface2 ${className}`}
    >
      <div
        className="h-full rounded-full bg-success transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
