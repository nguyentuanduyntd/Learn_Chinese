/** Kiểm tra toàn bộ nội dung đã parse: id, liên kết, tham chiếu, pinyin. Hàm thuần. */
import type {
  Course,
  ExerciseSpec,
  HanziInfo,
  ItemKind,
  Lesson,
  SyllableItem,
  Word,
} from '../../src/types/content';
import {
  checkPair,
  checkPinyinFormat,
  checkSyllableItem,
  checkWord,
  error,
  type Issue,
} from './checks';

export interface ContentBundle {
  course: Course;
  lessons: Lesson[];
  syllables: SyllableItem[];
  words: Word[];
  hanzi: HanziInfo[];
}

/** Báo các id xuất hiện quá một lần. */
function findDuplicates(ids: string[], where: string): Issue[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const id of ids) (seen.has(id) ? dups : seen).add(id);
  return [...dups].map((id) => error(where, `id "${id}" bị trùng`));
}

/** Bài tập viết tay + câu Thử thách của một bài. */
const exercisesOf = (l: Lesson): ExerciseSpec[] => [
  ...(l.exercises ?? []),
  ...(l.challenge ? [l.challenge] : []),
];

export function validateContent(c: ContentBundle): Issue[] {
  const { course, lessons } = c;
  const issues: Issue[] = [
    ...findDuplicates(
      course.units.map((u) => u.id),
      'course › units',
    ),
    ...findDuplicates(
      lessons.map((l) => l.id),
      'lessons',
    ),
    ...findDuplicates(
      lessons.flatMap((l) => exercisesOf(l).map((e) => e.id)),
      'exercises',
    ),
    ...findDuplicates(
      c.syllables.map((s) => s.id),
      'syllables',
    ),
    ...findDuplicates(
      c.words.map((w) => w.id),
      'words',
    ),
    ...findDuplicates(
      c.hanzi.map((h) => h.char),
      'hanzi',
    ),
  ];

  // Chương ↔ bài
  const lessonIds = new Set(lessons.map((l) => l.id));
  for (const unit of course.units) {
    for (const id of unit.lessonIds) {
      if (!lessonIds.has(id)) issues.push(error(`course › ${unit.id}`, `không có bài "${id}"`));
    }
  }
  for (const l of lessons) {
    const unit = course.units.find((u) => u.id === l.unitId);
    if (!unit?.lessonIds.includes(l.id)) {
      issues.push(error(l.id, `không nằm trong lessonIds của chương "${l.unitId}"`));
    }
  }

  // Tham chiếu mục học (chưa có dữ liệu ngữ pháp → mọi tham chiếu grammar đều báo thiếu)
  const items: Record<ItemKind, Set<string>> = {
    syllable: new Set(c.syllables.map((s) => s.id)),
    word: new Set(c.words.map((w) => w.id)),
    hanzi: new Set(c.hanzi.map((h) => h.char)),
    grammar: new Set(),
  };
  const anyItem = (id: string) => Object.values(items).some((set) => set.has(id));
  for (const l of lessons) {
    for (const ref of [...l.newItems, ...(l.reviewItems ?? [])]) {
      if (!items[ref.kind].has(ref.id))
        issues.push(error(l.id, `không có ${ref.kind} "${ref.id}"`));
    }
    for (const e of exercisesOf(l)) {
      if (e.itemId && !anyItem(e.itemId)) {
        issues.push(error(`${l.id} › ${e.id}`, `itemId "${e.itemId}" không tồn tại`));
      }
    }
  }

  // Pinyin
  issues.push(...c.syllables.flatMap(checkSyllableItem), ...c.words.flatMap(checkWord));
  for (const h of c.hanzi)
    issues.push(...checkPair({ zh: h.char, pinyin: h.pinyin }, `hanzi › ${h.char}`));
  for (const l of lessons) {
    if (l.recap.pattern) issues.push(...checkPair(l.recap.pattern, `${l.id} › recap.pattern`));
    for (const e of exercisesOf(l)) {
      const where = `${l.id} › ${e.id}`;
      e.lines?.forEach((line, i) => issues.push(...checkPair(line, `${where} › lines[${i}]`)));
      if (e.pinyin) issues.push(...checkPinyinFormat(e.pinyin, where));
    }
  }
  return issues;
}
