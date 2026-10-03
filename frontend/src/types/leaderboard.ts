export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  bestWpm: number;
  accuracy: number;
  testsCompleted: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';
