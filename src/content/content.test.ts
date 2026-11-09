import { describe, expect, it } from 'vitest';
import { course, getItem, getLesson, getWord, lessons, lessonsOfUnit, units, words } from './index';

describe('content index', () => {
  it('nạp chương, bài, từ', () => {
    expect(course.contentVersion).toBeTruthy();
    expect(units.map((u) => u.id)).toContain('u00');
    expect(lessons.length).toBeGreaterThan(0);
    expect(words.length).toBeGreaterThan(0);
  });

  it('mọi lessonIds của chương đều tìm được bài, đúng thứ tự', () => {
    for (const unit of units) {
      const found = lessonsOfUnit(unit.id);
      expect(found.map((l) => l.id)).toEqual(unit.lessonIds);
    }
  });

  it('tra cứu theo id', () => {
    expect(getLesson('u01-l01')?.title).toBe('Xin chào!');
    expect(getWord('w_nihao')?.hanzi).toBe('你好');
    const syllable = getItem('syllable', 's_ma1');
    expect(syllable?.kind === 'syllable' && syllable.item.hanzi).toBe('妈');
    expect(getItem('word', 'khong_co')).toBeUndefined();
    const grammar = getItem('grammar', 'g_shi');
    expect(grammar?.kind === 'grammar' && grammar.item.id).toBe('g_shi');
    expect(getItem('grammar', 'g_x')).toBeUndefined();
  });
});
