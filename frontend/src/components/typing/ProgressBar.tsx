import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = memo(({ progress }) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-6" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #FACC15, #FDE68A, #FACC15)',
          backgroundSize: '200% 100%',
          boxShadow: '0 0 8px rgba(250,204,21,0.5)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.12, ease: 'linear' }}
      />
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';
