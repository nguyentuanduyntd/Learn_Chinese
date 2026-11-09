import { NavLink } from 'react-router-dom';
import { vi } from '@/i18n/vi';

interface Tab {
  to: string;
  icon: string;
  label: string;
  /** Số hiển thị trên badge (tab Ôn tập: số thẻ đến hạn, SPEC 8.1). */
  badge?: number;
}

interface TabBarProps {
  /** Số thẻ đến hạn ôn; 0 → không hiện badge. */
  reviewDue?: number;
}

/** Thanh 4 tab dưới cùng (SPEC 8.1). Mỗi tab cao ≥ 56px (vùng chạm ≥ 48px). */
export function TabBar({ reviewDue = 0 }: TabBarProps) {
  const tabs: Tab[] = [
    { to: '/', icon: '🗺️', label: vi.nav.learn },
    { to: '/review', icon: '🔁', label: vi.nav.review, badge: reviewDue },
    { to: '/notebook', icon: '📒', label: vi.nav.notebook },
    { to: '/profile', icon: '🐉', label: vi.nav.profile },
  ];
  return (
    <nav
      aria-label={vi.nav.label}
      className="safe-bottom fixed inset-x-0 bottom-0 z-10 mx-auto max-w-app border-t border-line bg-surface"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                {tab.icon}
              </span>
              {tab.label}
              {tab.badge ? (
                <span
                  aria-label={vi.nav.reviewDue(tab.badge)}
                  className="absolute right-[calc(50%-1.75rem)] top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[11px] font-extrabold leading-5 text-white"
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
