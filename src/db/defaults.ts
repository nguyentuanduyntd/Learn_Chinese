import type { Profile, Settings } from '@/types/user';

export const DEFAULT_SETTINGS: Settings = {
  dailyGoalXp: 50,
  ttsRate: 0.8,
  sound: true,
  haptics: true,
  showPinyin: true,
  showHanViet: true,
  theme: 'system',
  onboarded: false,
  speakExercises: false,
};

export const DEFAULT_PROFILE: Profile = {
  totalXp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  streakFreezes: 0,
  unlockedAchievements: [],
  cultureCards: [],
  pendingMysteryBoxes: [],
  counters: {
    lessonsCompleted: 0,
    perfectLessons: 0,
    tonePickCorrect: 0,
    writeCorrect: 0,
    reviewsDone: 0,
  },
  speedBest: 0,
};
