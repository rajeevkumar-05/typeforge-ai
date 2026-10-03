import { useMemo } from 'react';
import { calculateWPM, calculateRawWPM, calculateAccuracy } from '../lib/utils';

interface StatsInput {
  correctChars: number;
  totalTyped: number;
  timeElapsed: number;
  mistakes: number;
}

export const useStats = (input: StatsInput) => {
  const { correctChars, totalTyped, timeElapsed, mistakes } = input;

  return useMemo(() => ({
    wpm: calculateWPM(correctChars, timeElapsed),
    rawWpm: calculateRawWPM(totalTyped, timeElapsed),
    netWpm: calculateWPM(correctChars, timeElapsed),
    accuracy: calculateAccuracy(correctChars, totalTyped),
    mistakes,
    charsPerSecond: timeElapsed > 0 ? Math.round(totalTyped / timeElapsed) : 0,
  }), [correctChars, totalTyped, timeElapsed, mistakes]);
};
