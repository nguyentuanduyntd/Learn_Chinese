import { Fragment } from 'react';
import type { Tone } from '@/types/content';
import { getTone, splitSyllables } from '@/utils/pinyin';

/** Lớp màu thanh điệu (SPEC 9.1) — viết đủ tên lớp để Tailwind quét được. */
const TONE_CLASS: Record<Tone, string> = {
  1: 'text-tone1',
  2: 'text-tone2',
  3: 'text-tone3',
  4: 'text-tone4',
  5: 'text-tone5',
};

interface Segment {
  text: string;
  tone?: Tone; // undefined = khoảng trắng / dấu câu, giữ nguyên
}

/** Cắt chuỗi thành âm tiết (có thanh) xen kẽ phần phân cách, không làm mất ký tự nào. */
function toSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const syllable of splitSyllables(text)) {
    const start = text.indexOf(syllable, cursor);
    if (start > cursor) segments.push({ text: text.slice(cursor, start) });
    segments.push({ text: syllable, tone: getTone(syllable) });
    cursor = start + syllable.length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

interface PinyinProps {
  /** Pinyin có dấu, các âm tiết cách nhau: "Nǐ hǎo!" */
  text: string;
  className?: string;
}

/** Hiển thị pinyin, tô màu từng âm tiết theo thanh điệu. */
export function Pinyin({ text, className }: PinyinProps) {
  return (
    <span lang="zh-Latn-pinyin" className={className}>
      {toSegments(text).map((s, i) =>
        s.tone ? (
          <span key={i} data-tone={s.tone} className={TONE_CLASS[s.tone]}>
            {s.text}
          </span>
        ) : (
          <Fragment key={i}>{s.text}</Fragment>
        ),
      )}
    </span>
  );
}
