import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pinyin } from './Pinyin';

/** Lấy [âm tiết, thanh] của các span đã tô màu. */
function coloredSyllables(container: HTMLElement) {
  return [...container.querySelectorAll('[data-tone]')].map((el) => [
    el.textContent,
    el.getAttribute('data-tone'),
  ]);
}

describe('<Pinyin>', () => {
  it('tô "nǐ hǎo" màu thanh 3 (xanh lá)', () => {
    const { container } = render(<Pinyin text="nǐ hǎo" />);
    expect(coloredSyllables(container)).toEqual([
      ['nǐ', '3'],
      ['hǎo', '3'],
    ]);
    expect(container.querySelector('[data-tone]')).toHaveClass('text-tone3');
  });

  it('nhận đủ 4 thanh và thanh nhẹ', () => {
    const { container } = render(<Pinyin text="mā má mǎ mà ma" />);
    expect(coloredSyllables(container).map(([, tone]) => tone)).toEqual(['1', '2', '3', '4', '5']);
    expect(container.querySelector('[data-tone="5"]')).toHaveClass('text-tone5');
  });

  it('giữ nguyên khoảng trắng và dấu câu', () => {
    const { container } = render(<Pinyin text="Lǎo shī, nǐ hǎo!" />);
    expect(container.textContent).toBe('Lǎo shī, nǐ hǎo!');
    expect(coloredSyllables(container)).toHaveLength(4);
  });

  it('chuỗi rỗng không lỗi', () => {
    const { container } = render(<Pinyin text="" />);
    expect(container.textContent).toBe('');
  });
});
