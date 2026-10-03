import api from '../lib/axios';
import type { TestInput, TestResult, TestStats } from '../types/test';

export const testService = {
  saveTest: async (testData: TestInput): Promise<TestResult> => {
    const { data } = await api.post<TestResult>('/tests', testData);
    return data;
  },

  getUserTests: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{ tests: TestResult[]; total: number; pages: number }> => {
    const { data } = await api.get('/tests', { params: { page, limit } });
    return data;
  },

  getTestById: async (id: string): Promise<TestResult> => {
    const { data } = await api.get<TestResult>(`/tests/${id}`);
    return data;
  },

  getTestStats: async (): Promise<TestStats> => {
    const { data } = await api.get<TestStats>('/tests/stats');
    return data;
  },
};
