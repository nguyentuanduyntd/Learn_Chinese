/**
 * Dexie schema (SPEC 11.3). Đổi schema → tăng version + upgrade(), không bao giờ xóa dữ liệu cũ.
 * Component không import file này trực tiếp — đi qua repositories.ts hoặc hooks.
 */
import Dexie, { type Table } from 'dexie';
import type {
  DailyStat,
  KvRow,
  LessonProgress,
  RecapNote,
  SessionLog,
  SrsCard,
} from '@/types/user';

export class AppDB extends Dexie {
  srsCards!: Table<SrsCard, string>;
  lessonProgress!: Table<LessonProgress, string>;
  sessions!: Table<SessionLog, number>;
  recaps!: Table<RecapNote, string>;
  dailyStats!: Table<DailyStat, string>;
  kv!: Table<KvRow, string>; // settings, profile, meta, activeSession

  constructor(name = 'nihao_db') {
    super(name);
    this.version(1).stores({
      srsCards: 'id, itemId, kind, skill, due, state',
      lessonProgress: 'lessonId, completedAt',
      sessions: '++id, type, lessonId, startedAt',
      recaps: 'id, lessonId, createdAt, starred',
      dailyStats: 'date',
      kv: 'key',
    });
  }
}

export const db = new AppDB();
