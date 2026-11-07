export type Tone = 1 | 2 | 3 | 4 | 5; // 5 = thanh nhẹ

/** Thanh mẫu + vận mẫu của một âm tiết pinyin. */
export interface PinyinParts {
  initial: string; // "zh" ("" nếu không có thanh mẫu)
  final: string; // "āng" (giữ dấu thanh)
}

export interface Syllable {
  hanzi: string; // "好"
  pinyin: string; // "hǎo"  (dạng có dấu)
  tone: Tone; // 3
  spokenTone?: Tone; // thanh thực tế khi biến điệu, VD 你 trong 你好 → 2
}

export interface Example {
  zh: string;
  pinyin: string;
  vi: string;
}

export interface Word {
  id: string; // "w_nihao"
  hanzi: string; // "你好"
  syllables: Syllable[];
  meaning: string; // "xin chào"
  hanViet?: string; // "nễ hảo"
  pos?: string; // "cụm từ" | "danh từ" | "động từ" …
  example?: Example;
  note?: string;
  tags?: string[];
  audio?: string; // "/audio/w_nihao.mp3" (tùy chọn)
}

export interface HanziInfo {
  char: string; // "好"
  pinyin: string;
  hanViet?: string; // "hảo"
  meaning: string;
  components?: { char: string; meaning: string }[];
  mnemonic?: string;
  strokes?: number;
  similar?: string[]; // chữ dễ nhầm
  pictograph?: boolean; // có animation tiến hóa chữ không
}

/** Âm tiết dùng cho Chương 0 (Pinyin & Thanh điệu). */
export interface SyllableItem {
  id: string; // "s_ma1"
  pinyin: string; // "mā"
  tone: Tone;
  initial: string; // "m" ("" nếu không có thanh mẫu)
  final: string; // "a" (dạng không dấu, dùng ü)
  hanzi: string; // chữ đại diện để phát âm: "妈"
  meaning: string; // "mẹ"
  note?: string; // so sánh với âm tiếng Việt
}

export interface GrammarExample extends Example {
  tokens?: string[]; // để tạo bài sắp xếp câu
}

export interface GrammarPoint {
  id: string;
  title: string; // "Câu chữ 是: A 是 B"
  pattern: string; // "A 是 B"
  explanation: string;
  examples: GrammarExample[];
}

export type ExerciseType =
  | 'meaning_choice'
  | 'hanzi_choice'
  | 'listen_choice'
  | 'tone_pick'
  | 'pinyin_build'
  | 'match_pairs'
  | 'sentence_order'
  | 'fill_blank'
  | 'stroke_write'
  | 'dialogue'
  | 'speak';

export type ItemKind = 'word' | 'hanzi' | 'grammar' | 'syllable';

export interface ItemRef {
  kind: ItemKind;
  id: string;
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  zh: string;
  pinyin: string;
  vi: string;
  choices?: string[];
}

export interface ExerciseSpec {
  id: string;
  type: ExerciseType;
  itemId?: string; // word/hanzi/syllable được kiểm tra
  prompt?: string; // ghi đè đề bài mặc định
  tokens?: string[]; // sentence_order: ["我","是","学生"]
  answer?: string | string[];
  sentence?: string; // fill_blank: "我___学生"
  options?: string[]; // nếu tác giả muốn cố định đáp án
  lines?: DialogueLine[]; // dialogue
  explain?: string; // giải thích hiện khi sai
  vi?: string; // nghĩa tiếng Việt của câu (sentence_order / fill_blank)
  pinyin?: string; // pinyin của câu hoàn chỉnh
}

export interface RecapContent {
  keyPoints: string[]; // tối đa 3
  pattern?: Example;
  tip?: string;
}

export interface Lesson {
  id: string; // "u01-l03"
  unitId: string;
  order: number;
  title: string;
  emoji?: string;
  estMinutes: number;
  isChallenge?: boolean; // bài Thử thách cuối chương
  newItems: ItemRef[]; // ≤ 6
  reviewItems?: ItemRef[]; // dùng cho bài Thử thách: ôn các mục của chương
  exercises?: ExerciseSpec[];
  autoGenerate?: boolean; // mặc định true
  challenge?: ExerciseSpec;
  recap: RecapContent;
  hanziOfLesson?: string;
}

export interface Unit {
  id: string; // "u01"
  order: number;
  title: string;
  station: string; // "Bắc Kinh"
  theme: string; // emoji/màu minh họa trạm
  emoji: string;
  lessonIds: string[];
  cultureCardId?: string;
  plannedWords?: string[]; // khung cho chương chưa có nội dung
}

export interface Course {
  contentVersion: string;
  units: Unit[];
}

export interface CultureCard {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  body: string[];
  zh?: string;
  pinyin?: string;
}

export interface PictographStage {
  label: string; // "Giáp cốt"
  path: string; // SVG path (viewBox 0 0 100 100)
}

export interface Pictograph {
  char: string;
  stages: PictographStage[];
}
