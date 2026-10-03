import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTypingStore } from '../../store/typingStore';
import { useThemeStore } from '../../store/themeStore';
import { Select } from '../ui/Select';

export const ModeSelector: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
  const store = useTypingStore();
  const { theme, setTheme } = useThemeStore();
  
  // Local state for the time input
  const [timeValue, setTimeValue] = useState('10');
  const [timeUnit, setTimeUnit] = useState('min');
  
  // Calculate base mode category
  const baseMode = store.mode.startsWith('time-') ? 'time' : (store.mode === 'words' ? 'words' : 'zen');

  const setFont = (font: typeof store.font) => { 
    store.setConfiguration({ font }); 
    document.documentElement.style.setProperty('--typing-font', `'${font}', ui-monospace, monospace`); 
  };

  const handleModeChange = (mode: 'time' | 'words' | 'zen') => {
    if (mode === 'zen') {
      store.setMode('zen');
    } else if (mode === 'words') {
      store.setMode('words');
      store.setCustomWordCount(50); // Default to 50 when switching
    } else {
      // time
      const val = parseInt(timeValue, 10);
      if (!isNaN(val)) {
        const secs = timeUnit === 'min' ? val * 60 : val;
        store.setMode('time-30'); // base
        store.setDuration(secs);
      }
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTimeValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && baseMode === 'time') {
      const secs = timeUnit === 'min' ? num * 60 : num;
      store.setDuration(secs);
    }
  };

  const handleUnitChange = (unit: string) => {
    setTimeUnit(unit);
    const num = parseInt(timeValue, 10);
    if (!isNaN(num) && baseMode === 'time') {
      const secs = unit === 'min' ? num * 60 : num;
      store.setDuration(secs);
    }
  };

  return (
    <div className="settings-dashboard">
      <div className="settings-grid">
        {/* Card 1: Typing Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>TYPING SETTINGS</h3>
          </div>
          <div className="settings-card-content settings-toggles">
            <Toggle 
              label="Punctuation" 
              checked={store.punctuation} 
              onChange={(punctuation) => store.setConfiguration({ punctuation })} 
            />
            <Toggle 
              label="Numbers" 
              checked={store.numbers} 
              onChange={(numbers) => store.setConfiguration({ numbers })} 
            />
          </div>
          <div className="settings-card-footer">
            <p>Include punctuation and numbers<br/>in your practice text.</p>
            <button className="info-btn" aria-label="More info">i</button>
          </div>
        </div>

        {/* Card 2: Typing Mode */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>TYPING MODE</h3>
          </div>
          <div className="settings-card-content mode-inputs">
            <div className="mode-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Time
            </div>
            <input 
              type="text" 
              className="mode-value-input" 
              value={timeValue} 
              onChange={handleTimeChange}
              aria-label="Time value"
            />
            <Select
              compact
              aria-label="Time unit"
              value={timeUnit}
              options={['s', 'min']}
              onChange={handleUnitChange}
            />
          </div>
          <div className="settings-card-footer">
            <p>Set a custom time limit<br/>for your typing session.</p>
          </div>
        </div>

        {/* Card 3: Test Type */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>TEST TYPE</h3>
          </div>
          <div className="settings-card-content">
            <div className="segmented-control">
              <button 
                className={`segment-item ${baseMode === 'time' ? 'active' : ''}`}
                onClick={() => handleModeChange('time')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Time
              </button>
              <button 
                className={`segment-item ${baseMode === 'words' ? 'active' : ''}`}
                onClick={() => handleModeChange('words')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                Words
              </button>
              <button 
                className={`segment-item ${baseMode === 'zen' ? 'active' : ''}`}
                onClick={() => handleModeChange('zen')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 8v8M16 8v8M12 4v16"></path><path d="M4 12h16"></path></svg>
                Unlimited
              </button>
            </div>
          </div>
          <div className="settings-card-footer">
            <p>Choose how you want<br/>to structure your test.</p>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Session Settings */}
      <div className="settings-panel">
        <div className="settings-panel-header">
          <h3>SESSION SETTINGS</h3>
        </div>
        <div className="settings-panel-content">
          <Select 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>}
            value={store.language} 
            options={['English', 'Hindi', 'Spanish', 'French', 'German', 'Programming']} 
            onChange={(language) => store.setConfiguration({ language: language as typeof store.language })} 
          />
          <Select 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-4"></path></svg>}
            value={store.difficulty} 
            options={['Easy', 'Normal', 'Hard', 'Expert', 'Master']} 
            onChange={(difficulty) => store.setConfiguration({ difficulty: difficulty as typeof store.difficulty })} 
          />
          <Select 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>}
            value={theme} 
            options={['dark', 'oled', 'light', 'highContrast']} 
            onChange={(value) => setTheme(value as typeof theme)} 
          />
          <Select 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>}
            value={store.font} 
            options={['JetBrains Mono', 'Fira Code', 'IBM Plex Mono', 'Cascadia Code', 'Roboto Mono']} 
            onChange={(font) => setFont(font as typeof store.font)} 
          />
          <Select 
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"></path></svg>}
            value={store.keyboardLayout} 
            options={['QWERTY', 'QWERTZ', 'AZERTY', 'DVORAK', 'COLEMAK']} 
            onChange={(keyboardLayout) => store.setConfiguration({ keyboardLayout: keyboardLayout as typeof store.keyboardLayout })} 
          />
          <button className="panel-restart" onClick={onRestart} aria-label="Restart typing test">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.27l5.58 5.7"></path></svg>
            Restart
          </button>
        </div>
        <div className="settings-panel-footer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
          These settings will be applied to your next session.
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (value: boolean) => void }> = ({ label, checked, onChange }) => (
  <button className={`new-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
    <div className="new-toggle-switch"><motion.div layout className="new-toggle-knob" /></div>
    <span>{label}</span>
  </button>
);

