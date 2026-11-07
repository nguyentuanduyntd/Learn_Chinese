# CLAUDE.md — Quy ước dự án Nǐ Hǎo Mỗi Ngày

## Nguồn sự thật
- Đặc tả: SPEC_App_Hoc_Tieng_Trung_PWA.md. Nếu có mâu thuẫn, hỏi lại thay vì tự đoán.

## Lệnh
- dev: `npm run dev` · test: `npm run test` · e2e: `npm run test:e2e`
- lint: `npm run lint` · build: `npm run build` · kiểm tra nội dung: `npm run validate:content`
- copy dữ liệu nét chữ: `npm run hanzi:copy` (tự chạy trong `prebuild`) · tạo icon: `npm run icons`

## Quy tắc code
- TypeScript strict, không dùng `any`. Types đặt trong `src/types`.
- Logic nghiệp vụ (SRS, XP, sinh bài tập, chấm điểm) là **hàm thuần** trong `src/engine`, phải có unit test.
- Component không truy cập Dexie trực tiếp — đi qua `src/db/repositories.ts` hoặc hooks.
- Mọi chuỗi hiển thị bằng tiếng Việt; gom vào `src/i18n/vi.ts`.
- Không gọi mạng lúc chạy. Không thêm thư viện mới nếu chưa giải thích lý do.
- Mobile-first, vùng chạm ≥ 48px, tôn trọng `prefers-reduced-motion`.
- Pinyin luôn hiển thị qua component `<Pinyin>` để tô màu thanh điệu nhất quán.

## Nội dung
- Nội dung bài học là JSON trong `src/content`, phải pass `validate:content`.
- Mỗi bài ≤ 6 mục mới, recap ≤ 3 keyPoints.
- Pinyin cách nhau **từng âm tiết**, kể cả trong một từ: `"Xiè xie nǐ!"` (không viết `"Xièxie"`).
- `SyllableItem` (Chương 0): y/w tính là thanh mẫu (`wǒ` → `w` + `o`, `yú` → `y` + `ü`); `final` không dấu và dùng `ü` (`qù` → `q` + `ü`).
- Kiểm tra kỹ pinyin, thanh điệu, nghĩa và âm Hán-Việt; nếu không chắc âm Hán-Việt thì bỏ trống trường `hanViet` thay vì đoán.

## Dữ liệu người dùng
- Chỉ IndexedDB (Dexie). Đổi schema → tăng version + migration, không bao giờ xóa dữ liệu cũ.
- Ghi kết quả cuối bài trong một transaction.

## Quyết định kỹ thuật đã chốt (bổ sung so với SPEC)
- Router: `HashRouter` để deploy được ở mọi static host (kể cả GitHub Pages đường dẫn con).
- Chương 0 dùng item `kind: "syllable"` (file `src/content/syllables.json`), SRS thẻ `syllable:<id>:listen`.
- Dữ liệu nét chữ copy vào `public/hanzi/<mã-unicode-hex>.json` (VD `597d.json` cho 好) để tránh tên file Unicode.
- Font Noto Sans SC: chỉ precache các lát (slice) chứa chữ dùng trong khóa học; lát khác cache khi chạy.
- `sharp` (devDependency) chỉ dùng để sinh icon PNG từ SVG lúc phát triển.
- Bài tập `speak` cần bật trong Cài đặt vì Chrome nhận dạng giọng nói qua mạng.
- `validate:content` đối chiếu pinyin với chữ Hán bằng pinyin-pro (thanh gốc, không biến điệu): lệch số âm tiết/chữ cái → lỗi (chặn build); chỉ lệch thanh → cảnh báo; âm tiết thanh nhẹ không bị báo. Code kiểm tra nằm trong `scripts/content/` — không import vào app (kéo theo từ điển ~150 KB).

## Hoàn thành một milestone khi
- lint + test + build đều pass, tiêu chí nghiệm thu trong SPEC đạt, đã commit.

## Known issues / TODO
- Chưa có file dữ liệu ngữ pháp (grammar): mọi tham chiếu `kind: "grammar"` trong bài sẽ bị `validate:content` báo thiếu.
- Chữ đa âm 了/的/得: pinyin-pro có thể đọc sai khi đứng riêng (VD 了 → liǎo) → cần danh sách ngoại lệ trong `validate:content` khi làm Chương 1–2.
- M0 chưa đủ: `src/main.tsx` + `src/App.tsx` mới là khung tối thiểu để build pass (chưa import font); `public/icons/` trống và `scripts/generate-icons.ts` chưa có, trong khi `index.html` trỏ tới `favicon.svg`, `apple-touch-icon.png`.
