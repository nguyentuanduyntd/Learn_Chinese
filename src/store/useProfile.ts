import { create } from 'zustand';
import { repo } from '@/db/repositories';
import { DEFAULT_PROFILE } from '@/db/defaults';
import type { Profile } from '@/types/user';

interface ProfileState {
  profile: Profile;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** Đặt lại từ giá trị đã tính (VD sau finishLesson) — không tính XP/streak ở đây. */
  replace: (profile: Profile) => void;
  update: (patch: Partial<Profile>) => Promise<void>;
}

export const useProfile = create<ProfileState>((set) => ({
  profile: DEFAULT_PROFILE,
  hydrated: false,
  hydrate: async () => {
    set({ profile: await repo.profile.get(), hydrated: true });
  },
  replace: (profile) => set({ profile }),
  update: async (patch) => {
    set((s) => ({ profile: { ...s.profile, ...patch } }));
    await repo.profile.update(patch);
  },
}));
