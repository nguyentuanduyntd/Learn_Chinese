/** SRS — SM-2 rút gọn (SPEC 13). Hàm thuần. `review()` làm ở M5. */
import type { ItemKind } from '@/types/content';
import type { Skill, SrsCard } from '@/types/user';

/** Khóa thẻ: `${kind}:${itemId}:${skill}`. */
export const cardId = (kind: ItemKind, itemId: string, skill: Skill) =>
  `${kind}:${itemId}:${skill}`;

/** Khóa mục học dùng trong weakItems/learnedItems: `${kind}:${itemId}`. */
export const itemKey = (kind: ItemKind, itemId: string) => `${kind}:${itemId}`;

/** Thẻ mới: ease 2.5, đến hạn ngay (now) để vào vòng ôn đầu tiên. */
export function newCard(kind: ItemKind, itemId: string, skill: Skill, now: number): SrsCard {
  return {
    id: cardId(kind, itemId, skill),
    itemId,
    kind,
    skill,
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: now,
    state: 'new',
  };
}
