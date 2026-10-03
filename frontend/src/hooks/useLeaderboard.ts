import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '../services/leaderboardService';
import type { LeaderboardPeriod } from '../types/leaderboard';

export const useLeaderboard = (period: LeaderboardPeriod = 'alltime') => {
  const query = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => leaderboardService.getLeaderboard(period),
    staleTime: 60000, // 1 minute
  });

  return {
    entries: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
