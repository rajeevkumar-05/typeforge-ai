import { create } from 'zustand';
import type { TestMode } from '../types/test';

export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Master';
export type TypingLanguage = 'English' | 'French' | 'Spanish' | 'German' | 'Hindi' | 'Programming';
export type KeyboardLayout = 'QWERTY' | 'AZERTY' | 'QWERTZ' | 'DVORAK' | 'COLEMAK';
export type TypingFont = 'JetBrains Mono' | 'Fira Code' | 'IBM Plex Mono' | 'Cascadia Code' | 'Roboto Mono';

export interface TypingConfiguration {
  punctuation: boolean;
  numbers: boolean;
  difficulty: Difficulty;
  language: TypingLanguage;
  font: TypingFont;
  keyboardLayout: KeyboardLayout;
  customText: string;
}

interface TypingStore extends TypingConfiguration {
  mode: TestMode;
  duration: number;
  customWordCount: number;
  setMode: (mode: TestMode) => void;
  setDuration: (duration: number) => void;
  setCustomWordCount: (count: number) => void;
  setConfiguration: (settings: Partial<TypingConfiguration>) => void;
}

const read = <T,>(key: string, fallback: T): T => (localStorage.getItem(key) as T) || fallback;
const persist = (settings: Partial<TypingConfiguration>) => Object.entries(settings).forEach(([key, value]) => localStorage.setItem(`typeforge_${key}`, String(value)));

export const useTypingStore = create<TypingStore>((set) => ({
  mode: 'time-30', duration: 30, customWordCount: 50,
  punctuation: localStorage.getItem('typeforge_punctuation') === 'true',
  numbers: localStorage.getItem('typeforge_numbers') === 'true',
  difficulty: read('typeforge_difficulty', 'Normal'),
  language: read('typeforge_language', 'English'),
  font: read('typeforge_font', 'JetBrains Mono'),
  keyboardLayout: read('typeforge_keyboardLayout', read('typeforge_layout', 'QWERTY')),
  customText: localStorage.getItem('typeforge_customText') || '',
  setMode: (mode) => set({ mode, duration: mode === 'time-15' ? 15 : mode === 'time-60' ? 60 : mode === 'time-120' ? 120 : mode.startsWith('time-') ? 30 : 0 }),
  setDuration: (duration) => set({ duration }),
  setCustomWordCount: (customWordCount) => set({ customWordCount }),
  setConfiguration: (settings) => { persist(settings); set(settings); },
}));
