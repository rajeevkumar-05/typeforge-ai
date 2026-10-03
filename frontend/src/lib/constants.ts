import { type TestMode } from '../types/test';

export const TEST_DURATIONS = [15, 30, 60, 120] as const;

export const TEST_MODES: { value: TestMode; label: string; icon: string }[] = [
  { value: 'time-15', label: '15s', icon: '⏱' },
  { value: 'time-30', label: '30s', icon: '⏱' },
  { value: 'time-60', label: '60s', icon: '⏱' },
  { value: 'time-120', label: '120s', icon: '⏱' },
  { value: 'words', label: 'words', icon: '📝' },
  { value: 'custom', label: 'custom', icon: '⚙️' },
  { value: 'zen', label: 'zen', icon: '🧘' },
  { value: 'quote', label: 'quote', icon: '💬' },
  { value: 'code', label: 'code', icon: '💻' },
];

export const ACCENT_COLORS = [
  { name: 'Gold', value: '#e2b714' },
  { name: 'Blue', value: '#4f9cf7' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Rose', value: '#f43f5e' },
];

export const THEMES = [
  { value: 'dark' as const, label: 'Dark', icon: '🌙' },
  { value: 'light' as const, label: 'Light', icon: '☀️' },
  { value: 'highContrast' as const, label: 'High Contrast', icon: '🔲' },
];

export const LEADERBOARD_PERIODS = [
  { value: 'daily' as const, label: 'Daily' },
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'alltime' as const, label: 'All Time' },
];

export const DEFAULT_WORD_COUNT = 50;
export const PAUSE_THRESHOLD_MS = 5000;
export const WPM_UPDATE_INTERVAL_MS = 100;
export const WORDS_PER_PAGE = 150;
