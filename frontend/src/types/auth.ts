export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  provider: 'local' | 'google';
  preferences: UserPreferences;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPreferences {
  theme: 'dark' | 'oled' | 'light' | 'highContrast';
  accentColor: string;
  soundEnabled: boolean;
  smoothCaret: boolean;
  fontSize: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}
