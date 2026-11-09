import { lazy, Suspense } from 'react';
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';
import { TabBar } from '@/components/ui/TabBar';
import { Placeholder } from '@/routes/Placeholder';

// Chỉ có ở bản dev, không vào bundle production.
const Gallery = import.meta.env.DEV ? lazy(() => import('@/routes/Gallery')) : null;

/** Layout có TabBar — màn hình làm bài (M4) sẽ nằm ngoài layout này để ẩn tab bar. */
function Shell() {
  return (
    <>
      <main className="min-h-dvh">
        <Outlet />
      </main>
      <TabBar />
    </>
  );
}

/** HashRouter để chạy được trên mọi static host (CLAUDE.md). */
export function App() {
  return (
    <div className="mx-auto max-w-app bg-bg text-text">
      <HashRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Placeholder page="learn" />} />
            <Route path="review" element={<Placeholder page="review" />} />
            <Route path="notebook" element={<Placeholder page="notebook" />} />
            <Route path="profile" element={<Placeholder page="profile" />} />
          </Route>
          {Gallery && (
            <Route
              path="dev/gallery"
              element={
                <Suspense fallback={null}>
                  <Gallery />
                </Suspense>
              }
            />
          )}
        </Routes>
      </HashRouter>
    </div>
  );
}
