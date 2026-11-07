/**
 * `npm run validate:content` — kiểm tra nội dung trong src/content (chạy trong prebuild).
 * Có lỗi → exit 1. Cảnh báo (VD lệch thanh so với từ điển) chỉ in ra, không chặn build.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { Lesson } from '../src/types/content';
import type { Issue } from './content/checks';
import {
  courseSchema,
  hanziInfoSchema,
  lessonSchema,
  syllableItemSchema,
  wordSchema,
} from './content/schema';
import { validateContent } from './content/validate';

const ROOT = fileURLToPath(new URL('../src/content', import.meta.url));
const issues: Issue[] = [];

/** Đọc file JSON và parse theo schema; lỗi ghi vào `issues`. */
function load<T>(file: string, schema: z.ZodType<T>): T | undefined {
  const where = relative(process.cwd(), file);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    issues.push({ level: 'error', where, message: `không đọc được: ${(e as Error).message}` });
    return undefined;
  }
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  for (const i of result.error.issues) {
    issues.push({
      level: 'error',
      where: `${where} › ${i.path.join('.') || '(gốc)'}`,
      message: i.message,
    });
  }
  return undefined;
}

/** File danh sách chưa tạo (VD words.json ở Chương 0) → mảng rỗng. */
function loadList<T>(name: string, schema: z.ZodType<T>): T[] {
  const file = join(ROOT, name);
  return existsSync(file) ? (load(file, z.array(schema)) ?? []) : [];
}

const unitsDir = join(ROOT, 'units');
const lessons = (
  existsSync(unitsDir) ? readdirSync(unitsDir, { recursive: true, encoding: 'utf8' }) : []
)
  .filter((f) => f.endsWith('.json'))
  .map((f) => load(join(unitsDir, f), lessonSchema))
  .filter((l): l is Lesson => l !== undefined);
const course = load(join(ROOT, 'course.json'), courseSchema);
const syllables = loadList('syllables.json', syllableItemSchema);
const words = loadList('words.json', wordSchema);
const hanzi = loadList('hanzi.json', hanziInfoSchema);

// Chỉ kiểm tra sâu khi schema sạch, tránh báo lỗi dây chuyền.
if (course && issues.length === 0) {
  issues.push(...validateContent({ course, lessons, syllables, words, hanzi }));
}

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
for (const i of warnings) console.warn(`⚠ ${i.where}: ${i.message}`);
for (const i of errors) console.error(`✗ ${i.where}: ${i.message}`);
console.log(
  `validate:content — ${lessons.length} bài, ${syllables.length} âm tiết, ${words.length} từ: ` +
    `${errors.length} lỗi, ${warnings.length} cảnh báo`,
);
process.exitCode = errors.length > 0 ? 1 : 0;
