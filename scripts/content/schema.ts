/**
 * Schema zod cho nội dung khóa học. Mỗi schema gắn kiểu `z.ZodType<T>` để tsc báo lỗi
 * nếu lệch với `src/types/content.ts`. `.strict()` bắt lỗi gõ sai tên trường.
 */
import { z } from 'zod';
import type {
  Course,
  CultureCard,
  ExerciseSpec,
  HanziInfo,
  Lesson,
  SyllableItem,
  Word,
} from '../../src/types/content';

const text = z.string().min(1);

export const cultureCardSchema: z.ZodType<CultureCard> = z
  .object({
    id: text,
    title: text,
    emoji: text,
    summary: text.max(120, 'summary tối đa 120 ký tự'),
    body: z.array(text).min(1).max(4, 'body tối đa 4 đoạn'),
    zh: text.optional(),
    pinyin: text.optional(),
  })
  .strict();
const tone = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const example = z.object({ zh: text, pinyin: text, vi: text }).strict();

export const syllableItemSchema: z.ZodType<SyllableItem> = z
  .object({
    id: text,
    pinyin: text,
    tone,
    initial: z.string(),
    final: text,
    hanzi: text,
    meaning: text,
    note: text.optional(),
  })
  .strict();

export const wordSchema: z.ZodType<Word> = z
  .object({
    id: text,
    hanzi: text,
    syllables: z
      .array(z.object({ hanzi: text, pinyin: text, tone, spokenTone: tone.optional() }).strict())
      .min(1),
    meaning: text,
    hanViet: text.optional(),
    pos: text.optional(),
    example: example.optional(),
    note: text.optional(),
    tags: z.array(text).optional(),
    audio: text.optional(),
  })
  .strict();

export const hanziInfoSchema: z.ZodType<HanziInfo> = z
  .object({
    char: text,
    pinyin: text,
    hanViet: text.optional(),
    meaning: text,
    components: z.array(z.object({ char: text, meaning: text }).strict()).optional(),
    mnemonic: text.optional(),
    strokes: z.number().int().positive().optional(),
    similar: z.array(text).optional(),
    pictograph: z.boolean().optional(),
  })
  .strict();

const itemRef = z
  .object({ kind: z.enum(['word', 'hanzi', 'grammar', 'syllable']), id: text })
  .strict();

const exerciseSchema: z.ZodType<ExerciseSpec> = z
  .object({
    id: text,
    type: z.enum([
      'meaning_choice',
      'hanzi_choice',
      'listen_choice',
      'tone_pick',
      'pinyin_build',
      'match_pairs',
      'sentence_order',
      'fill_blank',
      'stroke_write',
      'dialogue',
      'speak',
    ]),
    itemId: text.optional(),
    prompt: text.optional(),
    tokens: z.array(text).optional(),
    answer: z.union([text, z.array(text)]).optional(),
    sentence: text.optional(),
    options: z.array(text).optional(),
    lines: z
      .array(
        example.extend({ speaker: z.enum(['A', 'B']), choices: z.array(text).optional() }).strict(),
      )
      .optional(),
    explain: text.optional(),
    vi: text.optional(),
    pinyin: text.optional(),
  })
  .strict();

export const lessonSchema: z.ZodType<Lesson> = z
  .object({
    id: text,
    unitId: text,
    order: z.number().int().nonnegative(),
    title: text,
    emoji: text.optional(),
    estMinutes: z.number().positive(),
    isChallenge: z.boolean().optional(),
    newItems: z.array(itemRef).max(6, 'Mỗi bài tối đa 6 mục mới'),
    reviewItems: z.array(itemRef).optional(),
    exercises: z.array(exerciseSchema).optional(),
    autoGenerate: z.boolean().optional(),
    challenge: exerciseSchema.optional(),
    recap: z
      .object({
        keyPoints: z
          .array(text.max(80, 'keyPoint tối đa 80 ký tự'))
          .max(3, 'Recap tối đa 3 keyPoints'),
        pattern: example.optional(),
        tip: text.optional(),
      })
      .strict(),
    hanziOfLesson: text.optional(),
  })
  .strict();

export const courseSchema: z.ZodType<Course> = z
  .object({
    contentVersion: text,
    units: z.array(
      z
        .object({
          id: text,
          order: z.number().int().nonnegative(),
          title: text,
          station: text,
          theme: text,
          emoji: text,
          lessonIds: z.array(text),
          cultureCardId: text.optional(),
          plannedWords: z.array(text).optional(),
        })
        .strict(),
    ),
  })
  .strict();
