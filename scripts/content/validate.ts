/** Kiểm tra toàn bộ nội dung đã parse: id, liên kết, tham chiếu, pinyin. Hàm thuần. */
import type {
  Course,
  CultureCard,
  ExerciseSpec,
  GrammarPoint,
  HanziInfo,
  ItemKind,
  Lesson,
  SyllableItem,
  Word,
} from '../../src/types/content';
import {
  checkPair,
  checkPinyinFormat,
  crossCheckPinyin,
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
  culture?: CultureCard[];
  grammar?: GrammarPoint[];
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
  const { course, lessons, culture = [], grammar = [] } = c;
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
    ...findDuplicates(
      culture.map((card) => card.id),
      'culture',
    ),
    ...findDuplicates(
      grammar.map((g) => g.id),
      'grammar',
    ),
  ];

  // Ngữ pháp: ví dụ khớp pinyin, tokens ghép lại đúng câu
  for (const g of grammar) {
    g.examples.forEach((ex, i) => {
      const where = `grammar › ${g.id} › examples[${i}]`;
      issues.push(...checkPair(ex, where));
      if (ex.tokens && ex.tokens.join('') !== ex.zh) {
        issues.push(error(where, `tokens ghép thành "${ex.tokens.join('')}" khác zh "${ex.zh}"`));
      }
    });
  }

  // Thẻ Văn Hóa: pinyin khớp chữ Hán
  for (const card of culture) {
    if (card.zh && card.pinyin) {
      issues.push(...checkPair({ zh: card.zh, pinyin: card.pinyin }, `culture › ${card.id}`));
    } else if (card.zh || card.pinyin) {
      issues.push(error(`culture › ${card.id}`, 'zh và pinyin phải đi cùng nhau'));
    }
  }

  // Chương ↔ bài, chương ↔ thẻ văn hóa
  const lessonIds = new Set(lessons.map((l) => l.id));
  const cultureIds = new Set(culture.map((card) => card.id));
  for (const unit of course.units) {
    for (const id of unit.lessonIds) {
      if (!lessonIds.has(id)) issues.push(error(`course › ${unit.id}`, `không có bài "${id}"`));
    }
    if (unit.cultureCardId && !cultureIds.has(unit.cultureCardId)) {
      issues.push(error(`course › ${unit.id}`, `không có thẻ văn hóa "${unit.cultureCardId}"`));
    }
  }
  for (const l of lessons) {
    const unit = course.units.find((u) => u.id === l.unitId);
    if (!unit?.lessonIds.includes(l.id)) {
      issues.push(error(l.id, `không nằm trong lessonIds của chương "${l.unitId}"`));
    }
  }

  // Tham chiếu mục học
  const items: Record<ItemKind, Set<string>> = {
    syllable: new Set(c.syllables.map((s) => s.id)),
    word: new Set(c.words.map((w) => w.id)),
    hanzi: new Set(c.hanzi.map((h) => h.char)),
    grammar: new Set(grammar.map((g) => g.id)),
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
    if (l.hanziOfLesson && !items.hanzi.has(l.hanziOfLesson)) {
      issues.push(error(l.id, `hanziOfLesson "${l.hanziOfLesson}" chưa có trong hanzi.json`));
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
      issues.push(...checkExerciseLogic(e, where));
    }
  }
  return issues;
}

/** Ràng buộc riêng của từng dạng bài viết tay. */
export function checkExerciseLogic(e: ExerciseSpec, where: string): Issue[] {
  const issues: Issue[] = [];
  switch (e.type) {
    case 'sentence_order': {
      if (!e.tokens || !Array.isArray(e.answer)) {
        return [error(where, 'sentence_order cần tokens và answer (mảng)')];
      }
      const sorted = (list: string[]) => [...list].sort().join('\u0000');
      if (sorted(e.tokens) !== sorted(e.answer)) {
        issues.push(error(where, 'answer không phải hoán vị của tokens'));
      }
      if (e.pinyin) issues.push(...crossCheckPinyin(e.answer.join(''), e.pinyin, where));
      break;
    }
    case 'fill_blank': {
      if (!e.sentence?.includes('___'))
        issues.push(error(where, 'fill_blank cần "___" trong sentence'));
      if (typeof e.answer !== 'string') issues.push(error(where, 'fill_blank cần answer là chuỗi'));
      else if (e.options && !e.options.includes(e.answer)) {
        issues.push(error(where, `answer "${e.answer}" không có trong options`));
      }
      break;
    }
    case 'dialogue': {
      if (!e.lines?.length) return [error(where, 'dialogue cần lines')];
      e.lines.forEach((line, i) => {
        if (line.choices && !line.choices.includes(line.zh)) {
          issues.push(error(`${where} › lines[${i}]`, `choices không chứa câu đúng "${line.zh}"`));
        }
      });
      if (!e.lines.some((line) => line.choices)) {
        issues.push(error(where, 'dialogue cần ít nhất một lượt có choices để người học chọn'));
      }
      break;
    }
    default:
      break;
  }
  if (e.options && new Set(e.options).size !== e.options.length) {
    issues.push(error(where, 'options có đáp án trùng'));
  }
  return issues;
}
