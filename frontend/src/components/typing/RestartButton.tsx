import React from 'react';
import { motion } from 'framer-motion';

interface RestartButtonProps {
  onRestart: () => void;
}

export const RestartButton: React.FC<RestartButtonProps> = ({ onRestart }) => (
  <motion.button
    onClick={onRestart}
    whileHover={{ scale: 1.04, y: -1 }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    title="Restart — Tab or Esc"
    aria-label="Restart test"
    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl
               bg-[var(--bg-secondary)] border border-[var(--border-color)]
               text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-accent/30
               transition-all duration-200 cursor-pointer"
  >
    <motion.svg
      className="w-4 h-4 group-hover:text-accent transition-colors"
      fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
      whileHover={{ rotate: -180 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </motion.svg>
    <span className="text-sm font-medium">Restart</span>
    <kbd className="text-[10px] bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-md font-mono text-[var(--text-muted)]">
      Tab
    </kbd>
  </motion.button>
);
