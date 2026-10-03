export type TestMode = 'time-15' | 'time-30' | 'time-60' | 'time-120' | 'words' | 'custom' | 'zen' | 'quote' | 'code';

export interface TestResult {
  _id: string;
  user: string;
  duration: number;
  wordsTyped: number;
  charactersTyped: number;
  mistakes: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  language: string;
  mode: TestMode;
  wpmHistory: number[];
  createdAt: string;
}

export interface TestInput {
  duration: number;
  wordsTyped: number;
  charactersTyped: number;
  mistakes: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  language: string;
  mode: TestMode;
  wpmHistory: number[];
}

export interface TestStats {
  currentWpm: number;
  averageWpm: number;
  highestWpm: number;
  averageAccuracy: number;
  testsCompleted: number;
  totalTypingTime: number;
  currentStreak: number;
  recentTests: TestResult[];
  heatmapData: { date: string; count: number }[];
  performanceData: { date: string; wpm: number; accuracy: number }[];
}

export interface CharStatus {
  char: string;
  status: 'correct' | 'incorrect' | 'extra' | 'upcoming' | 'active';
}

export interface TypingState {
  text: string;
  chars: CharStatus[];
  cursorPos: number;
  started: boolean;
  finished: boolean;
  startTime: number | null;
  timeElapsed: number;
  mode: TestMode;
  duration: number;
  mistakes: number;
  correctChars: number;
  totalTyped: number;
  wpmHistory: number[];
  extraChars: Map<number, string[]>;
}
