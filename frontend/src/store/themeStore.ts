import { create } from 'zustand';

type Theme = 'dark' | 'oled' | 'light' | 'highContrast';

interface ThemeState {
  theme: Theme;
  accentColor: string;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
}

const savedTheme = (localStorage.getItem('typeforge_theme') as Theme) || 'dark';
const savedAccent = localStorage.getItem('typeforge_accent') || '#e2b714';

// Apply theme on load
document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.style.setProperty('--accent-color', savedAccent);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: savedTheme,
  accentColor: savedAccent,

  setTheme: (theme) => {
    localStorage.setItem('typeforge_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  setAccentColor: (accentColor) => {
    localStorage.setItem('typeforge_accent', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    set({ accentColor });
  },
}));
