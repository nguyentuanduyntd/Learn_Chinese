/**
 * Wrapper mỏng quanh thư viện pinyin-pro.
 * Không tự định nghĩa bảng âm tiết / thanh mẫu / vận mẫu — mọi tra cứu do pinyin-pro đảm nhiệm.
 */
import { convert, getInitialAndFinal, getNumOfTone, pinyin } from 'pinyin-pro';
import type { PinyinParts, Tone } from '@/types/content';

/**
 * Đổi pinyin dạng số sang dạng dấu thanh. Thanh nhẹ ghi bằng 5 hoặc 0 (hoặc bỏ số).
 * Có thể gõ `v` thay cho `ü`.
 * @example numToTone('ni3 hao3') // 'nǐ hǎo'
 * @example numToTone('lv4') // 'lǜ'
 * @example numToTone('ma5') // 'ma'
 */
export function numToTone(text: string): string {
  // pinyin-pro hiểu thanh nhẹ là 0, không hiểu 5 → chuẩn hóa 5 thành 0 trước khi đổi.
  return convert(text.replace(/(?<=[a-zü])5/gi, '0'));
}

/**
 * Tách chuỗi pinyin thành âm tiết theo dấu phân cách (khoảng trắng, `'`, dấu câu)
 * hoặc theo chữ số thanh. Không tách được chuỗi dính liền không có số (VD `lǎoshī`) —
 * nội dung bài học cần viết cách nhau từng âm tiết.
 * @example splitSyllables("Nǐ hǎo!") // ['Nǐ', 'hǎo']
 * @example splitSyllables('ni3hao3') // ['ni3', 'hao3']
 */
export function splitSyllables(text: string): string[] {
  return text.match(/\p{L}+\d?/gu) ?? [];
}

/**
 * Lấy pinyin (có dấu) của từng chữ Hán, bỏ qua ký tự không phải chữ Hán.
 * Chỉ dùng để gợi ý / đối chiếu khi soạn nội dung — chữ đa âm có thể sai,
 * pinyin hiển thị cho người học vẫn lấy từ JSON đã kiểm tra.
 * @example hanziToSyllables('你好！') // ['nǐ', 'hǎo']
 */
export function hanziToSyllables(hanzi: string): string[] {
  return pinyin(hanzi, { type: 'array', nonZh: 'removed' });
}

/**
 * Tách một âm tiết thành thanh mẫu (initial) và vận mẫu (final), theo chuẩn
 * không coi y/w là thanh mẫu. Lưu ý: với âm tiết bắt đầu bằng y/w, pinyin-pro
 * chỉ bỏ y/w chứ không khôi phục vận mẫu gốc (VD `wǒ` → final `ǒ`, không phải `uǒ`).
 * @example splitInitialFinal('zhāng') // { initial: 'zh', final: 'āng' }
 * @example splitInitialFinal('jú') // { initial: 'j', final: 'ǘ' }
 */
export function splitInitialFinal(syllable: string): PinyinParts {
  return getInitialAndFinal(syllable, 'standard');
}

/**
 * Lấy thanh điệu của một âm tiết có dấu (dùng để tô màu trong `<Pinyin>`).
 * Không có dấu → 5 (thanh nhẹ).
 * @example getTone('hǎo') // 3
 * @example getTone('ma') // 5
 */
export function getTone(syllable: string): Tone {
  const n = Number(getNumOfTone(syllable));
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : 5;
}
