import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { vi } from '@/i18n/vi';
import type { BaoMood } from '@/types/ui';
import { Bao } from './Bao';

const MOODS: BaoMood[] = ['happy', 'cheer', 'oops', 'sleepy', 'proud'];

describe('Bao', () => {
  it.each(MOODS)('trạng thái %s có nhãn riêng cho trình đọc màn hình', (mood) => {
    render(<Bao mood={mood} />);
    expect(screen.getByRole('img', { name: vi.bao[mood] })).toBeInTheDocument();
  });

  it('5 trạng thái vẽ khác nhau', () => {
    const drawings = MOODS.map((mood) => render(<Bao mood={mood} />).container.innerHTML);
    expect(new Set(drawings).size).toBe(MOODS.length);
  });
});
