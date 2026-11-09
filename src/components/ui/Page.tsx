import type { ReactNode } from 'react';

interface PageProps {
  title: string;
  children: ReactNode;
}

/** Khung một tab: tiêu đề + nội dung, chừa chỗ cho TabBar ở đáy. */
export function Page({ title, children }: PageProps) {
  return (
    <div className="safe-top px-4 pb-24 pt-4">
      <h1 className="mb-4 text-2xl font-extrabold">{title}</h1>
      {children}
    </div>
  );
}
