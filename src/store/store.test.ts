import { beforeEach, describe, expect, it } from 'vitest';
import { repo } from '@/db/repositories';
import { DEFAULT_SETTINGS } from '@/db/defaults';
import { useProfile } from './useProfile';
import { useSettings } from './useSettings';

beforeEach(async () => {
  await repo.clearAll();
  useSettings.setState({ settings: DEFAULT_SETTINGS, hydrated: false });
});

describe('useSettings', () => {
  it('hydrate đọc từ DB, update đổi state ngay và ghi DB', async () => {
    await repo.settings.update({ theme: 'dark' });
    await useSettings.getState().hydrate();
    expect(useSettings.getState()).toMatchObject({ hydrated: true, settings: { theme: 'dark' } });

    const pending = useSettings.getState().update({ dailyGoalXp: 100 });
    expect(useSettings.getState().settings.dailyGoalXp).toBe(100); // lạc quan, trước khi DB xong
    await pending;
    expect((await repo.settings.get()).dailyGoalXp).toBe(100);
  });
});

describe('useProfile', () => {
  it('hydrate + update', async () => {
    await useProfile.getState().hydrate();
    expect(useProfile.getState().profile.totalXp).toBe(0);
    await useProfile.getState().update({ totalXp: 35 });
    expect((await repo.profile.get()).totalXp).toBe(35);
  });
});
