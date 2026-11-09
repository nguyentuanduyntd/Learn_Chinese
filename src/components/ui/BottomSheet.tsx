import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  /** Tên vùng cho trình đọc màn hình, VD "Kết quả". */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Tấm trượt từ đáy màn hình (phản hồi sau khi kiểm tra, SPEC 8.3).
 * Không chặn thao tác bên dưới; nội dung được đọc lên qua aria-live.
 * Hiệu ứng spring (SPEC 9.4); bật "giảm chuyển động" → chỉ mờ dần.
 */
export function BottomSheet({ open, label, children, className = '' }: BottomSheetProps) {
  const reduceMotion = useReducedMotion();
  const hidden = reduceMotion ? { opacity: 0 } : { y: '100%' };
  const shown = reduceMotion ? { opacity: 1 } : { y: 0 };
  return (
    <AnimatePresence>
      {open && (
        <motion.section
          aria-label={label}
          aria-live="polite"
          initial={hidden}
          animate={shown}
          exit={hidden}
          transition={
            reduceMotion ? { duration: 0.15 } : { type: 'spring', damping: 26, stiffness: 300 }
          }
          className={
            'fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app rounded-t-card border-t border-line ' +
            'bg-surface px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] ' +
            `shadow-[0_-8px_24px_rgb(0_0_0/0.12)] ${className}`
          }
        >
          {children}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
