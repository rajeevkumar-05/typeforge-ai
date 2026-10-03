import { create } from 'zustand';

interface SettingsState {
  soundEnabled: boolean;
  smoothCaret: boolean;
  fontSize: number;
  setSoundEnabled: (enabled: boolean) => void;
  setSmoothCaret: (enabled: boolean) => void;
  setFontSize: (size: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: localStorage.getItem('typeforge_sound') === 'true',
  smoothCaret: localStorage.getItem('typeforge_caret') !== 'false',
  fontSize: parseInt(localStorage.getItem('typeforge_fontSize') || '18'),

  setSoundEnabled: (soundEnabled) => {
    localStorage.setItem('typeforge_sound', String(soundEnabled));
    set({ soundEnabled });
  },

  setSmoothCaret: (smoothCaret) => {
    localStorage.setItem('typeforge_caret', String(smoothCaret));
    set({ smoothCaret });
  },

  setFontSize: (fontSize) => {
    localStorage.setItem('typeforge_fontSize', String(fontSize));
    set({ fontSize });
  },
}));
