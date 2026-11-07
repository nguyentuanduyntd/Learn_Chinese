import { describe, expect, it } from 'vitest';
import type { Lesson, SyllableItem } from '../../src/types/content';
import { checkPinyinFormat, checkSyllableItem, crossCheckPinyin } from './checks';
import { validateContent } from './validate';

const levels = (issues: { level: string }[]) => issues.map((i) => i.level);

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
});
