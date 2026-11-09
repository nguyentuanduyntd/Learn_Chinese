import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// Font self-host (SPEC 9.2): font UI nạp ngay.
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/800.css';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Không tìm thấy phần tử #root trong index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Noto Sans SC (SPEC 16.2): dùng font hệ thống trước, nạp font sau để không chặn lần vẽ đầu.
// Bản chia lát theo unicode-range: trình duyệt chỉ tải lát chứa chữ thực sự hiển thị.
void import('@fontsource/noto-sans-sc/400.css');
