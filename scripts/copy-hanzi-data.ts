/**
 * `npm run hanzi:copy` — quét mọi chữ Hán trong src/content, copy dữ liệu nét viết
 * từ hanzi-writer-data sang public/hanzi/<mã-unicode-hex>.json (VD 好 → 597d.json).
 * Xóa file cũ không còn dùng. Chạy trong prebuild; public/hanzi/*.json không commit.
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT = fileURLToPath(new URL('../src/content', import.meta.url));
const OUT = fileURLToPath(new URL('../public/hanzi', import.meta.url));
const require = createRequire(import.meta.url);

/** Tên file đích theo quy ước CLAUDE.md: mã Unicode hex, chữ thường. */
const fileName = (char: string) => `${char.codePointAt(0)?.toString(16)}.json`;

// 1. Gom chữ Hán trong mọi file JSON nội dung (dấu câu ，！。 không thuộc Script=Han).
const chars = new Set<string>();
for (const f of readdirSync(CONTENT, { recursive: true, encoding: 'utf8' })) {
  // course.json chỉ có plannedWords của chương chưa dạy → không precache nét của chúng.
  if (!f.endsWith('.json') || f === 'course.json') continue;
  for (const c of readFileSync(join(CONTENT, f), 'utf8').match(/\p{Script=Han}/gu) ?? []) {
    chars.add(c);
  }
}

// 2. Copy dữ liệu nét viết.
mkdirSync(OUT, { recursive: true });
const missing: string[] = [];
for (const c of chars) {
  try {
    copyFileSync(require.resolve(`hanzi-writer-data/${c}.json`), join(OUT, fileName(c)));
  } catch {
    missing.push(c);
  }
}

// 3. Xóa file sinh ra từ lần trước nhưng không còn dùng.
const wanted = new Set([...chars].map(fileName));
const stale = readdirSync(OUT).filter((f) => /^[0-9a-f]+\.json$/.test(f) && !wanted.has(f));
for (const f of stale) unlinkSync(join(OUT, f));

if (missing.length > 0) {
  console.warn(`⚠ Không có dữ liệu nét viết cho: ${missing.join(' ')}`);
}
console.log(
  `hanzi:copy — ${chars.size - missing.length}/${chars.size} chữ → public/hanzi/, ` +
    `xóa ${stale.length} file cũ`,
);
