import React, { memo } from 'react';
import { formatTime } from '../../lib/utils';

interface LiveStatsProps {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  timeRemaining: number;
  isTimedMode: boolean;
  started: boolean;
}

export const LiveStats: React.FC<LiveStatsProps> = memo(({ wpm, accuracy, timeElapsed, timeRemaining, isTimedMode, started }) => (
  <div className={`practice-stats${started ? ' is-visible' : ''}`} aria-label="Live typing statistics">
    <span>{formatTime(isTimedMode ? timeRemaining : timeElapsed)} <small>{isTimedMode ? 'left' : 'elapsed'}</small></span>
    <span>{wpm} <small>wpm</small></span>
    <span>{accuracy}% <small>accuracy</small></span>
  </div>
));

LiveStats.displayName = 'LiveStats';
