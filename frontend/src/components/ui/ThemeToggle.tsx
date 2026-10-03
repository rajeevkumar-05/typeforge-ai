import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const cycles: Array<typeof theme> = ['dark', 'light', 'highContrast'];
  const next = () => {
    const idx = cycles.indexOf(theme);
    setTheme(cycles[(idx + 1) % cycles.length]);
  };

  const icon =
    theme === 'dark'         ? '🌙'
    : theme === 'light'      ? '☀️'
    : '⬛';

  const label =
    theme === 'dark'         ? 'Dark mode'
    : theme === 'light'      ? 'Light mode'
    : 'High contrast';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={next}
      title={label}
      aria-label={`Switch theme (current: ${label})`}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-base hover:border-accent/40 transition-all duration-200 cursor-pointer"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          className="leading-none"
        >
          {icon}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};
