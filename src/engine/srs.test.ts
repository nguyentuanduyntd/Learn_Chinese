import { describe, expect, it } from 'vitest';
import { cardId, itemKey, newCard } from './srs';

describe('srs keys', () => {
  it('ghép khóa theo định dạng SPEC', () => {
    expect(cardId('word', 'w_nihao', 'recognize')).toBe('word:w_nihao:recognize');
    expect(itemKey('syllable', 's_ma1')).toBe('syllable:s_ma1');
  });
});

describe('newCard', () => {
  it('thẻ mới: ease 2.5, state new, đến hạn ngay', () => {
    const card = newCard('word', 'w_nihao', 'listen', 1000);
    expect(card).toMatchObject({
      id: 'word:w_nihao:listen',
      ease: 2.5,
      interval: 0,
      reps: 0,
      lapses: 0,
      due: 1000,
      state: 'new',
    });
  });
});
