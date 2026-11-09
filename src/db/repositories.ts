/**
 * Lớp đọc/ghi IndexedDB duy nhất của app (CLAUDE.md: component không chạm Dexie trực tiếp).
 * Không chứa logic nghiệp vụ — SRS/XP tính ở src/engine rồi đưa vào đây để ghi.
 */
import type { ItemKind } from '@/types/content';
import type {
  DailyStat,
  LessonCommit,
  LessonProgress,
  Meta,
  Profile,
  RecapNote,
  SessionLog,
  Settings,
  Skill,
  SrsCard,
} from '@/types/user';
import { newCard } from '@/engine/srs';
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from './defaults';
import { db as defaultDb, type AppDB } from './schema';

const KV = {
  settings: 'settings',
  profile: 'profile',
  meta: 'meta',
  activeSession: 'activeSession',
};

export function createRepositories(db: AppDB) {
  async function kvGet<T>(key: string): Promise<T | undefined> {
    return (await db.kv.get(key))?.value as T | undefined;
  }
  const kvSet = (key: string, value: unknown) => db.kv.put({ key, value });

  const settings = {
    /** Luôn trả về đủ trường: gộp giá trị đã lưu lên mặc định (an toàn khi thêm trường mới). */
    async get(): Promise<Settings> {
      return { ...DEFAULT_SETTINGS, ...(await kvGet<Partial<Settings>>(KV.settings)) };
    },
    async update(patch: Partial<Settings>): Promise<Settings> {
      const next = { ...(await settings.get()), ...patch };
      await kvSet(KV.settings, next);
      return next;
    },
  };

  const profile = {
    async get(): Promise<Profile> {
      const saved = await kvGet<Partial<Profile>>(KV.profile);
      return {
        ...DEFAULT_PROFILE,
        ...saved,
        counters: { ...DEFAULT_PROFILE.counters, ...saved?.counters },
      };
    },
    async update(patch: Partial<Profile>): Promise<Profile> {
      const next = { ...(await profile.get()), ...patch };
      await kvSet(KV.profile, next);
      return next;
    },
  };

  const meta = {
    get: () => kvGet<Meta>(KV.meta),
    set: (value: Meta) => kvSet(KV.meta, value),
  };

  /** Bài đang dở — lưu sau mỗi câu để mở lại app tiếp tục được (SPEC 11.3). */
  const activeSession = {
    get: <T>() => kvGet<T>(KV.activeSession),
    set: (value: unknown) => kvSet(KV.activeSession, value),
    clear: () => db.kv.delete(KV.activeSession),
  };

  const srs = {
    get: (id: string) => db.srsCards.get(id),
    forItem: (kind: ItemKind, itemId: string) =>
      db.srsCards
        .where('itemId')
        .equals(itemId)
        .and((c) => c.kind === kind)
        .toArray(),
    /** Thẻ đến hạn, quá hạn lâu nhất trước; tối đa `limit` (SPEC 13.3: 20/phiên). */
    due: (now: number, limit = 20) =>
      db.srsCards
        .where('due')
        .belowOrEqual(now)
        .sortBy('due')
        .then((cards) => cards.slice(0, limit)),
    countDue: (now: number) => db.srsCards.where('due').belowOrEqual(now).count(),
    countByState: async () => {
      const all = await db.srsCards.toArray();
      return all.reduce<Record<SrsCard['state'], number>>(
        (acc, c) => ({ ...acc, [c.state]: acc[c.state] + 1 }),
        { new: 0, learning: 0, review: 0, mastered: 0 },
      );
    },
    put: (cards: SrsCard[]) => db.srsCards.bulkPut(cards),
    /** Tạo thẻ còn thiếu cho các mục vừa học; thẻ đã có giữ nguyên. Trả về thẻ mới tạo. */
    async ensure(refs: { kind: ItemKind; itemId: string }[], skills: Skill[], now: number) {
      const wanted = refs.flatMap((r) => skills.map((s) => newCard(r.kind, r.itemId, s, now)));
      const existing = new Set(
        (await db.srsCards.bulkGet(wanted.map((c) => c.id))).flatMap((c) => (c ? [c.id] : [])),
      );
      const created = wanted.filter((c) => !existing.has(c.id));
      await db.srsCards.bulkAdd(created);
      return created;
    },
    /** Xóa thẻ của mục không còn trong nội dung (SPEC 10.3 — thẻ mồ côi). */
    async removeOrphans(isKnown: (kind: ItemKind, itemId: string) => boolean) {
      const orphans = (await db.srsCards.toArray()).filter((c) => !isKnown(c.kind, c.itemId));
      await db.srsCards.bulkDelete(orphans.map((c) => c.id));
      return orphans.length;
    },
  };

  const progress = {
    get: (lessonId: string) => db.lessonProgress.get(lessonId),
    all: () => db.lessonProgress.toArray(),
    completedIds: async () =>
      new Set(
        (await db.lessonProgress.filter((p) => p.completedAt !== undefined).toArray()).map(
          (p) => p.lessonId,
        ),
      ),
  };

  const sessions = {
    add: (s: SessionLog) => db.sessions.add(s),
    recent: (limit = 20) => db.sessions.orderBy('startedAt').reverse().limit(limit).toArray(),
  };

  const recaps = {
    get: (id: string) => db.recaps.get(id),
    all: () => db.recaps.orderBy('createdAt').reverse().toArray(),
    forLesson: (lessonId: string) =>
      db.recaps.where('lessonId').equals(lessonId).reverse().sortBy('createdAt'),
    starred: () => db.recaps.filter((r) => r.starred).toArray(),
    setStarred: (id: string, starred: boolean) => db.recaps.update(id, { starred }),
  };

  const dailyStats = {
    get: (date: string) => db.dailyStats.get(date),
    range: (fromDate: string, toDate: string) =>
      db.dailyStats.where('date').between(fromDate, toDate, true, true).toArray(),
    put: (stat: DailyStat) => db.dailyStats.put(stat),
  };

  /** Ghi toàn bộ kết quả cuối bài trong MỘT transaction (SPEC 11.3). */
  function finishLesson(commit: LessonCommit): Promise<void> {
    return db.transaction(
      'rw',
      [db.lessonProgress, db.srsCards, db.sessions, db.recaps, db.dailyStats, db.kv],
      async () => {
        await db.lessonProgress.put(commit.progress);
        await db.srsCards.bulkPut(commit.cards);
        await db.sessions.add(commit.session);
        if (commit.recap) await db.recaps.put(commit.recap);
        await db.dailyStats.put(commit.dailyStat);
        await kvSet(KV.profile, commit.profile);
        await db.kv.delete(KV.activeSession);
      },
    );
  }

  /** Xóa toàn bộ dữ liệu người dùng (Cài đặt → Dữ liệu, xác nhận 2 bước ở UI). */
  async function clearAll(): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      await Promise.all(db.tables.map((t) => t.clear()));
    });
  }

  return {
    settings,
    profile,
    meta,
    activeSession,
    srs,
    progress,
    sessions,
    recaps,
    dailyStats,
    finishLesson,
    clearAll,
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
export type { LessonProgress, RecapNote };

export const repo: Repositories = createRepositories(defaultDb);
