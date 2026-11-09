import { describe, expect, it } from 'vitest';
import type { Lesson, SyllableItem, Word } from '../../src/types/content';
import { checkPinyinFormat, checkSyllableItem, checkWord, crossCheckPinyin } from './checks';
import { checkExerciseLogic, validateContent } from './validate';

const levels = (issues: { level: string }[]) => issues.map((i) => i.level);

describe('checkExerciseLogic', () => {
  it('sentence_order: answer phải là hoán vị của tokens, pinyin khớp câu', () => {
    const ok = {
      id: 'e',
      type: 'sentence_order' as const,
      tokens: ['老师', '，', '你好', '！'],
      answer: ['老师', '，', '你好', '！'],
      pinyin: 'Lǎo shī, nǐ hǎo!',
    };
    expect(checkExerciseLogic(ok, 'x')).toEqual([]);
    const badOrder = { ...ok, pinyin: undefined, answer: ['老师', '你好'] };
    expect(levels(checkExerciseLogic(badOrder, 'x'))).toEqual(['error']);
    expect(levels(checkExerciseLogic({ ...ok, pinyin: 'Lǎo shī, nǐ hǎi!' }, 'x'))).toEqual([
      'error',
    ]);
  });

  it('fill_blank: cần ___ và answer nằm trong options', () => {
    const ok = {
      id: 'e',
      type: 'fill_blank' as const,
      sentence: '谢谢！——___！',
      answer: '不客气',
      options: ['不客气', '再见'],
    };
    expect(checkExerciseLogic(ok, 'x')).toEqual([]);
    expect(levels(checkExerciseLogic({ ...ok, answer: '没关系' }, 'x'))).toEqual(['error']);
    expect(levels(checkExerciseLogic({ ...ok, sentence: '谢谢！' }, 'x'))).toEqual(['error']);
    expect(levels(checkExerciseLogic({ ...ok, options: ['不客气', '不客气'] }, 'x'))).toEqual([
      'error',
    ]);
  });

  it('dialogue: choices phải chứa câu đúng và có ít nhất một lượt chọn', () => {
    const line = { speaker: 'B' as const, zh: '再见！', pinyin: 'Zài jiàn!', vi: 'Tạm biệt!' };
    const ok = {
      id: 'e',
      type: 'dialogue' as const,
      lines: [{ ...line, choices: ['再见！', '你好！'] }],
    };
    expect(checkExerciseLogic(ok, 'x')).toEqual([]);
    expect(levels(checkExerciseLogic({ ...ok, lines: [line] }, 'x'))).toEqual(['error']);
    expect(
      levels(checkExerciseLogic({ ...ok, lines: [{ ...line, choices: ['你好！'] }] }, 'x')),
    ).toEqual(['error']);
  });
});

describe('checkPinyinFormat', () => {
  it('chấp nhận pinyin có dấu, cách âm tiết', () => {
    expect(checkPinyinFormat('Lǎo shī, nǐ hǎo!', 'x')).toEqual([]);
    expect(checkPinyinFormat('lǜ', 'x')).toEqual([]);
  });

  it('báo lỗi số thanh, chữ v, viết liền, dạng NFD', () => {
    expect(levels(checkPinyinFormat('ni3 hao3', 'x'))).toEqual(['error']);
    expect(levels(checkPinyinFormat('lv', 'x'))).toEqual(['error']);
    expect(levels(checkPinyinFormat('nǐhǎo', 'x'))).toEqual(['error']);
    expect(levels(checkPinyinFormat('nǐ'.normalize('NFD'), 'x'))).toEqual(['error']);
  });
});

describe('crossCheckPinyin', () => {
  it('khớp chữ Hán, bỏ qua thanh nhẹ và chú thích tiếng Việt', () => {
    expect(crossCheckPinyin('谢谢你！', 'Xiè xie nǐ!', 'x')).toEqual([]);
    expect(crossCheckPinyin('[Người] + 好！', '… hǎo!', 'x')).toEqual([]);
  });

  it('lệch số âm tiết hoặc chữ cái → lỗi, lệch thanh → cảnh báo', () => {
    expect(levels(crossCheckPinyin('谢谢你！', 'Xièxie nǐ!', 'x'))).toEqual(['error']);
    expect(levels(crossCheckPinyin('好', 'hǎi', 'x'))).toEqual(['error']);
    expect(levels(crossCheckPinyin('好', 'hào', 'x'))).toEqual(['warning']);
  });
});

describe('checkSyllableItem', () => {
  const base: SyllableItem = {
    id: 's_qu4',
    pinyin: 'qù',
    tone: 4,
    initial: 'q',
    final: 'ü',
    hanzi: '去',
    meaning: 'đi',
  };

  it('chấp nhận ü viết thành u sau q, y', () => {
    expect(checkSyllableItem(base)).toEqual([]);
    const yue = { ...base, pinyin: 'yuè', initial: 'y', final: 'üe', hanzi: '月' };
    expect(checkSyllableItem(yue)).toEqual([]);
  });

  it('báo lỗi tone lệch dấu, final viết u, initial + final sai', () => {
    expect(levels(checkSyllableItem({ ...base, tone: 2 }))).toEqual(['error']);
    expect(levels(checkSyllableItem({ ...base, final: 'u' }))).toEqual(['error']);
    expect(levels(checkSyllableItem({ ...base, initial: 'x' }))).toEqual(['error']);
  });
});

describe('checkWord', () => {
  const example = { zh: '谢谢！——不客气！', pinyin: 'Xiè xie! — Bù kè qi!', vi: 'Cảm ơn!' };
  const bukeqi: Word = {
    id: 'w_bukeqi',
    hanzi: '不客气',
    syllables: [
      { hanzi: '不', pinyin: 'bù', tone: 4, spokenTone: 2 },
      { hanzi: '客', pinyin: 'kè', tone: 4 },
      { hanzi: '气', pinyin: 'qi', tone: 5 },
    ],
    meaning: 'không có gì',
    example,
  };

  it('chấp nhận thanh gốc + spokenTone, thanh nhẹ khác từ điển', () => {
    expect(checkWord(bukeqi)).toEqual([]);
  });

  it('báo lỗi chữ Hán ghép sai, tone lệch dấu, ví dụ viết liền', () => {
    expect(levels(checkWord({ ...bukeqi, hanzi: '不客' }))).toEqual(['error']);
    const [, ke, qi] = bukeqi.syllables;
    const wrongTone = {
      ...bukeqi,
      syllables: [{ hanzi: '不', pinyin: 'bù', tone: 2 as const }, ke, qi],
    };
    expect(levels(checkWord(wrongTone))).toEqual(['error']);
    const joined = { ...bukeqi, example: { ...example, pinyin: 'Xièxie! — Bù kèqi!' } };
    expect(levels(checkWord(joined))).toEqual(['error']);
  });
});

describe('validateContent', () => {
  const lesson: Lesson = {
    id: 'u00-l01',
    unitId: 'u00',
    order: 1,
    title: 'Thử',
    estMinutes: 5,
    newItems: [{ kind: 'syllable', id: 's_khong_co' }],
    recap: { keyPoints: [] },
  };
  const course = {
    contentVersion: '0',
    units: [
      {
        id: 'u00',
        order: 0,
        title: 'Thử',
        station: 'A',
        theme: '#000',
        emoji: '🎵',
        lessonIds: ['u00-l01', 'u00-l02'],
      },
    ],
  };

  it('báo id trùng, bài thiếu, tham chiếu không tồn tại', () => {
    const messages = validateContent({
      course,
      lessons: [lesson, lesson],
      syllables: [],
      words: [],
      hanzi: [],
    }).map((i) => i.message);
    expect(messages).toContain('id "u00-l01" bị trùng');
    expect(messages).toContain('không có bài "u00-l02"');
    expect(messages).toContain('không có syllable "s_khong_co"');
  });

  it('báo thẻ văn hóa: cultureCardId không tồn tại, zh thiếu pinyin', () => {
    const unit = { ...course.units[0], lessonIds: [], cultureCardId: 'c_khong_co' };
    const messages = validateContent({
      course: { ...course, units: [unit] },
      lessons: [],
      syllables: [],
      words: [],
      hanzi: [],
      culture: [{ id: 'c_x', title: 'X', emoji: '🍵', summary: 'x', body: ['x'], zh: '茶' }],
    }).map((i) => i.message);
    expect(messages).toContain('không có thẻ văn hóa "c_khong_co"');
    expect(messages).toContain('zh và pinyin phải đi cùng nhau');
  });

  it('báo hanziOfLesson chưa có trong hanzi.json', () => {
    const messages = validateContent({
      course,
      lessons: [{ ...lesson, hanziOfLesson: '好' }],
      syllables: [],
      words: [],
      hanzi: [],
    }).map((i) => i.message);
    expect(messages).toContain('hanziOfLesson "好" chưa có trong hanzi.json');
  });
});
