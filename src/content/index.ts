/**
 * Nạp & index toàn bộ nội dung khóa học từ bundle (SPEC 10.3: nội dung không lưu IndexedDB).
 * Dữ liệu đã qua `validate:content` lúc build nên ở đây chỉ ép kiểu, không kiểm tra lại.
 */
import type {
  Course,
  CultureCard,
  HanziInfo,
  ItemKind,
  Lesson,
  SyllableItem,
  Unit,
  Word,
} from '@/types/content';
import courseJson from './course.json';
import cultureJson from './culture.json';
import hanziJson from './hanzi.json';
import syllablesJson from './syllables.json';
import wordsJson from './words.json';

const lessonModules = import.meta.glob<Lesson>('./units/*/*.json', {
  eager: true,
  import: 'default',
});

export const course = courseJson as Course;
export const units: Unit[] = [...course.units].sort((a, b) => a.order - b.order);
export const lessons: Lesson[] = Object.values(lessonModules).sort(
  (a, b) => a.unitId.localeCompare(b.unitId) || a.order - b.order,
);
export const words = wordsJson as Word[];
export const hanzi = hanziJson as HanziInfo[];
export const syllables = syllablesJson as SyllableItem[];
export const cultureCards = cultureJson as CultureCard[];

const byId = <T>(list: T[], key: (item: T) => string) =>
  new Map(list.map((item) => [key(item), item]));

const unitById = byId(units, (u) => u.id);
const lessonById = byId(lessons, (l) => l.id);
const wordById = byId(words, (w) => w.id);
const hanziByChar = byId(hanzi, (h) => h.char);
const syllableById = byId(syllables, (s) => s.id);
const cultureById = byId(cultureCards, (c) => c.id);

export const getUnit = (id: string) => unitById.get(id);
export const getLesson = (id: string) => lessonById.get(id);
export const getWord = (id: string) => wordById.get(id);
export const getHanzi = (char: string) => hanziByChar.get(char);
export const getSyllable = (id: string) => syllableById.get(id);
export const getCultureCard = (id: string) => cultureById.get(id);

/** Các bài của một chương theo thứ tự `lessonIds`. */
export function lessonsOfUnit(unitId: string): Lesson[] {
  return (getUnit(unitId)?.lessonIds ?? []).flatMap((id) => getLesson(id) ?? []);
}

/** Mục học theo (kind, id) — dùng cho newItems/reviewItems. Ngữ pháp chưa có dữ liệu. */
export type ContentItem =
  | { kind: 'word'; item: Word }
  | { kind: 'hanzi'; item: HanziInfo }
  | { kind: 'syllable'; item: SyllableItem };

export function getItem(kind: ItemKind, id: string): ContentItem | undefined {
  switch (kind) {
    case 'word': {
      const item = getWord(id);
      return item && { kind, item };
    }
    case 'hanzi': {
      const item = getHanzi(id);
      return item && { kind, item };
    }
    case 'syllable': {
      const item = getSyllable(id);
      return item && { kind, item };
    }
    case 'grammar':
      return undefined;
  }
}
