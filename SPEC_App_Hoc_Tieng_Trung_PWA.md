# 🐉 SPEC: "Nǐ Hǎo Mỗi Ngày" — PWA học tiếng Trung cho người mới bắt đầu

> **Tài liệu này dùng để giao cho Claude Code "vibe code" toàn bộ ứng dụng.**
> Đọc từ đầu đến cuối trước khi viết dòng code đầu tiên. Làm theo đúng thứ tự các **Milestone** ở Mục 14.
> Mọi chữ hiển thị cho người dùng bằng **tiếng Việt**. Dữ liệu người dùng **chỉ lưu local** trên thiết bị (IndexedDB). Không có backend, không đăng nhập.

---

## Mục lục

1. Tổng quan sản phẩm
2. Nguyên tắc sư phạm (vì sao học dễ & nhớ lâu)
3. Cấu trúc khóa học
4. Vòng lặp một buổi học (Lesson Flow)
5. Thẻ Cô Đọng — tổng kết sau mỗi lần học
6. Các dạng bài tập
7. Gamification — cảm giác thích thú, mới mẻ
8. Bố cục & màn hình (wireframe)
9. Design system
10. Kiến trúc kỹ thuật & tech stack
11. Mô hình dữ liệu (TypeScript + Dexie)
12. Định dạng nội dung bài học (JSON) + ví dụ
13. Thuật toán ôn tập ngắt quãng (SRS)
14. Lộ trình build cho Claude Code (Milestones + tiêu chí nghiệm thu)
15. PWA, offline, lưu trữ & sao lưu
16. Kiểm thử, hiệu năng, triển khai
17. Prompt khởi động cho Claude Code + file `CLAUDE.md`

---

## 1. Tổng quan sản phẩm

| Hạng mục | Mô tả |
|---|---|
| Tên tạm | **Nǐ Hǎo Mỗi Ngày** (có thể đổi) |
| Đối tượng | Người Việt chưa biết gì tiếng Trung, mục tiêu đạt trình độ **HSK 1 → HSK 2** |
| Hình thức | **PWA** (Progressive Web App): mở bằng trình duyệt, "Thêm vào màn hình chính", chạy offline như app thật |
| Thời lượng 1 bài | **5–8 phút** (học được cả lúc chờ xe buýt) |
| Linh vật | **Bao** — chú bánh bao tròn, biểu cảm thay đổi theo kết quả (vui, ngạc nhiên, cổ vũ, ngủ gật khi lâu không học) |
| Lưu trữ | IndexedDB trên máy, có **xuất/nhập file sao lưu JSON** |
| Điểm khác biệt | (1) Cầu nối **Hán-Việt** cho người Việt, (2) **Thẻ Cô Đọng** sau mỗi bài, (3) **không phạt** khi sai, (4) màu **thanh điệu** xuyên suốt, (5) mini-game xoay vòng để luôn mới |

### Mục tiêu trải nghiệm (đo được)
- Người mới mở app lần đầu → hoàn thành bài 1 trong **≤ 3 phút**, không cần đăng ký.
- Sau mỗi bài, người học trả lời được: "Hôm nay mình học được gì?" bằng 1 thẻ tóm tắt.
- Tỷ lệ đúng mục tiêu trong bài: **75–90%** (đủ thử thách nhưng không nản).

---

## 2. Nguyên tắc sư phạm

Đây là "linh hồn" của app. Claude Code phải hiện thực hóa từng nguyên tắc bằng tính năng cụ thể.

| # | Nguyên tắc | Hiện thực trong app |
|---|---|---|
| 1 | **Ít mà chắc** – mỗi bài chỉ 4–6 mục mới | Giới hạn cứng `newItems ≤ 6` trong schema bài học |
| 2 | **Gợi nhớ chủ động** (active recall) | Mọi bài tập bắt người học *chọn/gõ/viết*, không chỉ đọc |
| 3 | **Ôn tập ngắt quãng** (spaced repetition) | Thuật toán SRS (Mục 13), tab "Ôn tập" hằng ngày |
| 4 | **Cầu nối Hán-Việt** | Mỗi chữ có trường `hanViet` (学生 → *học sinh*, 中国 → *Trung Quốc*). Hiển thị dạng huy hiệu nhỏ, tạo cú "à há!" |
| 5 | **Câu chuyện bộ thủ** (mnemonic) | 好 = 女 (nữ) + 子 (tử) → "mẹ bế con, thật **tốt**". 休 = 亻(người) + 木 (cây) → "người dựa gốc cây = **nghỉ**" |
| 6 | **Mã màu thanh điệu** | Thanh 1 đỏ, 2 cam, 3 xanh lá, 4 xanh dương, nhẹ xám — áp dụng cho pinyin ở MỌI nơi |
| 7 | **Nghe trước, nói sau** | Mỗi từ mới đều tự phát âm khi xuất hiện; bài tập nghe đi trước bài nói |
| 8 | **Sai là cơ hội** | Câu sai được xếp lại cuối bài ("Vòng sửa sai"), không trừ tim/mạng |
| 9 | **Cô đọng cuối buổi** | Thẻ Cô Đọng (Mục 5) bắt buộc hiện sau mỗi bài, lưu vào Sổ Tay |
| 10 | **Ngữ cảnh thật** | Mỗi bài có ≥ 1 mẫu câu + 1 mini hội thoại sử dụng ngay từ vừa học |

---

## 3. Cấu trúc khóa học

```
Khóa học
 └── Chương (Unit)       — 1 chủ đề, ~5 bài + 1 bài Thử thách
      └── Bài (Lesson)    — 5–8 phút, 4–6 mục mới
           └── Bước (Step) — giới thiệu / bài tập / hội thoại / tổng kết
```

### Lộ trình nội dung đề xuất (HSK 1, ~150 từ)

| Chương | Chủ đề | Nội dung chính |
|---|---|---|
| 0 | **Làm quen Pinyin & Thanh điệu** | 4 thanh + thanh nhẹ, thanh mẫu, vận mẫu, biến điệu thanh 3 (你好 đọc *ní hǎo*), 不 biến điệu |
| 1 | Chào hỏi | 你好, 谢谢, 不客气, 再见, 对不起, 没关系 |
| 2 | Giới thiệu bản thân | 我, 你, 他/她, 是, 叫, 名字, 人, 中国, 越南 |
| 3 | Số đếm & Tuổi | 一→十, 几, 多大, 岁 |
| 4 | Gia đình | 爸爸, 妈妈, 儿子, 女儿, 家, 有, 没有 |
| 5 | Thời gian | 今天, 明天, 昨天, 年, 月, 日, 星期, 点, 分 |
| 6 | Ăn uống | 吃, 喝, 米饭, 茶, 水, 菜, 喜欢, 想 |
| 7 | Mua sắm | 买, 多少, 钱, 块, 个, 本, 这/那 |
| 8 | Trường học & Công việc | 学生, 老师, 学校, 同学, 工作, 医生 |
| 9 | Thời tiết | 天气, 热, 冷, 下雨, 太…了 |
| 10 | Đi lại & Nơi chốn | 去, 来, 在, 哪儿, 这儿, 那儿, 飞机, 出租车 |
| 11 | Sở thích & Hoạt động | 看, 听, 说, 读, 写, 电影, 书, 会, 能 |
| 12 | **Tổng ôn HSK 1** | Bài thi thử mô phỏng HSK 1 (nghe + đọc) |

Song song có **"Góc Chữ Hán"**: 1 chữ tượng hình cổ mỗi bài (人 口 日 月 山 水 火 木 大 小 女 子…) với animation **"tiến hóa chữ"** (giáp cốt → kim văn → hiện đại, dùng SVG đơn giản tự vẽ).

> **Phạm vi MVP:** Chương 0, 1, 2 đầy đủ nội dung (~15 bài). Các chương còn lại tạo **khung JSON** để bổ sung dần.

---

## 4. Vòng lặp một buổi học (Lesson Flow)

Mỗi bài đi qua **5 giai đoạn**, có thanh tiến trình trên cùng:

```
┌──────────┬──────────────┬──────────────┬─────────────┬──────────────┐
│ 1. KHỞI  │ 2. KHÁM PHÁ  │ 3. LUYỆN TẬP │ 4. THỬ      │ 5. CÔ ĐỌNG   │
│   ĐỘNG   │   (học mới)  │  (mini-game) │   THÁCH     │  (tổng kết)  │
│  ~1 phút │   ~2 phút    │   ~2-3 phút  │   ~1 phút   │   ~30 giây   │
└──────────┴──────────────┴──────────────┴─────────────┴──────────────┘
```

### 4.1 Khởi động (Warm-up)
- 2–3 câu ôn nhanh từ các bài trước (lấy từ hàng đợi SRS đến hạn). Bỏ qua nếu là bài đầu tiên.
- Mục đích: kích hoạt trí nhớ, tạo cảm giác "mình nhớ được nè!".

### 4.2 Khám phá (Discover) — giới thiệu từng mục mới
Mỗi mục mới là **1 thẻ lật** gồm:
1. Chữ Hán lớn (cỡ 96–120px) + **tự phát âm** khi hiện.
2. Pinyin tô màu thanh điệu.
3. Nghĩa tiếng Việt + huy hiệu **Hán-Việt**.
4. Nút "🔍 Thám tử chữ": tách bộ thủ + câu chuyện ghi nhớ.
5. Nút "✍️ Xem nét viết": animation thứ tự nét (Hanzi Writer).
6. 1 câu ví dụ ngắn.
7. Ngay sau mỗi thẻ là **1 câu hỏi nhanh** về chính mục đó (học → kiểm tra ngay).

### 4.3 Luyện tập (Practice)
- 6–10 bài tập trộn từ các dạng ở Mục 6, **không lặp 2 dạng giống nhau liên tiếp**.
- Độ khó tăng dần: nhận diện → nghe → ghép → sắp câu → viết.
- **Combo**: đúng liên tiếp 3/5/10 câu → hiệu ứng lửa + Bao nhảy múa + XP thưởng.

### 4.4 Thử thách (Challenge)
- 1 tình huống mini hội thoại (VD: "Bạn gặp thầy giáo ở cổng trường, chào thế nào?").
- Hoặc 1 câu "Boss": sắp xếp câu dài nhất của bài / nghe cả câu chọn nghĩa.

### 4.5 Vòng sửa sai (nếu có)
- Mọi câu sai trong bài được hỏi lại lần nữa (có thể đổi dạng bài) trước khi kết thúc.
- Thông điệp tích cực: *"Gỡ lại 2 câu nhé, lần này chắc chắn được!"*

### 4.6 Cô Đọng (Recap) → xem Mục 5.

### Quy tắc phản hồi sau mỗi câu
| Kết quả | Phản hồi |
|---|---|
| Đúng | Âm thanh "ting", rung nhẹ (Android), viền xanh, phát âm lại từ, câu khen ngẫu nhiên ("Tuyệt!", "Chuẩn luôn!", "好！") |
| Sai | Âm thanh nhẹ (không chói), hiện đáp án đúng + **giải thích ngắn 1 dòng** (VD: "Thanh 3 đi xuống rồi lên: hǎo"), nút "Hiểu rồi" |
| Dùng gợi ý | Tính là "Khó" cho SRS, vẫn được qua |

---

## 5. Thẻ Cô Đọng — tổng kết sau mỗi lần học (TÍNH NĂNG CỐT LÕI)

Sau mỗi bài, hiện một **thẻ tổng kết đẹp như tấm postcard**, tự động lưu vào tab **Sổ Tay**.

### 5.1 Cấu trúc thẻ

```
┌─────────────────────────────────────────┐
│  🏮 CÔ ĐỌNG · Bài 1.3 · Cảm ơn & Xin lỗi │
│─────────────────────────────────────────│
│  ① 3 ĐIỀU CẦN NHỚ                        │
│   • 谢谢 xièxie = cảm ơn (2 thanh 4 → nhẹ)│
│   • 对不起 duìbuqǐ = xin lỗi             │
│   • Đáp lại: 不客气 / 没关系              │
│                                          │
│  ② MẪU CÂU VÀNG                          │
│   A: 谢谢你！   B: 不客气！               │
│                                          │
│  ③ MẸO NHỚ                               │
│   谢 có bộ 讠(lời nói) → cảm ơn bằng lời  │
│                                          │
│  ④ CẦN ÔN THÊM  (từ bạn làm sai)         │
│   没关系 méi guānxi                       │
│                                          │
│  ⑤ HÔM NAY: +60 XP · Chuỗi 🔥 4 ngày     │
│     Chính xác 86% · 5 từ mới              │
│─────────────────────────────────────────│
│ [🔊 Nghe lại tất cả] [⭐ Lưu] [Tiếp tục →]│
└─────────────────────────────────────────┘
```

### 5.2 Nguồn dữ liệu của thẻ
| Phần | Nguồn |
|---|---|
| ① 3 điều cần nhớ | Trường `recap.keyPoints` (tối đa 3) trong JSON bài học — **viết tay**, ngắn gọn |
| ② Mẫu câu vàng | `recap.pattern` |
| ③ Mẹo nhớ | `recap.tip` |
| ④ Cần ôn thêm | **Tự động**: các item làm sai/dùng gợi ý trong bài (tối đa 3). Nếu không sai câu nào → hiện "🎯 Hoàn hảo! Không có lỗi nào" |
| ⑤ Thống kê | Tính từ session hiện tại |

### 5.3 Tính năng xoay quanh Thẻ Cô Đọng
- **Sổ Tay** (tab riêng): danh sách thẻ theo chương, có tìm kiếm, đánh dấu ⭐.
- **Nghe lại tất cả**: đọc lần lượt các từ & mẫu câu bằng TTS.
- **Lưu thành ảnh** (tùy chọn, Milestone sau): dùng `html-to-image` để chia sẻ.
- **Tổng kết tuần**: mỗi Chủ nhật (hoặc sau 7 ngày) gộp tất cả thẻ tuần thành 1 "Bản tin tuần": số từ, chữ khó nhất, chữ được học nhiều nhất, biểu đồ XP 7 ngày.
- **Tổng kết chương**: sau bài Thử thách của chương → "Bảng Cô Đọng Chương" + mở **Hộp Bí Ẩn** (xem Mục 7).

---

## 6. Các dạng bài tập

Mỗi dạng là 1 React component độc lập, nhận cùng interface `ExerciseProps` (Mục 11). Có `type` để registry tự render.

| `type` | Tên hiển thị | Mô tả | Dùng cho |
|---|---|---|---|
| `meaning_choice` | Chọn nghĩa | Hiện chữ Hán (+ âm thanh) → chọn 1 trong 4 nghĩa | Nhận diện |
| `hanzi_choice` | Chọn chữ | Hiện nghĩa tiếng Việt → chọn chữ Hán đúng | Nhận diện ngược |
| `listen_choice` | Nghe & chọn | Chỉ phát âm → chọn chữ/pinyin | Nghe |
| `tone_pick` | Bắt thanh điệu | Nghe 1 âm tiết → chọn thanh 1/2/3/4 (4 nút màu có hình đường cong thanh) | Thanh điệu |
| `pinyin_build` | Ghép pinyin | Ghép thanh mẫu + vận mẫu + thanh để tạo pinyin đúng | Chương 0 |
| `match_pairs` | Ghép cặp | 4–5 cặp chữ ↔ nghĩa, chạm 2 ô để nối; ghép đúng thì biến mất | Ôn nhanh, vui |
| `sentence_order` | Sắp xếp câu | Kéo/chạm các thẻ từ để tạo câu đúng theo nghĩa tiếng Việt | Ngữ pháp |
| `fill_blank` | Điền chỗ trống | Câu có 1 ô trống, chọn từ phù hợp | Ngữ cảnh |
| `stroke_write` | Viết chữ | Viết theo nét trên canvas (Hanzi Writer quiz mode), có gợi ý sau 2 lần sai | Viết |
| `dialogue` | Hội thoại | Bong bóng chat, người học chọn câu trả lời phù hợp | Thử thách |
| `speak` *(tùy chọn)* | Nói thử | Dùng Web Speech Recognition `zh-CN` nếu trình duyệt hỗ trợ; nếu không → ẩn dạng này | Nói |

### Quy tắc sinh đáp án nhiễu (distractors)
1. Ưu tiên từ **cùng bài**, rồi cùng chương, rồi các chương đã học.
2. Với `listen_choice`/`tone_pick`: ưu tiên từ **cùng pinyin khác thanh** (mā/má/mǎ/mà) hoặc phát âm gần.
3. Với `hanzi_choice`: ưu tiên chữ **giống hình** (trường `similar` trong dữ liệu, VD: 人/入/八, 大/太/天).
4. Không bao giờ có 2 đáp án trùng nghĩa.
5. Trộn vị trí đáp án đúng ngẫu nhiên (seeded random để test được).

### Sinh bài tập tự động
- File JSON bài học có thể khai báo bài tập **thủ công** (`exercises: [...]`) **và/hoặc** để engine **tự sinh** từ `newItems` theo công thức:
  `với mỗi item: 1 câu ngay sau thẻ Khám phá` + `pool luyện tập = trộn (meaning_choice, listen_choice, hanzi_choice, match_pairs, tone_pick, stroke_write)` + `câu do tác giả viết (sentence_order, fill_blank, dialogue)`.
- Engine: `src/engine/exerciseGenerator.ts`, hàm thuần (pure), có unit test.

---

## 7. Gamification — cảm giác thích thú, mới mẻ

> **Triết lý:** Thưởng nhiều, phạt không. Mỗi lần mở app đều có một điều nhỏ mới lạ.

### 7.1 Hệ thống điểm & tiến độ
| Yếu tố | Quy tắc |
|---|---|
| **XP** | Đúng lần đầu +10, đúng sau gợi ý +5, combo 5 +10, bài hoàn hảo +20, ôn tập mỗi thẻ +5 |
| **Cấp độ** | Cấp N cần `100 × N` XP. Danh hiệu theo cấp: *Mầm non → Học trò → Thư sinh → Tú tài → Cử nhân → Trạng nguyên* |
| **Mục tiêu ngày** | Chọn khi onboarding: Thư thả 30 XP / Đều đặn 50 / Chăm chỉ 100. Hiển thị **vòng tròn tiến độ** |
| **Chuỗi ngày 🔥** | Đạt mục tiêu ngày → +1. Có **"Bùa giữ lửa"**: tự nhận 1 bùa mỗi 7 ngày liên tục, tự dùng khi lỡ 1 ngày (tối đa giữ 2) |
| **Không có "tim/mạng"** | Không giới hạn số lần sai |

### 7.2 Yếu tố mới mẻ (quan trọng để không nhàm)
1. **Bản đồ hành trình**: tab Học là một con đường uốn lượn (như bản đồ du lịch Trung Hoa), mỗi chương là 1 "trạm" có hình minh họa riêng: Chương 1 Bắc Kinh, Chương 6 quán trà, Chương 9 núi Hoàng Sơn… Các bài là những viên đá/đèn lồng trên đường.
2. **Hộp Bí Ẩn** sau mỗi chương: mở ra 1 **Thẻ Văn Hóa** sưu tầm được (Tết Trung Thu, ý nghĩa số 8, cách dùng đũa, trà Long Tỉnh, 12 con giáp…). Có trang "Bộ sưu tập" với ô trống chờ mở.
3. **Chữ Hán của ngày**: màn hình chính hiện 1 chữ mỗi ngày (chọn theo ngày, seeded) + câu chuyện bộ thủ, chạm để xem tiến hóa chữ.
4. **Thử thách nhanh 60 giây** ("Tốc Độ"): ghép cặp càng nhiều càng tốt trong 60 giây, lưu kỷ lục cá nhân.
5. **Linh vật Bao** phản ứng theo ngữ cảnh: vui khi đúng, ôm đầu khi sai (dễ thương, không chê), ngủ gật nếu 2 ngày không học, mặc áo Tết vào dịp lễ (dựa theo ngày hệ thống).
6. **Xoay vòng dạng bài**: engine đảm bảo mỗi bài có ≥ 4 dạng bài khác nhau.
7. **Hiệu ứng**: confetti khi xong bài (`canvas-confetti`), đèn lồng bay khi lên cấp, chữ Hán "nở" ra khi học xong.

### 7.3 Huy hiệu (Achievements)
| ID | Tên | Điều kiện |
|---|---|---|
| `first_lesson` | Bước chân đầu tiên | Xong bài đầu |
| `tone_master` | Bậc thầy thanh điệu | 50 câu `tone_pick` đúng |
| `streak_7` | Lửa bền 7 ngày | Chuỗi 7 ngày |
| `streak_30` | Rồng lửa | Chuỗi 30 ngày |
| `perfect_5` | Hoàn hảo ×5 | 5 bài không sai câu nào |
| `writer_50` | Thư pháp gia nhí | Viết đúng 50 chữ |
| `words_100` | Trăm từ | Học 100 từ |
| `night_owl` | Cú đêm | Học sau 22h |
| `early_bird` | Chim sớm | Học trước 7h |
| `collector` | Nhà sưu tầm | Mở 5 Thẻ Văn Hóa |

---

## 8. Bố cục & màn hình (wireframe)

### 8.1 Điều hướng chính — Bottom Tab Bar (4 tab)
```
┌──────────┬──────────┬──────────┬──────────┐
│  🗺️ Học   │ 🔁 Ôn tập │ 📒 Sổ Tay │ 🐉 Tôi    │
└──────────┴──────────┴──────────┴──────────┘
```
- Tab Ôn tập có **badge số thẻ đến hạn**.
- Trong màn hình làm bài: **ẩn tab bar**, toàn màn hình, nút ✕ ở góc trái (hỏi xác nhận trước khi thoát).

### 8.2 Màn hình "Học" (Home)
```
┌─────────────────────────────────┐
│ 🔥 4   ⭐ Cấp 3   ◯ 35/50 XP     │  ← Header cố định
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 字 CHỮ CỦA NGÀY:  休 xiū     │ │  ← Card Chữ của ngày
│ │ 亻+ 木 = người tựa cây = NGHỈ │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ▶ TIẾP TỤC: Bài 1.3          │ │  ← CTA lớn, luôn thấy
│ │   Cảm ơn & Xin lỗi · 6 phút  │ │
│ └─────────────────────────────┘ │
│                                 │
│     Chương 1 · Chào hỏi 🏯       │
│        (✓)                      │  ← Bản đồ hành trình
│            (✓)                  │     node: ✓ xong / ● hiện tại
│        (●)  ← Bao đứng đây       │           🔒 khóa / 🏆 thử thách
│            (🔒)                  │
│        (🏆)                      │
│     Chương 2 · Giới thiệu 🧑     │
│            (🔒) ...              │
└─────────────────────────────────┘
```

### 8.3 Màn hình làm bài
```
┌─────────────────────────────────┐
│ ✕  ▓▓▓▓▓▓▓▓░░░░░░░  🔥×3         │  ← tiến độ + combo
├─────────────────────────────────┤
│   Chữ này nghĩa là gì?           │  ← đề bài
│                                 │
│            好                    │  ← chữ to, chạm để nghe
│          🔊 hǎo                   │
│                                 │
│  ┌──────────┐  ┌──────────┐     │
│  │  tốt     │  │  to lớn   │     │  ← 4 đáp án, ô lớn ≥ 56px
│  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐     │
│  │  người   │  │  miệng    │     │
│  └──────────┘  └──────────┘     │
├─────────────────────────────────┤
│  💡 Gợi ý         [ KIỂM TRA ]   │  ← vùng ngón cái
└─────────────────────────────────┘
   ↓ sau khi kiểm tra: bottom sheet trượt lên
┌─────────────────────────────────┐
│ ✅ Chuẩn luôn!   好 hǎo = tốt     │
│ Hán-Việt: HẢO                    │
│                    [ TIẾP TỤC ]  │
└─────────────────────────────────┘
```

### 8.4 Màn hình "Ôn tập"
- Đầu trang: "Hôm nay có **12** thẻ cần ôn · ~3 phút" + nút **Bắt đầu ôn**.
- Bên dưới: biểu đồ mini số thẻ đến hạn 7 ngày tới; phân loại thẻ: *Mới / Đang học / Thuộc / Thành thạo*.
- Nút phụ: "⚡ Tốc Độ 60s", "✍️ Luyện viết tự do", "🎧 Luyện thanh điệu".
- Nếu 0 thẻ đến hạn: Bao cầm cúp, "Hết bài ôn rồi! Học bài mới nhé?".

### 8.5 Màn hình "Sổ Tay"
- Thanh tìm kiếm (chữ Hán / pinyin không dấu / tiếng Việt).
- Segmented control: **Thẻ Cô Đọng | Từ vựng | Chữ Hán | Ngữ pháp**.
- Mỗi từ có trang chi tiết: chữ, pinyin, Hán-Việt, nghĩa, bộ thủ, câu ví dụ, nét viết, trạng thái SRS, nút 🔊.

### 8.6 Màn hình "Tôi"
- Avatar Bao + tên (tự đặt, lưu local), cấp, tổng XP, số từ đã học.
- Lịch chuỗi ngày dạng heatmap (kiểu GitHub, 12 tuần).
- Huy hiệu + Bộ sưu tập Thẻ Văn Hóa.
- **Cài đặt**: mục tiêu ngày, tốc độ đọc TTS (0.6–1.0), bật/tắt âm thanh, bật/tắt rung, hiện/ẩn pinyin (chế độ thử thách), hiện/ẩn Hán-Việt, giao diện sáng/tối/theo hệ thống, nhắc nhở học (xem Mục 15.4).
- **Dữ liệu**: Xuất sao lưu (.json), Nhập sao lưu, Xóa toàn bộ dữ liệu (xác nhận 2 bước).

### 8.7 Onboarding (lần đầu mở app, 4 màn, có nút Bỏ qua)
1. Bao chào: "你好! Mình là Bao. Cùng học tiếng Trung 5 phút mỗi ngày nhé!"
2. "Bạn là người Việt — bạn đã biết sẵn hàng ngàn từ Hán-Việt!" (ví dụ 学生 = học sinh, có animation).
3. Chọn mục tiêu ngày (30/50/100 XP).
4. Hướng dẫn "Thêm vào màn hình chính" (phát hiện iOS/Android, hiển thị hướng dẫn tương ứng) → vào thẳng Bài 0.1.

---

## 9. Design system

### 9.1 Màu sắc (CSS variables, hỗ trợ dark mode)
| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--bg` | `#FFF9F2` (giấy dó ấm) | `#17130F` | nền |
| `--surface` | `#FFFFFF` | `#231D18` | card |
| `--primary` | `#E63946` (đỏ đèn lồng) | `#FF5A66` | CTA, nhấn mạnh |
| `--accent` | `#F4A261` (vàng cam) | `#F6B27A` | XP, thưởng |
| `--success` | `#2A9D8F` | `#3CC2B1` | đúng |
| `--error` | `#E76F51` | `#F08A70` | sai (cam đỏ, không gắt) |
| `--text` | `#2B2118` | `#F3ECE4` | chữ chính |
| `--muted` | `#8C7B6B` | `#A89888` | chữ phụ |

**Màu thanh điệu (bất biến, mọi nơi):**
| Thanh | Màu | Ký hiệu đường cong |
|---|---|---|
| 1 (ā) | `#E63946` đỏ | ‾ ngang cao |
| 2 (á) | `#F4A261` cam | ↗ đi lên |
| 3 (ǎ) | `#2A9D8F` xanh lá | ↘↗ xuống-lên |
| 4 (à) | `#457B9D` xanh dương | ↘ đi xuống |
| nhẹ (a) | `#8C7B6B` xám | · |

### 9.2 Font chữ (self-host để chạy offline — dùng `@fontsource`)
- Tiếng Việt / UI: **Be Vietnam Pro** (400, 600, 800).
- Chữ Hán: **Noto Sans SC** (subset chỉ các chữ dùng trong khóa học nếu có thể, để nhẹ) — dự phòng `"PingFang SC", "Microsoft YaHei", sans-serif`.
- Chữ Hán trang trí (tiêu đề chương): **Ma Shan Zheng** hoặc **ZCOOL KuaiLe** (tùy chọn).

### 9.3 Kích thước & bố cục
- Mobile-first, thiết kế cho chiều rộng **360–430px**; trên màn lớn, nội dung giới hạn `max-width: 480px` căn giữa.
- Khoảng cách theo thang 4px: 4 / 8 / 12 / 16 / 24 / 32.
- Bo góc: card 20px, nút 16px, chip 999px.
- Vùng chạm tối thiểu **48×48px**; nút chính cao 56px, đặt trong **vùng ngón cái** (1/3 dưới màn hình).
- Hỗ trợ `env(safe-area-inset-*)` cho tai thỏ/thanh home iPhone.
- Nút 3D kiểu "nhấn lún": `border-bottom: 4px solid <màu đậm hơn>`, khi active dịch xuống 2px.

### 9.4 Chuyển động (framer-motion)
- Chuyển câu hỏi: trượt ngang 250ms.
- Đúng: nút "nảy" (scale 1 → 1.08 → 1), viền xanh.
- Sai: rung ngang nhẹ (shake 300ms).
- Bottom sheet kết quả: spring.
- Tôn trọng `prefers-reduced-motion` → tắt hiệu ứng lớn, giữ fade.

### 9.5 Âm thanh & rung
- Âm thanh UI ngắn (< 0.3s), tạo bằng **Web Audio API** (oscillator) để không cần file — hoặc file `.mp3` nhỏ trong `/public/sfx`.
- Rung: `navigator.vibrate(15)` khi đúng, `[30,40,30]` khi sai — bọc trong kiểm tra hỗ trợ (iOS Safari không hỗ trợ, phải bỏ qua êm).

### 9.6 Trợ năng (a11y)
- Mọi nút có `aria-label` tiếng Việt; màu thanh điệu luôn kèm **dấu pinyin** (không chỉ dựa vào màu).
- Độ tương phản chữ ≥ 4.5:1.
- Hỗ trợ cỡ chữ hệ thống (dùng `rem`).

---

## 10. Kiến trúc kỹ thuật & tech stack

### 10.1 Stack
| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Build | **Vite** + **TypeScript** (strict) | nhanh, chuẩn |
| UI | **React 18** | hệ sinh thái lớn |
| Style | **Tailwind CSS** + CSS variables | nhanh, dark mode dễ |
| Router | **react-router-dom** (HashRouter hoặc BrowserRouter + fallback) | điều hướng |
| State | **Zustand** | gọn, ít boilerplate |
| DB local | **Dexie.js** (IndexedDB) + `dexie-react-hooks` | truy vấn tiện, live query |
| PWA | **vite-plugin-pwa** (Workbox, `generateSW`) | manifest + service worker + precache |
| Animation | **framer-motion** | chuyển động mượt |
| Viết chữ | **hanzi-writer** + dữ liệu nét từ **hanzi-writer-data** (đóng gói local) | animation + quiz viết |
| Phát âm | **Web Speech API** `speechSynthesis` (`lang="zh-CN"`) | miễn phí, offline trên nhiều máy |
| Hiệu ứng | **canvas-confetti** | ăn mừng |
| Ngày giờ | **date-fns** | tính streak, lịch ôn |
| Test | **Vitest** + **@testing-library/react** + **Playwright** | unit + e2e |
| Lint | ESLint + Prettier | nhất quán |

> Không dùng backend, không analytics bên thứ ba, không gọi API ngoài khi chạy (trừ khi người dùng tự bật tính năng tương lai).

### 10.2 Cấu trúc thư mục
```
nihao-moingay/
├── CLAUDE.md                      # quy ước cho Claude Code (Mục 17)
├── index.html
├── vite.config.ts                 # cấu hình PWA ở đây
├── tailwind.config.ts
├── public/
│   ├── icons/                     # icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
│   ├── hanzi/                     # JSON nét viết của từng chữ dùng trong khóa (VD: 好.json)
│   ├── audio/                     # (tùy chọn) mp3 dự phòng khi máy không có giọng zh-CN
│   └── sfx/
├── scripts/
│   ├── copy-hanzi-data.ts         # quét content/, copy dữ liệu nét các chữ cần từ node_modules/hanzi-writer-data
│   └── validate-content.ts        # kiểm tra schema JSON nội dung (zod)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/                    # Home, Lesson, Review, Notebook, Profile, Onboarding, WordDetail, RecapDetail
│   ├── components/
│   │   ├── ui/                    # Button, Card, ProgressBar, BottomSheet, TabBar, Chip, Ring
│   │   ├── hanzi/                 # HanziDisplay, Pinyin (tô màu), ToneBadge, HanVietBadge, StrokeAnimator
│   │   ├── mascot/                # Bao (SVG + các trạng thái cảm xúc)
│   │   ├── map/                   # JourneyMap, LessonNode
│   │   ├── recap/                 # RecapCard, WeeklyRecap
│   │   └── exercises/             # mỗi dạng bài 1 file + registry.ts
│   ├── engine/
│   │   ├── lessonRunner.ts        # state machine của buổi học
│   │   ├── exerciseGenerator.ts   # sinh bài tập + distractors
│   │   ├── srs.ts                 # thuật toán ôn tập
│   │   ├── xp.ts                  # XP, cấp, streak
│   │   ├── achievements.ts
│   │   └── random.ts              # seeded RNG
│   ├── services/
│   │   ├── tts.ts                 # phát âm, chọn giọng zh-CN, fallback audio
│   │   ├── sfx.ts
│   │   ├── haptics.ts
│   │   ├── backup.ts              # export/import JSON
│   │   └── storage.ts             # navigator.storage.persist()
│   ├── db/
│   │   ├── schema.ts              # Dexie
│   │   └── repositories.ts        # hàm đọc/ghi
│   ├── content/
│   │   ├── index.ts               # nạp & index toàn bộ nội dung
│   │   ├── course.json            # danh sách chương
│   │   ├── units/u00-pinyin/…     # mỗi bài 1 file JSON
│   │   ├── words.json             # từ điển chung của khóa
│   │   ├── hanzi.json             # thông tin chữ đơn: bộ thủ, mẹo, chữ giống
│   │   └── culture.json           # Thẻ Văn Hóa
│   ├── store/                     # zustand: useSettings, useSession, useUI
│   ├── types/                     # toàn bộ TypeScript types (Mục 11)
│   ├── utils/                     # pinyin (đổi số → dấu, tách thanh), date, format
│   └── styles/index.css
└── tests/
    ├── unit/
    └── e2e/
```

### 10.3 Luồng dữ liệu
```
content/*.json (tĩnh, đóng gói trong bundle, read-only)
        │
        ▼
 content/index.ts  ──►  engine (pure functions: sinh bài, chấm, SRS, XP)
                               │
                               ▼
                   Zustand (state phiên học, UI)
                               │
                               ▼
                 Dexie / IndexedDB (tiến độ người dùng)
```
- **Nội dung khóa học KHÔNG lưu vào IndexedDB** — luôn đọc từ bundle; IndexedDB chỉ lưu tiến độ, tham chiếu bằng `id`.
- Có `contentVersion` để xử lý khi cập nhật nội dung (item bị xóa → bỏ qua thẻ SRS mồ côi).

---

## 11. Mô hình dữ liệu

### 11.1 Types nội dung (`src/types/content.ts`)
```ts
export type Tone = 1 | 2 | 3 | 4 | 5; // 5 = thanh nhẹ

export interface Syllable {
  hanzi: string;          // "好"
  pinyin: string;         // "hǎo"  (dạng có dấu)
  tone: Tone;             // 3
  spokenTone?: Tone;      // thanh thực tế khi biến điệu, VD 你 trong 你好 → 2
}

export interface Word {
  id: string;             // "w_nihao"
  hanzi: string;          // "你好"
  syllables: Syllable[];
  meaning: string;        // "xin chào"
  hanViet?: string;       // "nễ hảo"
  pos?: string;           // "cụm từ" | "danh từ" | "động từ" …
  example?: { zh: string; pinyin: string; vi: string };
  note?: string;          // "Hai thanh 3 đứng cạnh nhau → thanh 3 đầu đọc thành thanh 2: ní hǎo"
  tags?: string[];        // ["hsk1", "chao-hoi"]
  audio?: string;         // "/audio/w_nihao.mp3" (tùy chọn)
}

export interface HanziInfo {
  char: string;           // "好"
  pinyin: string;
  hanViet?: string;       // "hảo"
  meaning: string;
  components?: { char: string; meaning: string }[]; // [{char:"女",meaning:"phụ nữ"},{char:"子",meaning:"con"}]
  mnemonic?: string;      // "Mẹ bế con — thật tốt!"
  strokes?: number;
  similar?: string[];     // chữ dễ nhầm
  pictograph?: boolean;   // có animation tiến hóa chữ không
}

export interface GrammarPoint {
  id: string;
  title: string;          // "Câu chữ 是: A 是 B"
  pattern: string;        // "A 是 B"
  explanation: string;
  examples: { zh: string; pinyin: string; vi: string }[];
}

export type ExerciseType =
  | 'meaning_choice' | 'hanzi_choice' | 'listen_choice' | 'tone_pick'
  | 'pinyin_build' | 'match_pairs' | 'sentence_order' | 'fill_blank'
  | 'stroke_write' | 'dialogue' | 'speak';

export interface ExerciseSpec {
  id: string;
  type: ExerciseType;
  itemId?: string;                // word/hanzi được kiểm tra
  prompt?: string;                // ghi đè đề bài mặc định
  // trường riêng theo dạng:
  tokens?: string[];              // sentence_order: ["我","是","学生"]
  answer?: string | string[];
  sentence?: string;              // fill_blank: "我___学生"
  options?: string[];             // nếu tác giả muốn cố định đáp án
  lines?: { speaker: 'A' | 'B'; zh: string; pinyin: string; vi: string; choices?: string[] }[]; // dialogue
  explain?: string;               // giải thích hiện khi sai
}

export interface Lesson {
  id: string;                     // "u01-l03"
  unitId: string;
  order: number;
  title: string;                  // "Cảm ơn & Xin lỗi"
  emoji?: string;
  estMinutes: number;
  newItems: { kind: 'word' | 'hanzi' | 'grammar'; id: string }[]; // ≤ 6
  exercises?: ExerciseSpec[];     // bài tập viết tay (sẽ trộn thêm bài tự sinh)
  autoGenerate?: boolean;         // mặc định true
  challenge?: ExerciseSpec;       // câu Boss / hội thoại
  recap: {
    keyPoints: string[];          // tối đa 3
    pattern?: { zh: string; pinyin: string; vi: string };
    tip?: string;
  };
  hanziOfLesson?: string;         // chữ cho "Góc Chữ Hán"
}

export interface Unit {
  id: string;                     // "u01"
  order: number;
  title: string;                  // "Chào hỏi"
  station: string;                // "Bắc Kinh" — tên trạm trên bản đồ
  theme: string;                  // màu/ảnh minh họa
  lessonIds: string[];
  cultureCardId?: string;         // phần thưởng Hộp Bí Ẩn
}
```

### 11.2 Types dữ liệu người dùng (`src/types/user.ts`)
```ts
export interface SrsCard {
  id: string;            // = `${kind}:${itemId}:${skill}`  VD "word:w_nihao:recognize"
  itemId: string;
  kind: 'word' | 'hanzi' | 'grammar';
  skill: 'recognize' | 'listen' | 'write';
  ease: number;          // 2.5 mặc định
  interval: number;      // ngày
  reps: number;
  lapses: number;
  due: number;           // timestamp ms
  state: 'new' | 'learning' | 'review' | 'mastered';
  lastReviewed?: number;
}

export interface LessonProgress {
  lessonId: string;
  completedAt?: number;
  bestAccuracy: number;  // 0..1
  timesCompleted: number;
  stars: 0 | 1 | 2 | 3;  // 3 = hoàn hảo
}

export interface SessionLog {
  id?: number;           // auto increment
  type: 'lesson' | 'review' | 'speed' | 'writing';
  lessonId?: string;
  startedAt: number;
  endedAt: number;
  xp: number;
  correct: number;
  total: number;
  mistakes: string[];    // itemIds
}

export interface RecapNote {
  id: string;            // `${lessonId}:${timestamp}`
  lessonId: string;
  createdAt: number;
  keyPoints: string[];
  pattern?: { zh: string; pinyin: string; vi: string };
  tip?: string;
  weakItems: string[];
  learnedItems: string[];
  stats: { xp: number; accuracy: number; streak: number };
  starred: boolean;
}

export interface DailyStat { date: string /* yyyy-MM-dd */; xp: number; minutes: number; goalMet: boolean; }

export interface Settings {
  dailyGoalXp: 30 | 50 | 100;
  ttsRate: number;           // 0.6–1.0, mặc định 0.8
  ttsVoiceURI?: string;
  sound: boolean;
  haptics: boolean;
  showPinyin: boolean;
  showHanViet: boolean;
  theme: 'light' | 'dark' | 'system';
  reminderTime?: string;     // "20:00"
  displayName?: string;
  onboarded: boolean;
}

export interface Profile {
  totalXp: number;
  level: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;     // 0..2
  lastActiveDate?: string;   // yyyy-MM-dd
  unlockedAchievements: string[];
  cultureCards: string[];
}
```

### 11.3 Dexie schema (`src/db/schema.ts`)
```ts
import Dexie, { Table } from 'dexie';

export class AppDB extends Dexie {
  srsCards!: Table<SrsCard, string>;
  lessonProgress!: Table<LessonProgress, string>;
  sessions!: Table<SessionLog, number>;
  recaps!: Table<RecapNote, string>;
  dailyStats!: Table<DailyStat, string>;
  kv!: Table<{ key: string; value: unknown }, string>; // settings, profile, meta(contentVersion)

  constructor() {
    super('nihao_db');
    this.version(1).stores({
      srsCards: 'id, itemId, kind, skill, due, state',
      lessonProgress: 'lessonId, completedAt',
      sessions: '++id, type, lessonId, startedAt',
      recaps: 'id, lessonId, createdAt, starred',
      dailyStats: 'date',
      kv: 'key',
    });
  }
}
export const db = new AppDB();
```
- Mọi thay đổi schema sau này: tăng `version(n)` + viết `upgrade()`; **không bao giờ xóa dữ liệu người dùng**.
- Ghi kết quả cuối bài trong **1 transaction** (`db.transaction('rw', [...])`) để không bị lệch dữ liệu nếu tắt app giữa chừng.
- Lưu "bài đang dở" vào `kv` (`activeSession`) sau mỗi câu → mở lại app có thể **tiếp tục bài dở**.

---

## 12. Định dạng nội dung bài học (JSON) + ví dụ

### 12.1 Quy tắc viết nội dung
- Pinyin luôn **có dấu** (ǎ, é…); có tiện ích `numToTone("ni3") → "nǐ"` để tác giả gõ nhanh nếu muốn.
- Pinyin **cách nhau từng âm tiết**, kể cả trong một từ (`"Xiè xie nǐ!"`, không viết `"Xièxie"`) để `<Pinyin>` tô màu đúng từng âm tiết.
- Mỗi bài ≤ 6 `newItems`, ≤ 3 `keyPoints`, mỗi keyPoint ≤ 80 ký tự.
- Câu tiếng Việt tự nhiên, thân thiện, xưng "bạn".
- Script `npm run validate:content` (zod) phải pass trước khi build: kiểm tra id tồn tại, không trùng, pinyin hợp lệ, mỗi `itemId` trong bài đều có trong `words.json`/`hanzi.json`.

### 12.2 Ví dụ `words.json` (trích)
```json
[
  {
    "id": "w_nihao",
    "hanzi": "你好",
    "syllables": [
      { "hanzi": "你", "pinyin": "nǐ", "tone": 3, "spokenTone": 2 },
      { "hanzi": "好", "pinyin": "hǎo", "tone": 3 }
    ],
    "meaning": "xin chào",
    "hanViet": "nễ hảo",
    "pos": "cụm từ",
    "example": { "zh": "老师，你好！", "pinyin": "Lǎo shī, nǐ hǎo!", "vi": "Em chào thầy/cô ạ!" },
    "note": "Hai thanh 3 đi liền nhau: thanh 3 đầu đọc thành thanh 2 → ní hǎo",
    "tags": ["hsk1", "chao-hoi"]
  },
  {
    "id": "w_xiexie",
    "hanzi": "谢谢",
    "syllables": [
      { "hanzi": "谢", "pinyin": "xiè", "tone": 4 },
      { "hanzi": "谢", "pinyin": "xie", "tone": 5 }
    ],
    "meaning": "cảm ơn",
    "hanViet": "tạ tạ",
    "example": { "zh": "谢谢你！", "pinyin": "Xiè xie nǐ!", "vi": "Cảm ơn bạn!" },
    "tags": ["hsk1", "chao-hoi"]
  },
  {
    "id": "w_xuesheng",
    "hanzi": "学生",
    "syllables": [
      { "hanzi": "学", "pinyin": "xué", "tone": 2 },
      { "hanzi": "生", "pinyin": "sheng", "tone": 5 }
    ],
    "meaning": "học sinh, sinh viên",
    "hanViet": "học sinh",
    "example": { "zh": "我是学生。", "pinyin": "Wǒ shì xué sheng.", "vi": "Tôi là học sinh." },
    "tags": ["hsk1"]
  }
]
```

### 12.3 Ví dụ `hanzi.json` (trích)
```json
[
  {
    "char": "好", "pinyin": "hǎo", "hanViet": "hảo", "meaning": "tốt, khỏe",
    "components": [ { "char": "女", "meaning": "phụ nữ" }, { "char": "子", "meaning": "con" } ],
    "mnemonic": "Mẹ (女) bế con (子) — thật là TỐT!",
    "strokes": 6, "similar": ["妈", "她"]
  },
  {
    "char": "人", "pinyin": "rén", "hanViet": "nhân", "meaning": "người",
    "mnemonic": "Hình một người đang bước đi, hai chân dang ra.",
    "strokes": 2, "similar": ["入", "八"], "pictograph": true
  },
  {
    "char": "休", "pinyin": "xiū", "hanViet": "hưu", "meaning": "nghỉ ngơi",
    "components": [ { "char": "亻", "meaning": "người" }, { "char": "木", "meaning": "cây" } ],
    "mnemonic": "Người (亻) tựa gốc cây (木) để NGHỈ.",
    "strokes": 6
  }
]
```

### 12.4 Ví dụ 1 bài học `units/u01-chaohoi/u01-l01.json`
```json
{
  "id": "u01-l01",
  "unitId": "u01",
  "order": 1,
  "title": "Xin chào!",
  "emoji": "👋",
  "estMinutes": 6,
  "newItems": [
    { "kind": "word", "id": "w_nihao" },
    { "kind": "word", "id": "w_ni" },
    { "kind": "word", "id": "w_hao" },
    { "kind": "word", "id": "w_laoshi" },
    { "kind": "word", "id": "w_nimenhao" }
  ],
  "autoGenerate": true,
  "exercises": [
    {
      "id": "u01-l01-e1",
      "type": "sentence_order",
      "prompt": "Sắp xếp câu: \"Em chào thầy ạ!\"",
      "tokens": ["老师", "，", "你好", "！"],
      "answer": ["老师", "，", "你好", "！"]
    },
    {
      "id": "u01-l01-e2",
      "type": "tone_pick",
      "itemId": "w_hao",
      "explain": "好 hǎo là thanh 3: đi xuống rồi lên."
    }
  ],
  "challenge": {
    "id": "u01-l01-boss",
    "type": "dialogue",
    "prompt": "Bạn gặp cô giáo ở cổng trường. Chào cô thế nào?",
    "lines": [
      { "speaker": "A", "zh": "你好！", "pinyin": "Nǐ hǎo!", "vi": "Chào em!" },
      { "speaker": "B", "zh": "老师好！", "pinyin": "Lǎo shī hǎo!", "vi": "Em chào cô ạ!",
        "choices": ["老师好！", "谢谢！", "再见！"] }
    ]
  },
  "recap": {
    "keyPoints": [
      "你好 nǐ hǎo = xin chào (đọc thành ní hǎo)",
      "Chào thầy cô: 老师好 lǎo shī hǎo",
      "Chào nhiều người: 你们好 nǐ men hǎo"
    ],
    "pattern": { "zh": "[Người] + 好！", "pinyin": "… hǎo!", "vi": "Chào [người]!" },
    "tip": "好 = 女 (mẹ) + 子 (con): mẹ bế con, thật tốt!"
  },
  "hanziOfLesson": "好"
}
```

### 12.5 Chương 0 — Pinyin (đặc biệt)
Chương này dùng item `kind: "syllable"` thay vì từ vựng: các bài **Thanh điệu (mā má mǎ mà)**, **Thanh mẫu dễ nhầm với tiếng Việt** (zh/ch/sh/r, j/q/x, z/c/s, b/p), **Vận mẫu** (ü, -ian, -iong…), **Biến điệu** (thanh 3 + thanh 3, 不 bù → bú trước thanh 4, 一 yī). Dạng bài chủ đạo: `tone_pick`, `listen_choice`, `pinyin_build`. Có ghi chú so sánh với âm tiếng Việt (VD: "q đọc gần như *ch* bật hơi").

---

## 13. Thuật toán ôn tập ngắt quãng (SRS)

Dùng biến thể **SM-2 rút gọn**, tự chấm điểm từ kết quả bài tập (người học không phải tự đánh giá).

### 13.1 Quy đổi kết quả → điểm
| Kết quả | grade |
|---|---|
| Sai | 0 (Again) |
| Đúng nhưng dùng gợi ý hoặc đúng ở vòng sửa sai | 3 (Hard) |
| Đúng lần đầu | 4 (Good) |
| Đúng lần đầu + trả lời < 3 giây (dạng chọn) | 5 (Easy) |

### 13.2 Cập nhật thẻ (`src/engine/srs.ts`, hàm thuần, có unit test)
```ts
export function review(card: SrsCard, grade: 0 | 3 | 4 | 5, now = Date.now()): SrsCard {
  const DAY = 86_400_000;
  let { ease, interval, reps, lapses } = card;

  if (grade === 0) {
    reps = 0; lapses += 1;
    interval = 0;                              // ôn lại ngay hôm nay / trong phiên
    ease = Math.max(1.3, ease - 0.2);
    return { ...card, ease, interval, reps, lapses, state: 'learning',
             due: now + 10 * 60_000, lastReviewed: now }; // 10 phút sau
  }

  reps += 1;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = grade === 3 ? 2 : 3;
  else interval = Math.round(interval * ease * (grade === 3 ? 0.8 : grade === 5 ? 1.3 : 1));

  ease = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  const state = interval >= 21 ? 'mastered' : 'review';
  return { ...card, ease, interval, reps, lapses, state, due: now + interval * DAY, lastReviewed: now };
}
```

### 13.3 Quy tắc hàng đợi
- Khi hoàn thành 1 bài: tạo thẻ `recognize` + `listen` cho mỗi từ mới; thêm `write` cho chữ đơn có `stroke_write`.
- Phiên ôn tập: lấy thẻ `due <= now`, ưu tiên thẻ quá hạn lâu nhất, **tối đa 20 thẻ/phiên** (có nút "Ôn thêm").
- Mỗi thẻ được hỏi bằng dạng bài phù hợp với `skill` (recognize → meaning_choice/hanzi_choice; listen → listen_choice/tone_pick; write → stroke_write).
- Giới hạn bài mới: nếu thẻ đến hạn > 50, hiện gợi ý nhẹ "Ôn bớt trước khi học mới nhé" (không khóa cứng).
- Tính "ngày" theo **múi giờ máy** (Asia/Ho_Chi_Minh với người dùng VN), mốc qua ngày 4:00 sáng để người học khuya không bị đứt chuỗi.

---

## 14. Lộ trình build cho Claude Code

> **Quy tắc chung:** Làm từng Milestone. Kết thúc mỗi Milestone: chạy `npm run lint && npm run test && npm run build`, sửa hết lỗi, rồi mới sang Milestone tiếp. Commit sau mỗi Milestone với message rõ ràng.

### M0 — Khởi tạo dự án
- Vite + React + TS strict, Tailwind, ESLint/Prettier, Vitest, Playwright.
- Cài: `react-router-dom zustand dexie dexie-react-hooks framer-motion hanzi-writer hanzi-writer-data canvas-confetti date-fns zod vite-plugin-pwa @fontsource/be-vietnam-pro @fontsource/noto-sans-sc`.
- Tạo cấu trúc thư mục Mục 10.2, file `CLAUDE.md` (Mục 17).
- **Nghiệm thu:** `npm run dev` chạy, trang trắng có font đúng, test mẫu pass.

### M1 — Design system & khung điều hướng
- CSS variables (sáng/tối), component `ui/*`, `Pinyin` tô màu thanh, `HanziDisplay`, `TabBar`, 4 route rỗng, layout mobile `max-width 480px`, safe-area.
- Linh vật **Bao** bằng SVG tự vẽ đơn giản (hình bánh bao tròn, mắt, má hồng) với 5 trạng thái: `happy | cheer | oops | sleepy | proud`.
- Trang `/dev/gallery` (chỉ dev) hiển thị mọi component.
- **Nghiệm thu:** chuyển tab mượt, dark mode đúng, Pinyin "nǐ hǎo" hiển thị đúng màu xanh lá.

### M2 — Nội dung & validate
- Types Mục 11.1, `content/index.ts`, script `validate-content.ts` (zod).
- Viết **đầy đủ nội dung Chương 0, 1, 2** (~15 bài, ~40 từ, ~25 chữ Hán có mẹo nhớ & Hán-Việt) + khung JSON các chương 3–12 (chỉ tiêu đề + danh sách từ dự kiến).
- `culture.json` ≥ 5 Thẻ Văn Hóa.
- Script `copy-hanzi-data.ts`: quét mọi chữ trong content → copy JSON nét viết vào `public/hanzi/`. Chạy trong `prebuild`.
- **Nghiệm thu:** `npm run validate:content` pass; mọi pinyin có dấu; mọi từ có nghĩa tiếng Việt.

### M3 — Database & dịch vụ nền
- Dexie schema Mục 11.3, repositories, store Zustand cho settings/profile.
- `services/tts.ts`: chọn giọng `zh-CN` tốt nhất (ưu tiên giọng local), đợi sự kiện `voiceschanged`, tốc độ theo settings, fallback sang file `/audio/*.mp3` nếu có, nếu không có gì → toast "Máy chưa có giọng đọc tiếng Trung" + hướng dẫn cài (Android: Cài đặt → Chuyển văn bản thành giọng nói; iOS: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Trung).
- `sfx.ts` (Web Audio), `haptics.ts`, `storage.ts` (gọi `navigator.storage.persist()` sau bài học đầu tiên).
- **Nghiệm thu:** unit test repositories (dùng `fake-indexeddb`), bấm 🔊 phát âm "你好" trên Chrome Android.

### M4 — Engine bài học + 4 dạng bài cơ bản
- `random.ts` (seeded), `exerciseGenerator.ts` (distractors theo Mục 6), `lessonRunner.ts` dạng **state machine** với các state: `warmup → discover → practice → challenge → fix → recap → done`.
- Dạng bài: `meaning_choice`, `hanzi_choice`, `listen_choice`, `match_pairs`.
- Màn hình làm bài theo wireframe 8.3, bottom sheet phản hồi, thanh tiến độ, combo, nút thoát có xác nhận, **lưu bài dở**.
- **Nghiệm thu:** chơi hết bài u01-l01 từ đầu đến cuối; test generator không bao giờ tạo đáp án trùng; tắt tab giữa chừng mở lại tiếp tục được.

### M5 — Thẻ Cô Đọng + SRS + XP
- `RecapCard` theo Mục 5, lưu `RecapNote`; `srs.ts` (Mục 13) + test; `xp.ts` (XP, cấp, streak, bùa giữ lửa, mốc 4:00 sáng) + test.
- Hiệu ứng confetti, màn hình lên cấp.
- **Nghiệm thu:** xong bài → thẻ cô đọng hiện đúng 5 phần, "Cần ôn thêm" liệt kê đúng từ làm sai; streak tăng khi đạt mục tiêu ngày; test streak qua nửa đêm/4h sáng.

### M6 — Màn hình Học (bản đồ) & Ôn tập
- `JourneyMap` uốn lượn (SVG path + các node), trạm theo chương, mở khóa tuần tự, card "Tiếp tục", card "Chữ của ngày".
- Tab Ôn tập (Mục 8.4) + phiên ôn tập dùng lại lessonRunner ở chế độ `review`.
- Chế độ **Tốc Độ 60s**.
- **Nghiệm thu:** hoàn thành bài → node chuyển ✓, node kế tiếp mở; badge số thẻ đến hạn đúng.

### M7 — Dạng bài nâng cao
- `tone_pick` (4 nút màu có vẽ đường cong thanh), `pinyin_build`, `sentence_order` (chạm để chọn/bỏ, hỗ trợ kéo thả), `fill_blank`, `dialogue` (bong bóng chat), `stroke_write` (Hanzi Writer quiz, nạp dữ liệu từ `/hanzi/<char>.json`, gợi ý nét sau 2 lần sai), `StrokeAnimator` trong thẻ Khám phá.
- `speak`: chỉ bật nếu `window.SpeechRecognition || window.webkitSpeechRecognition` tồn tại; so khớp chuỗi đã bỏ dấu câu; luôn có nút "Bỏ qua, mình không nói được lúc này".
- **Nghiệm thu:** viết đúng chữ 人 trên điện thoại cảm ứng; offline vẫn viết được.

### M8 — Sổ Tay, Hồ sơ, Onboarding, Gamification
- Sổ Tay (Mục 8.5) + tìm kiếm (bỏ dấu pinyin & tiếng Việt khi so khớp), trang chi tiết từ, trang chi tiết thẻ cô đọng, Tổng kết tuần.
- Hồ sơ (Mục 8.6): heatmap, huy hiệu, Bộ sưu tập Thẻ Văn Hóa, Hộp Bí Ẩn (animation mở hộp), cài đặt đầy đủ.
- Onboarding 4 bước (Mục 8.7).
- **Nghiệm thu:** người dùng mới → onboarding → bài 0.1 trong < 3 phút; huy hiệu `first_lesson` mở khóa.

### M9 — PWA hoàn chỉnh, sao lưu, đánh bóng
- Cấu hình PWA Mục 15, icon đủ kích thước, màn hình "Thêm vào màn hình chính" (nút cài trên Android qua `beforeinstallprompt`; hướng dẫn bằng hình trên iOS).
- Xuất/nhập sao lưu, thông báo cập nhật phiên bản mới ("Có bản mới — Tải lại").
- Kiểm tra `prefers-reduced-motion`, a11y, Lighthouse.
- **Nghiệm thu:** Lighthouse PWA installable ✓, Performance ≥ 90 (mobile), Accessibility ≥ 95; bật chế độ máy bay → app vẫn mở và học được mọi bài đã đóng gói.

### M10 (tương lai, chưa làm) — ý tưởng mở rộng
- Nội dung HSK 2, truyện tranh ngắn dùng từ đã học, file audio người bản xứ, lưu Thẻ Cô Đọng thành ảnh, đồng bộ qua file trên Google Drive (người dùng tự chọn), widget nhắc học.

---

## 15. PWA, offline, lưu trữ & sao lưu

### 15.1 `vite.config.ts` (phần PWA)
```ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'prompt',            // hiện toast "Có bản mới" thay vì tự reload giữa bài
  includeAssets: ['icons/*.png', 'sfx/*', 'hanzi/*.json'],
  manifest: {
    name: 'Nǐ Hǎo Mỗi Ngày — Học tiếng Trung',
    short_name: 'Nǐ Hǎo',
    description: 'Học tiếng Trung 5 phút mỗi ngày cho người Việt',
    lang: 'vi',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF9F2',
    theme_color: '#E63946',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,mp3}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    navigateFallback: '/index.html'
  }
})
```
- Thêm vào `index.html`: `<meta name="apple-mobile-web-app-capable" content="yes">`, `apple-touch-icon`, `theme-color`, `viewport-fit=cover`.

### 15.2 Lưu trữ an toàn
- Gọi `navigator.storage.persist()` để xin trình duyệt **không tự xóa** dữ liệu; hiển thị trạng thái trong Cài đặt ("Bộ nhớ: đã bảo vệ ✓ / chưa bảo vệ").
- **Lưu ý iOS Safari:** dữ liệu của website có thể bị xóa nếu lâu không dùng; khi **đã thêm vào màn hình chính** thì an toàn hơn nhiều. Vì vậy onboarding phải khuyến khích cài app, và app nhắc **sao lưu định kỳ** (mỗi 14 ngày hiện banner nhẹ "Sao lưu tiến độ của bạn").

### 15.3 Sao lưu / khôi phục (`services/backup.ts`)
```json
{
  "app": "nihao-moingay",
  "schemaVersion": 1,
  "contentVersion": "2026.11.1",
  "exportedAt": "2026-11-06T13:00:00.000Z",
  "data": { "srsCards": [], "lessonProgress": [], "sessions": [], "recaps": [], "dailyStats": [], "kv": [] }
}
```
- Xuất: tạo Blob → tải file `nihao-backup-YYYY-MM-DD.json` (trên mobile dùng `navigator.share` với file nếu hỗ trợ, để gửi qua Zalo/Drive).
- Nhập: kiểm tra `app` & `schemaVersion` bằng zod, hỏi "Ghi đè" hay "Gộp (giữ tiến độ cao hơn)", chạy trong 1 transaction.

### 15.4 Nhắc nhở học
- PWA không có thông báo đẩy tin cậy khi không có server → **MVP:** khi mở app, nếu hôm nay chưa đạt mục tiêu, Bao hiện lời nhắc; nút "Thêm nhắc nhở vào lịch" tạo file `.ics` lặp lại hằng ngày theo giờ người dùng chọn (hoạt động trên cả iOS và Android).
- Thông báo đẩy thật: để dành M10.

---

## 16. Kiểm thử, hiệu năng, triển khai

### 16.1 Kiểm thử
| Loại | Phạm vi bắt buộc |
|---|---|
| Unit (Vitest) | `srs.ts`, `xp.ts` (streak, múi giờ, mốc 4h), `exerciseGenerator.ts` (distractors hợp lệ, không trùng, seeded), `utils/pinyin.ts`, `backup.ts` (round-trip export → import) |
| Component | Từng dạng bài: render, chọn đúng/sai, gọi callback `onAnswer` đúng |
| E2E (Playwright, viewport iPhone 13 & Pixel 7) | Onboarding → hoàn thành bài 1 → thấy Thẻ Cô Đọng → thẻ xuất hiện trong Sổ Tay → reload vẫn còn; chế độ offline |
| Nội dung | `validate:content` chạy trong CI |

### 16.2 Ngân sách hiệu năng
- JS ban đầu (gzip) ≤ **200 KB**; lazy-load route Sổ Tay, Hồ sơ, `stroke_write`, `canvas-confetti`.
- Font Noto Sans SC rất nặng → chỉ nạp subset `chinese-simplified` cần thiết hoặc dựa vào font hệ thống trước, nạp font sau (`font-display: swap`).
- Thời gian mở app (đã cache) < 1 giây trên máy tầm trung.

### 16.3 Triển khai
- Static hosting có **HTTPS** (bắt buộc cho PWA): Vercel / Netlify / Cloudflare Pages / GitHub Pages.
- Nếu dùng GitHub Pages ở đường dẫn con → cấu hình `base` trong Vite và `start_url/scope` tương ứng, hoặc dùng `HashRouter`.
- Lệnh: `npm run build` → thư mục `dist/`.

---

## 17. Prompt khởi động cho Claude Code + `CLAUDE.md`

### 17.1 Prompt dán vào Claude Code (lần đầu)
```
Đọc toàn bộ file SPEC_App_Hoc_Tieng_Trung_PWA.md trong thư mục này.
Đây là đặc tả một PWA học tiếng Trung cho người Việt mới bắt đầu.
Hãy thực hiện Milestone M0 và M1. Trước khi code, tóm tắt ngắn kế hoạch của bạn.
Tuân thủ CLAUDE.md. Kết thúc milestone: chạy lint, test, build và báo cáo kết quả,
liệt kê những gì đã xong và những gì còn lại. Không làm sang milestone khác khi chưa được yêu cầu.
```
Sau đó lần lượt: *"Tiếp tục Milestone M2"*, *"Tiếp tục M3"*…

### 17.2 Nội dung file `CLAUDE.md` (tạo ở M0)
```markdown
# CLAUDE.md — Quy ước dự án Nǐ Hǎo Mỗi Ngày

## Nguồn sự thật
- Đặc tả: SPEC_App_Hoc_Tieng_Trung_PWA.md. Nếu có mâu thuẫn, hỏi lại thay vì tự đoán.

## Lệnh
- dev: `npm run dev` · test: `npm run test` · e2e: `npm run test:e2e`
- lint: `npm run lint` · build: `npm run build` · kiểm tra nội dung: `npm run validate:content`

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
- Kiểm tra kỹ pinyin, thanh điệu, nghĩa và âm Hán-Việt; nếu không chắc âm Hán-Việt thì bỏ trống trường `hanViet` thay vì đoán.

## Dữ liệu người dùng
- Chỉ IndexedDB (Dexie). Đổi schema → tăng version + migration, không bao giờ xóa dữ liệu cũ.
- Ghi kết quả cuối bài trong một transaction.

## Hoàn thành một milestone khi
- lint + test + build đều pass, tiêu chí nghiệm thu trong SPEC đạt, đã commit.
```

---

### ✅ Checklist tổng nghiệm thu MVP
- [ ] Cài được lên màn hình chính iOS & Android, mở offline.
- [ ] Chương 0–2 học được trọn vẹn, mỗi bài có Thẻ Cô Đọng.
- [ ] Ôn tập SRS hoạt động, badge số thẻ đến hạn đúng.
- [ ] Streak, XP, cấp, huy hiệu, Hộp Bí Ẩn hoạt động.
- [ ] Phát âm tiếng Trung (TTS) + viết nét chữ hoạt động offline.
- [ ] Sổ Tay tìm kiếm được bằng chữ Hán / pinyin không dấu / tiếng Việt.
- [ ] Xuất & nhập sao lưu thành công, dữ liệu còn nguyên sau reload.
- [ ] Lighthouse: PWA installable, Performance ≥ 90, Accessibility ≥ 95.
