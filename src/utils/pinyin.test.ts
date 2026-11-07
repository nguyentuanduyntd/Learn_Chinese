import { describe, expect, it } from 'vitest';
import { getTone, hanziToSyllables, numToTone, splitInitialFinal, splitSyllables } from './pinyin';

describe('numToTone', () => {
  it('đổi dạng số sang dấu thanh', () => {
    expect(numToTone('ni3 hao3')).toBe('nǐ hǎo');
    expect(numToTone('Ni3 hao3')).toBe('Nǐ hǎo');
  });

  it('hiểu v là ü và 5 là thanh nhẹ', () => {
    expect(numToTone('lv4')).toBe('lǜ');
    expect(numToTone('xie4 xie5')).toBe('xiè xie');
  });
});

describe('splitSyllables', () => {
  it('tách theo khoảng trắng, dấu câu, nháy đơn', () => {
    expect(splitSyllables('Nǐ hǎo!')).toEqual(['Nǐ', 'hǎo']);
    expect(splitSyllables("xī'ān")).toEqual(['xī', 'ān']);
  });

  it('tách theo chữ số thanh và xử lý chuỗi rỗng', () => {
    expect(splitSyllables('ni3hao3')).toEqual(['ni3', 'hao3']);
    expect(splitSyllables('')).toEqual([]);
  });
});

describe('hanziToSyllables', () => {
  it('lấy pinyin từng chữ, bỏ dấu câu', () => {
    expect(hanziToSyllables('你好！')).toEqual(['nǐ', 'hǎo']);
  });
});

describe('splitInitialFinal', () => {
  it('tách thanh mẫu và vận mẫu', () => {
    expect(splitInitialFinal('zhāng')).toEqual({ initial: 'zh', final: 'āng' });
    expect(splitInitialFinal('jú')).toEqual({ initial: 'j', final: 'ǘ' });
    expect(splitInitialFinal('ài')).toEqual({ initial: '', final: 'ài' });
  });
});

describe('getTone', () => {
  it('trả về số thanh, thanh nhẹ là 5', () => {
    expect(getTone('mā')).toBe(1);
    expect(getTone('hǎo')).toBe(3);
    expect(getTone('ma')).toBe(5);
  });
});
