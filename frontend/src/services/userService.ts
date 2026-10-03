import api from '../lib/axios';
import type { UserProfile } from '../types/user';
import type { UserPreferences } from '../types/auth';

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>('/users/profile');
    return data;
  },

  updateProfile: async (updates: { username?: string; avatar?: string }): Promise<UserProfile> => {
    const { data } = await api.put<UserProfile>('/users/profile', updates);
    return data;
  },

  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserProfile> => {
    const { data } = await api.put<UserProfile>('/users/preferences', preferences);
    return data;
  },
};
