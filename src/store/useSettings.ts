import { create } from 'zustand';
import { repo } from '@/db/repositories';
import { DEFAULT_SETTINGS } from '@/db/defaults';
import type { Settings } from '@/types/user';

interface SettingsState {
  settings: Settings;
  /** true sau khi đã đọc từ IndexedDB — trước đó là mặc định. */
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** Cập nhật lạc quan: đổi state ngay, ghi DB nền. */
  update: (patch: Partial<Settings>) => Promise<void>;
}

export const useSettings = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async () => {
    set({ settings: await repo.settings.get(), hydrated: true });
  },
  update: async (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    await repo.settings.update(patch);
  },
}));
