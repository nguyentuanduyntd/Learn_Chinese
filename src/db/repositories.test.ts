import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { newCard } from '@/engine/srs';
import type { LessonCommit } from '@/types/user';
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from './defaults';
import { createRepositories, type Repositories } from './repositories';
import { AppDB } from './schema';

let db: AppDB;
let repo: Repositories;

beforeEach(() => {
  db = new AppDB(`test_${Math.random().toString(36).slice(2)}`);
  repo = createRepositories(db);
});
afterEach(() => db.delete());

describe('settings / profile (kv)', () => {
  it('trả mặc định khi chưa lưu, gộp patch khi cập nhật', async () => {
    expect(await repo.settings.get()).toEqual(DEFAULT_SETTINGS);
    await repo.settings.update({ theme: 'dark', dailyGoalXp: 100 });
    expect(await repo.settings.get()).toMatchObject({
      theme: 'dark',
      dailyGoalXp: 100,
      sound: true,
    });
  });

  it('profile gộp cả counters lồng nhau', async () => {
    await db.kv.put({ key: 'profile', value: { totalXp: 120, counters: { lessonsCompleted: 2 } } });
    const p = await repo.profile.get();
    expect(p.totalXp).toBe(120);
    expect(p.counters).toEqual({ ...DEFAULT_PROFILE.counters, lessonsCompleted: 2 });
  });
});

describe('srs', () => {
  it('ensure chỉ tạo thẻ còn thiếu', async () => {
    const refs = [{ kind: 'word' as const, itemId: 'w_nihao' }];
    const first = await repo.srs.ensure(refs, ['recognize', 'listen'], 1000);
    expect(first.map((c) => c.id)).toEqual(['word:w_nihao:recognize', 'word:w_nihao:listen']);
    const again = await repo.srs.ensure(refs, ['recognize', 'listen', 'write'], 2000);
    expect(again.map((c) => c.id)).toEqual(['word:w_nihao:write']);
    expect(await db.srsCards.count()).toBe(3);
  });

  it('due: quá hạn lâu nhất trước, giới hạn số lượng, đếm đúng', async () => {
    await repo.srs.put([
      { ...newCard('word', 'a', 'recognize', 0), due: 300 },
      { ...newCard('word', 'b', 'recognize', 0), due: 100 },
      { ...newCard('word', 'c', 'recognize', 0), due: 200 },
      { ...newCard('word', 'd', 'recognize', 0), due: 999 },
    ]);
    expect((await repo.srs.due(500, 2)).map((c) => c.itemId)).toEqual(['b', 'c']);
    expect(await repo.srs.countDue(500)).toBe(3);
  });

  it('forItem lọc theo kind, removeOrphans xóa thẻ mồ côi', async () => {
    await repo.srs.put([
      newCard('word', 'x', 'recognize', 0),
      newCard('hanzi', 'x', 'write', 0),
      newCard('word', 'gone', 'listen', 0),
    ]);
    expect(await repo.srs.forItem('word', 'x')).toHaveLength(1);
    expect(await repo.srs.removeOrphans((_kind, id) => id !== 'gone')).toBe(1);
    expect(await db.srsCards.count()).toBe(2);
  });
});

describe('finishLesson', () => {
  const commit: LessonCommit = {
    progress: {
      lessonId: 'u01-l01',
      completedAt: 5000,
      bestAccuracy: 0.9,
      timesCompleted: 1,
      stars: 2,
    },
    cards: [newCard('word', 'w_nihao', 'recognize', 5000)],
    session: {
      type: 'lesson',
      lessonId: 'u01-l01',
      startedAt: 1000,
      endedAt: 5000,
      xp: 20,
      correct: 9,
      total: 10,
      mistakes: [],
    },
    recap: {
      id: 'u01-l01:5000',
      lessonId: 'u01-l01',
      createdAt: 5000,
      keyPoints: ['a'],
      weakItems: [],
      learnedItems: ['word:w_nihao'],
      stats: { xp: 20, accuracy: 0.9, streak: 1 },
      starred: false,
    },
    dailyStat: { date: '2026-11-09', xp: 20, minutes: 4, goalMet: false },
    profile: { ...DEFAULT_PROFILE, totalXp: 20 },
  };

  it('ghi đủ 6 bảng và xóa bài dở', async () => {
    await repo.activeSession.set({ step: 3 });
    await repo.finishLesson(commit);
    expect(await repo.progress.get('u01-l01')).toMatchObject({ stars: 2 });
    expect(await db.srsCards.count()).toBe(1);
    expect(await repo.sessions.recent()).toHaveLength(1);
    expect(await repo.recaps.forLesson('u01-l01')).toHaveLength(1);
    expect(await repo.dailyStats.get('2026-11-09')).toMatchObject({ xp: 20 });
    expect((await repo.profile.get()).totalXp).toBe(20);
    expect(await repo.activeSession.get()).toBeUndefined();
    expect(await repo.progress.completedIds()).toEqual(new Set(['u01-l01']));
  });

  it('lỗi giữa chừng → không ghi gì (transaction)', async () => {
    const bad = {
      ...commit,
      dailyStat: { ...commit.dailyStat, date: undefined as unknown as string },
    };
    await expect(repo.finishLesson(bad)).rejects.toThrow();
    expect(await repo.progress.get('u01-l01')).toBeUndefined();
    expect(await db.srsCards.count()).toBe(0);
  });
});

describe('recaps / dailyStats / clearAll', () => {
  it('đánh dấu sao và lọc theo khoảng ngày', async () => {
    await db.recaps.put({
      id: 'r1',
      lessonId: 'l',
      createdAt: 1,
      keyPoints: [],
      weakItems: [],
      learnedItems: [],
      stats: { xp: 0, accuracy: 0, streak: 0 },
      starred: false,
    });
    await repo.recaps.setStarred('r1', true);
    expect(await repo.recaps.starred()).toHaveLength(1);
    await repo.dailyStats.put({ date: '2026-11-07', xp: 1, minutes: 1, goalMet: false });
    await repo.dailyStats.put({ date: '2026-11-09', xp: 2, minutes: 1, goalMet: true });
    await repo.dailyStats.put({ date: '2026-11-20', xp: 3, minutes: 1, goalMet: true });
    expect((await repo.dailyStats.range('2026-11-07', '2026-11-09')).map((s) => s.xp)).toEqual([
      1, 2,
    ]);
    await repo.clearAll();
    expect(await db.recaps.count()).toBe(0);
    expect(await db.dailyStats.count()).toBe(0);
  });
});
