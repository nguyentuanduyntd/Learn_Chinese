import type { Example, ItemKind } from './content';

export type Skill = 'recognize' | 'listen' | 'write';
export type CardState = 'new' | 'learning' | 'review' | 'mastered';

export interface SrsCard {
  id: string; // = `${kind}:${itemId}:${skill}`  VD "word:w_nihao:recognize"
  itemId: string;
  kind: ItemKind;
  skill: Skill;
  ease: number; // 2.5 mặc định
  interval: number; // ngày
  reps: number;
  lapses: number;
  due: number; // timestamp ms
  state: CardState;
  lastReviewed?: number;
}

export interface LessonProgress {
  lessonId: string;
  completedAt?: number;
  bestAccuracy: number; // 0..1
  timesCompleted: number;
  stars: 0 | 1 | 2 | 3; // 3 = hoàn hảo
}

export type SessionType = 'lesson' | 'review' | 'speed' | 'writing' | 'tones';

export interface SessionLog {
  id?: number; // auto increment
  type: SessionType;
  lessonId?: string;
  startedAt: number;
  endedAt: number;
  xp: number;
  correct: number;
  total: number;
  mistakes: string[]; // item keys
}

export interface RecapNote {
  id: string; // `${lessonId}:${timestamp}`
  lessonId: string;
  createdAt: number;
  keyPoints: string[];
  pattern?: Example;
  tip?: string;
  weakItems: string[]; // item keys "word:w_nihao"
  learnedItems: string[]; // item keys
  stats: { xp: number; accuracy: number; streak: number };
  starred: boolean;
}

export interface DailyStat {
  date: string; // yyyy-MM-dd (theo mốc 4:00 sáng)
  xp: number;
  minutes: number;
  goalMet: boolean;
}

export type ThemeSetting = 'light' | 'dark' | 'system';
export type DailyGoal = 30 | 50 | 100;

export interface Settings {
  dailyGoalXp: DailyGoal;
  ttsRate: number; // 0.6–1.0, mặc định 0.8
  ttsVoiceURI?: string;
  sound: boolean;
  haptics: boolean;
  showPinyin: boolean;
  showHanViet: boolean;
  theme: ThemeSetting;
  reminderTime?: string; // "20:00"
  displayName?: string;
  onboarded: boolean;
  speakExercises: boolean; // bài tập nói (cần mạng trên Chrome)
}

export interface ProfileCounters {
  lessonsCompleted: number;
  perfectLessons: number;
  tonePickCorrect: number;
  writeCorrect: number;
  reviewsDone: number;
}

export interface Profile {
  totalXp: number;
  level: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number; // 0..2
  lastActiveDate?: string; // yyyy-MM-dd — ngày gần nhất có học
  lastGoalDate?: string; // yyyy-MM-dd — ngày gần nhất đạt mục tiêu (dùng tính chuỗi)
  unlockedAchievements: string[];
  cultureCards: string[];
  pendingMysteryBoxes: string[]; // unitId đã xong nhưng chưa mở hộp
  counters: ProfileCounters;
  speedBest: number; // kỷ lục Tốc Độ 60s
  lastBackupAt?: number;
}

export interface KvRow {
  key: string;
  value: unknown;
}
