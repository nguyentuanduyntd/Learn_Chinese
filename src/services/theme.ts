import type { ResolvedTheme } from '@/types/ui';
import type { ThemeSetting } from '@/types/user';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Giao diện thực tế từ cài đặt người dùng và chế độ của hệ điều hành. */
export function resolveTheme(setting: ThemeSetting, systemDark: boolean): ResolvedTheme {
  if (setting === 'system') return systemDark ? 'dark' : 'light';
  return setting;
}

/**
 * Gắn `data-theme` lên <html> (CSS và Tailwind `dark:` đọc thuộc tính này).
 * Với 'system': theo dõi khi hệ điều hành đổi sáng/tối. Trả về hàm hủy theo dõi.
 */
export function applyTheme(
  setting: ThemeSetting,
  root: HTMLElement = document.documentElement,
): () => void {
  const media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
  const update = () => {
    root.dataset.theme = resolveTheme(setting, media?.matches ?? false);
  };
  update();
  if (setting !== 'system' || !media) return () => {};
  media.addEventListener('change', update);
  return () => media.removeEventListener('change', update);
}
