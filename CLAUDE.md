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
- Giao diện tạm luôn theo hệ thống (`applyTheme('system')` trong `main.tsx`); cài đặt sáng/tối lưu trong settings sẽ nối ở M3.
- `/dev/gallery` chỉ có ở bản dev (`import.meta.env.DEV`), production không có route này.

## Decisions pending review
Các điểm mơ hồ đã tự chọn phương án, chờ duyệt. Duyệt xong thì chuyển lên mục "Quyết định kỹ thuật đã chốt" hoặc xóa.
- **Pinyin câu dùng thanh gốc** (`"Bù kè qi!"`, không viết `"Bú kè qi!"`): biến điệu 不/一/thanh 3 chỉ ghi ở `spokenTone` + `note` của từ — giống cách SPEC ghi `nǐ hǎo` cho 你好. Lý do: một quy ước duy nhất, khớp từ điển, `validate:content` không báo cảnh báo giả.
- **Thanh nhẹ theo cách đọc phổ biến trong giáo trình**: 不客气 `qi`, 对不起 `bu`, 没关系 `xi`, 谢谢 `xie` (từ điển pinyin-pro ghi thanh đầy đủ; validator bỏ qua âm tiết thanh nhẹ nên không báo).
- **words.json Chương 1** = 6 từ ở bảng chương SPEC (你好 谢谢 不客气 再见 对不起 没关系) + 4 từ mà bài mẫu SPEC 12.4 dùng (你 好 老师 你们好). 你好 và 谢谢 chép nguyên từ SPEC 12.2, chỉ thêm `pos` "động từ" cho 谢谢.
- **`pos` "cụm từ"** cho các câu giao tiếp cố định (再见, 对不起, 不客气, 没关系, 你们好), dù từ điển có thể ghi 再见/对不起 là động từ.
- **Chưa thêm exception list** cho chữ đa âm: 10 từ Chương 1 không có 了/的/得 và `validate:content` không báo sai chữ nào. Mục Known issues vẫn giữ.
- **Bài đầu Chương 1 = u01-l01 "Xin chào!"**, chép nguyên SPEC 12.4. SPEC 12.5 xếp bài Biến điệu vào Chương 0, không phải Chương 1 → bài Biến điệu vẫn chờ (dự kiến `u00-l05`, giờ đã có từ 你好/不客气 để dùng); chưa viết vì không được yêu cầu và Chương 0 đã duyệt.
- **Tạo `hanzi.json` với đúng 1 chữ 好** (chép nguyên SPEC 12.3) vì u01-l01 có `hanziOfLesson: "好"`; `validate:content` giờ báo lỗi nếu `hanziOfLesson` chưa có trong hanzi.json.
- **Chương u01**: tiêu đề "Chào hỏi" (bảng chương SPEC), trạm "Bắc Kinh" (SPEC Mục 7), `theme` `#E63946` (đỏ đèn lồng = `--primary`), `emoji` 🏮.
- **Noto Sans SC nạp động sau lần vẽ đầu** (`import()` trong `main.tsx`) thay vì precache theo lát như mục "Quyết định đã chốt" — bản @fontsource đã chia 100+ lát theo `unicode-range`, trình duyệt tự tải lát cần; precache chọn lọc để M9 (PWA) quyết.
- **E2E chạy cả 2 thiết bị trên Chromium** (iPhone 13 chỉ giả lập viewport, không cài WebKit) để nhẹ máy dev/CI.
- **Icon PWA = Bao trên nền đỏ**, sinh từ chính component `Bao`; file PNG được commit (không gitignore như `public/hanzi`).
- **u00-l05 Biến điệu** dùng 3 từ mới 不 / 一 / 不是 (不是 mượn 是 của Chương 2); 你好 chỉ nhắc trong keyPoint vì đã là mục mới của u01-l01 — không lặp một item ở hai bài để SRS không tạo thẻ trùng.
- **Chương 1 = 4 bài**: l01 Xin chào (SPEC 12.4), l02 Cảm ơn & Xin lỗi, l03 Tạm biệt (1 từ), l04 Thử thách chương (`isChallenge`, `newItems: []`, `reviewItems` = 8 từ). Không thêm từ ngoài danh sách chương của SPEC.
- **Góc Chữ Hán**: 好 人 chép SPEC 12.3; thêm 女 子 日 月 (chữ tượng hình đơn giản, `pictograph: true`). Gán `hanziOfLesson`: u00-l05 女, u01-l02 人, u01-l03 日.
- **Thẻ Văn Hóa** gán cho chương: u00 → số 8, u01 → Tết Trung Thu (chương 2–12 chưa gán). Thẻ có `zh`/`pinyin` được validator đối chiếu như từ vựng.
- **Trạm chương 2–12** SPEC chỉ nêu Chương 1 Bắc Kinh, 6 quán trà, 9 Hoàng Sơn; các trạm còn lại tự đặt (Thượng Hải, Chợ đêm Tây An, Tứ hợp viện, Tháp Trống, Lệ Giang, Đại học Bắc Kinh, Ga tàu cao tốc, Sông Ly Quế Lâm, Vạn Lý Trường Thành). `plannedWords` chép đúng bảng SPEC Mục 3.
- **`copy-hanzi-data` bỏ qua `course.json`** để không precache nét của `plannedWords` chưa dạy (141 → 77 chữ; 77 gồm cả chữ trong Thẻ Văn Hóa).
