import { useQuery } from '@tanstack/react-query';
import { testService } from '../services/testService';

export const useDashboard = () => {
  const statsQuery = useQuery({
    queryKey: ['testStats'],
    queryFn: testService.getTestStats,
    staleTime: 30000, // 30 seconds
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

export const useTestHistory = (page: number = 1, limit: number = 20) => {
  const historyQuery = useQuery({
    queryKey: ['testHistory', page, limit],
    queryFn: () => testService.getUserTests(page, limit),
    staleTime: 30000,
  });

  return {
    tests: historyQuery.data?.tests || [],
    total: historyQuery.data?.total || 0,
    pages: historyQuery.data?.pages || 0,
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
  };
};
