/** Mọi chuỗi hiển thị của app (CLAUDE.md). Nội dung bài học nằm ở src/content, không ở đây. */
import type { Tone } from '@/types/content';
import type { BaoMood } from '@/types/ui';
import type { ThemeSetting } from '@/types/user';

export const vi = {
  appName: 'Nǐ Hǎo Mỗi Ngày',

  nav: {
    label: 'Điều hướng chính',
    learn: 'Học',
    review: 'Ôn tập',
    notebook: 'Sổ Tay',
    profile: 'Tôi',
    reviewDue: (count: number) => `${count} thẻ cần ôn`,
  },

  pages: {
    learn: { title: 'Học', placeholder: 'Bản đồ hành trình sẽ hiện ở đây.' },
    review: { title: 'Ôn tập', placeholder: 'Các thẻ đến hạn ôn sẽ hiện ở đây.' },
    notebook: {
      title: 'Sổ Tay',
      placeholder: 'Thẻ Cô Đọng, từ vựng và chữ Hán bạn đã học sẽ hiện ở đây.',
    },
    profile: { title: 'Tôi', placeholder: 'Hồ sơ, huy hiệu và cài đặt sẽ hiện ở đây.' },
  },

  bao: {
    happy: 'Bao đang vui',
    cheer: 'Bao đang reo mừng',
    oops: 'Bao hơi bối rối',
    sleepy: 'Bao buồn ngủ',
    proud: 'Bao đầy tự hào',
  } satisfies Record<BaoMood, string>,

  hanzi: {
    speak: (text: string) => `Nghe phát âm ${text}`,
    tone: (tone: Tone) => (tone === 5 ? 'Thanh nhẹ' : `Thanh ${tone}`),
    hanViet: 'Hán-Việt',
    hanVietLabel: (reading: string) => `Âm Hán-Việt: ${reading}`,
  },

  theme: {
    light: 'Sáng',
    dark: 'Tối',
    system: 'Theo hệ thống',
  } satisfies Record<ThemeSetting, string>,

  gallery: {
    title: 'Thư viện component',
    devOnly: 'Trang này chỉ có ở bản dev.',
    theme: 'Giao diện',
    buttons: 'Nút',
    cardsChips: 'Thẻ & chip',
    progress: 'Tiến độ',
    sheet: 'Bottom sheet',
    pinyin: 'Pinyin tô màu thanh điệu',
    hanzi: 'Chữ Hán',
    bao: 'Linh vật Bao',
    sampleCheck: 'Kiểm tra',
    sampleContinue: 'Tiếp tục',
    sampleSkip: 'Bỏ qua',
    sampleDisabled: 'Chưa chọn đáp án',
    sampleCard: 'Card dùng cho nội dung như Chữ của ngày, Thẻ Cô Đọng…',
    sampleChips: ['HSK 1', 'Chào hỏi', 'Mới học', 'Thuộc'],
    sampleProgress: 'Tiến độ bài học',
    sampleRing: 'XP hôm nay',
    sheetOpen: 'Mở bottom sheet',
    sheetClose: 'Đóng bottom sheet',
    sheetLabel: 'Kết quả',
    sheetVerdict: 'Chuẩn luôn!',
    sheetMeaning: 'tốt',
  },
} as const;
