import { create } from 'zustand';

// Keep API-compatible values: dark = blue, oled = black, light = white.
export type Theme = 'dark' | 'oled' | 'light';

interface ThemeState {
  theme: Theme;
  accentColor: string;
  setTheme: (theme: Theme) => void;
}

const accents: Record<Theme, string> = { dark: '#b5a0f5', oled: '#dedede', light: '#6550b8' };
const previous = localStorage.getItem('typeforge_theme');
const savedTheme: Theme = previous === 'light' || previous === 'oled' ? previous : previous === 'highContrast' ? 'oled' : 'dark';

function applyTheme(theme: Theme) {
  localStorage.setItem('typeforge_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  // Old custom accent overrides must not override the three curated palettes.
  document.documentElement.style.removeProperty('--accent-color');
}

applyTheme(savedTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: savedTheme,
  accentColor: accents[savedTheme],
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme, accentColor: accents[theme] });
  },
}));
