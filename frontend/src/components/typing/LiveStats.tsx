import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../../lib/utils';

interface LiveStatsProps {
  wpm: number;
  accuracy: number;
  mistakes: number;
  timeElapsed: number;
  timeRemaining: number;
  isTimedMode: boolean;
  correctChars: number;
  totalTyped: number;
}

const Metric: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`session-metric ${accent ? 'metric-accent' : ''}`}>
    <strong>{value}</strong><span>{label}</span>
  </div>
);

export const LiveStats: React.FC<LiveStatsProps> = memo(({ wpm, accuracy, mistakes, timeElapsed, timeRemaining, isTimedMode, correctChars, totalTyped }) => {
  const words = Math.floor(correctChars / 5);
  return <motion.div className="session-stats" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
    <Metric label="WPM" value={wpm} accent />
    <Metric label="Accuracy" value={`${accuracy}%`} />
    <Metric label="Mistakes" value={mistakes} />
    <Metric label="Characters" value={totalTyped} />
    <Metric label={isTimedMode ? 'Remaining' : 'Elapsed'} value={formatTime(isTimedMode ? timeRemaining : timeElapsed)} />
    <Metric label="Streak" value="—" />
    <Metric label="Words" value={words} />
  </motion.div>;
});

LiveStats.displayName = 'LiveStats';
