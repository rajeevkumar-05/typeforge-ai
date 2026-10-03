import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('typeforge_token'),
  isAuthenticated: !!localStorage.getItem('typeforge_token'),
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  setToken: (token) => {
    localStorage.setItem('typeforge_token', token);
    set({ token, isAuthenticated: true });
  },

  login: (user, token) => {
    localStorage.setItem('typeforge_token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('typeforge_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  updatePreferences: (preferences) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, preferences: { ...state.user.preferences, ...preferences } }
        : null,
    })),
}));
