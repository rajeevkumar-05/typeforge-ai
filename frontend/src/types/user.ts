export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  provider: 'local' | 'google';
  preferences: {
    theme: 'dark' | 'oled' | 'light' | 'highContrast';
    accentColor: string;
    soundEnabled: boolean;
    smoothCaret: boolean;
    fontSize: number;
  };
  createdAt: string;
}
