import api from '../lib/axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export const authService = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<{ user: AuthResponse['user'] }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  getGoogleAuthUrl: (): string => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    return `${baseUrl}/auth/google`;
  },
};
