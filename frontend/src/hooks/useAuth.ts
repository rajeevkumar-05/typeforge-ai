import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout, setUser, setLoading, updatePreferences } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token && !user) {
        try {
          const { user: userData } = await authService.getMe();
          setUser(userData);
        } catch {
          storeLogout();
        }
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token, user, setUser, storeLogout, setLoading]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);
    storeLogin(result.user, result.token);
    return result;
  }, [storeLogin]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const result = await authService.register(credentials);
    storeLogin(result.user, result.token);
    return result;
  }, [storeLogin]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    storeLogout();
  }, [storeLogout]);

  const forgotPassword = useCallback(async (email: string) => {
    return authService.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (resetToken: string, password: string) => {
    return authService.resetPassword(resetToken, password);
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updatePreferences,
  };
};
