import { create } from 'zustand';
import type { TestMode } from '../types/test';

export interface TypingConfiguration {
  punctuation: boolean;
  numbers: boolean;
  language: 'English';
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

// Old language/difficulty/font/layout preferences must not restore removed choices.
localStorage.setItem('typeforge_language', 'English');

export const useTypingStore = create<TypingStore>((set) => ({
  mode: 'time-30', duration: 30, customWordCount: 50,
  punctuation: localStorage.getItem('typeforge_punctuation') === 'true',
  numbers: localStorage.getItem('typeforge_numbers') === 'true',
  language: 'English',
  customText: '',
  setMode: (mode) => set({ mode, duration: mode === 'time-15' ? 15 : mode === 'time-60' ? 60 : mode === 'time-120' ? 120 : mode.startsWith('time-') ? 30 : 0 }),
  setDuration: (duration) => set({ duration }),
  setCustomWordCount: (customWordCount) => set({ customWordCount }),
  setConfiguration: (settings) => {
    const next = { ...settings, language: 'English' as const };
    Object.entries(next).forEach(([key, value]) => localStorage.setItem(`typeforge_${key}`, String(value)));
    set(next);
  },
}));
