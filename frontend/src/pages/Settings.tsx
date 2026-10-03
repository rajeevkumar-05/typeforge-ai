import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/userService';
import { ACCENT_COLORS, THEMES } from '../lib/constants';
import { cn } from '../lib/utils';

const Settings: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useThemeStore();
  const { soundEnabled, setSoundEnabled, smoothCaret, setSmoothCaret, fontSize, setFontSize } = useSettingsStore();
  const { isAuthenticated, updatePreferences } = useAuth();
  const toast = useToast();

  const handleSaveToCloud = async () => {
    if (!isAuthenticated) {
      toast.info('Login to save settings to your account');
      return;
    }
    try {
      await userService.updatePreferences({
        theme,
        accentColor,
        soundEnabled,
        smoothCaret,
        fontSize,
      });
      updatePreferences({ theme, accentColor, soundEnabled, smoothCaret, fontSize });
      toast.success('Settings saved to your account!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Customize your typing experience</p>
        </div>

        {/* Theme */}
        <Card>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Theme</h2>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer',
                  theme === t.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/30'
                )}
              >
                <span className="text-2xl block mb-2">{t.icon}</span>
                <span className="text-sm font-medium text-text-primary">{t.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Accent Color */}
        <Card>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Accent Color</h2>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={cn(
                  'w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer',
                  accentColor === color.value
                    ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] scale-110'
                    : 'hover:scale-105'
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </Card>

        {/* Font Size */}
        <Card>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Font Size</h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={12}
              max={32}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 accent-[var(--accent-color)]"
            />
            <span className="text-text-primary font-mono w-12 text-right">{fontSize}px</span>
          </div>
          <div className="mt-4 p-4 bg-bg-tertiary rounded-xl font-mono" style={{ fontSize: `${fontSize}px` }}>
            <span className="text-[var(--char-correct)]">preview text </span>
            <span className="text-[var(--char-upcoming)]">sample words</span>
          </div>
        </Card>

        {/* Toggles */}
        <Card>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Preferences</h2>
          <div className="space-y-4">
            <ToggleRow
              label="Smooth Caret"
              description="Animate caret movement between characters"
              enabled={smoothCaret}
              onChange={setSmoothCaret}
            />
            <ToggleRow
              label="Sound Effects"
              description="Play keystroke sounds while typing"
              enabled={soundEnabled}
              onChange={setSoundEnabled}
            />
          </div>
        </Card>

        {/* Save to Cloud */}
        <div className="flex justify-end">
          <Button onClick={handleSaveToCloud}>
            Save to Account
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const ToggleRow: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
}> = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm font-medium text-text-primary">{label}</div>
      <div className="text-xs text-text-muted">{description}</div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer',
        enabled ? 'bg-accent' : 'bg-bg-tertiary border border-border'
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-200',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  </div>
);

export default Settings;
