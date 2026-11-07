/**
 * Kiểm tra pinyin trong nội dung — hàm thuần, không đọc file.
 * Chỉ dùng trong scripts: kéo theo từ điển pinyin-pro, không import vào app.
 */
import type { SyllableItem, Tone, Word } from '../../src/types/content';
import { getTone, hanziToSyllables, removeTone, splitSyllables } from '../../src/utils/pinyin';

export interface Issue {
  level: 'error' | 'warning';
  where: string; // "u00-l01 › recap.pattern"
  message: string;
}

export const error = (where: string, message: string): Issue => ({
  level: 'error',
  where,
  message,
});
const warning = (where: string, message: string): Issue => ({ level: 'warning', where, message });

/** 4 dấu thanh ở dạng tổ hợp (NFD): huyền, sắc, ngang, móc. Không tính hai chấm của ü. */
const TONE_MARKS = /[̀́̄̌]/gu;

/**
 * Định dạng pinyin: NFC, dùng dấu (không dùng số), dùng ü (không dùng v),
 * mỗi âm tiết tối đa một dấu thanh (hai dấu trở lên = viết liền nhiều âm tiết).
 */
export function checkPinyinFormat(pinyin: string, where: string): Issue[] {
  if (pinyin !== pinyin.normalize('NFC')) {
    return [error(where, `"${pinyin}" không ở dạng Unicode NFC — gõ lại dấu`)];
  }
  if (/\d/.test(pinyin)) {
    return [error(where, `"${pinyin}" dùng số thanh — đổi sang dấu bằng numToTone`)];
  }
  const issues: Issue[] = [];
  for (const s of splitSyllables(pinyin)) {
    if (/v/i.test(s)) issues.push(error(where, `"${s}" dùng v — viết ü`));
    if ((s.normalize('NFD').match(TONE_MARKS) ?? []).length > 1) {
      issues.push(error(where, `"${s}" viết liền nhiều âm tiết — cách từng âm tiết`));
    }
  }
  return issues;
}

/**
 * Đối chiếu pinyin với chữ Hán qua pinyin-pro (thanh gốc). Lệch số âm tiết hoặc
 * lệch chữ cái → lỗi; chỉ lệch thanh → cảnh báo; âm tiết thanh nhẹ không bị báo.
 */
export function crossCheckPinyin(zh: string, pinyin: string, where: string): Issue[] {
  const expected = hanziToSyllables(zh);
  const actual = splitSyllables(pinyin);
  if (actual.length !== expected.length) {
    return [
      error(
        where,
        `"${pinyin}" có ${actual.length} âm tiết nhưng "${zh}" có ${expected.length} chữ Hán — cách từng âm tiết`,
      ),
    ];
  }
  const chars = zh.match(/\p{Script=Han}/gu) ?? [];
  const issues: Issue[] = [];
  actual.forEach((syllable, i) => {
    const dict = expected[i];
    const label = `${chars[i] ?? ''} "${syllable}"`;
    if (removeTone(syllable).toLowerCase() !== removeTone(dict)) {
      issues.push(error(where, `${label} khác từ điển "${dict}"`));
    } else if (getTone(syllable) !== 5 && getTone(syllable) !== getTone(dict)) {
      issues.push(warning(where, `${label} khác thanh từ điển "${dict}"`));
    }
  });
  return issues;
}

/** Cặp chữ Hán + pinyin: kiểm định dạng trước, đúng định dạng mới đối chiếu (tránh báo trùng). */
export function checkPair({ zh, pinyin }: { zh: string; pinyin: string }, where: string): Issue[] {
  const format = checkPinyinFormat(pinyin, where);
  return format.length > 0 ? format : crossCheckPinyin(zh, pinyin, where);
}

/** Trường `tone` phải khớp dấu thanh trong pinyin. */
function checkTone(pinyin: string, tone: Tone, where: string): Issue[] {
  const actual = getTone(pinyin);
  return actual === tone ? [] : [error(where, `tone ${tone} nhưng "${pinyin}" là thanh ${actual}`)];
}

/**
 * Âm tiết Chương 0: thanh khớp dấu, initial + final ghép ra đúng pinyin
 * (quy tắc chính tả duy nhất: ü viết thành u sau j, q, x, y), khớp chữ Hán.
 */
export function checkSyllableItem(item: SyllableItem): Issue[] {
  const where = `syllables › ${item.id}`;
  const issues = [...checkPair({ zh: item.hanzi, pinyin: item.pinyin }, where)];
  issues.push(...checkTone(item.pinyin, item.tone, where));
  if (/^[jqxy]$/.test(item.initial) && item.final.startsWith('u')) {
    issues.push(error(where, `sau ${item.initial} vận mẫu viết ü, không viết u ("${item.final}")`));
  }
  const spelled = (item.initial + item.final).replace(/^([jqxy])ü/, '$1u');
  if (spelled !== removeTone(item.pinyin).toLowerCase()) {
    issues.push(error(where, `initial + final = "${spelled}" không khớp pinyin "${item.pinyin}"`));
  }
  return issues;
}

/** Từ vựng: các âm tiết ghép đúng chữ Hán, thanh khớp dấu, câu ví dụ khớp chữ Hán. */
export function checkWord(word: Word): Issue[] {
  const where = `words › ${word.id}`;
  const issues: Issue[] = [];
  const joined = word.syllables.map((s) => s.hanzi).join('');
  if (joined !== word.hanzi) {
    issues.push(error(where, `syllables ghép thành "${joined}" khác hanzi "${word.hanzi}"`));
  }
  for (const s of word.syllables) {
    issues.push(
      ...checkPair({ zh: s.hanzi, pinyin: s.pinyin }, where),
      ...checkTone(s.pinyin, s.tone, where),
    );
  }
  if (word.example) issues.push(...checkPair(word.example, `${where} › example`));
  return issues;
}
