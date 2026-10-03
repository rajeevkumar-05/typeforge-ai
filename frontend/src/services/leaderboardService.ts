import api from '../lib/axios';
import type { LeaderboardEntry, LeaderboardPeriod } from '../types/leaderboard';

export const leaderboardService = {
  getLeaderboard: async (
    period: LeaderboardPeriod = 'alltime',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> => {
    const { data } = await api.get<LeaderboardEntry[]>('/leaderboard', {
      params: { period, limit },
    });
    return data;
  },
};
