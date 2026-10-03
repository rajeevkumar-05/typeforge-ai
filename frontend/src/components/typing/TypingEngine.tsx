import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTypingEngine } from '../../hooks/useTypingEngine';
import { useTypingStore } from '../../store/typingStore';
import { TypingDisplay } from './TypingDisplay';
import { LiveStats } from './LiveStats';
import { ProgressBar } from './ProgressBar';
import { ModeSelector } from './ModeSelector';
import { TestResults } from './TestResults';

export const TypingEngine: React.FC = () => {
  const { mode, duration, customWordCount, punctuation, numbers, difficulty, language, font, keyboardLayout, customText } = useTypingStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [utilityOpen, setUtilityOpen] = useState(false);
  const configuration = useMemo(() => ({ punctuation, numbers, difficulty, language, font, keyboardLayout, customText }), [punctuation, numbers, difficulty, language, font, keyboardLayout, customText]);
  const engine = useTypingEngine(mode, duration, customWordCount, configuration);

  const focusInput = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  const handleRestart = () => {
    engine.restart();
    setTimeout(focusInput, 30);
  };

  // Auto focus input on mount, mode change, or restart
  useEffect(() => {
    const timer = setTimeout(focusInput, 50);
    return () => clearTimeout(timer);
  }, [mode, punctuation, numbers, difficulty, language, customText]);

  // Handle global keyboard shortcuts (Tab / Esc for instant restart)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs (like mode values or custom text)
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'INPUT' && activeEl !== inputRef.current) {
        return;
      }
      if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      if (e.key === 'Tab' || e.key === 'Escape') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [engine]);

  useEffect(() => {
    document.documentElement.style.setProperty('--typing-font', `'${font}', ui-monospace, monospace`);
  }, [font]);

  return (
    <div className="typing-shell" onClick={focusInput}>
      <div className="typing-topline">
        <span className="typing-crumb">
          <b>PRACTICE</b> / {mode.startsWith('time') ? 'TIMED SESSION' : 'FOCUSED SESSION'}
        </span>
        <button
          className="utility-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setUtilityOpen((open) => !open);
          }}
          aria-expanded={utilityOpen}
          aria-controls="typing-utilities"
        >
          {utilityOpen ? 'Hide utilities' : 'Session utilities'} <span>⌘ /</span>
        </button>
      </div>

      <div className="typing-toolbar" aria-label="Typing test settings" onClick={(e) => e.stopPropagation()}>
        <ModeSelector onRestart={handleRestart} />
      </div>

      <AnimatePresence>
        {utilityOpen && (
          <motion.aside
            id="typing-utilities"
            className="utility-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <small>SESSION STATUS</small>
              <strong>{engine.finished ? 'Ended' : engine.started ? 'In progress' : 'Ready'}</strong>
              <i className="utility-progress">
                <b style={{ width: `${Math.min(engine.progress, 100)}%` }} />
              </i>
            </div>
            <div>
              <small>ELAPSED TIME</small>
              <strong>
                {Math.floor(engine.timeElapsed / 60)}:
                {String(Math.floor(engine.timeElapsed % 60)).padStart(2, '0')}
              </strong>
            </div>
            <div>
              <small>WORDS TYPED</small>
              <strong>{Math.floor(engine.correctChars / 5)}</strong>
            </div>
            <div>
              <small>ACCURACY</small>
              <strong>{engine.accuracy}<em>%</em></strong>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="typing-layout">
        <div className="typing-main">
          <LiveStats
            wpm={engine.liveWpm}
            accuracy={engine.accuracy}
            mistakes={engine.mistakes}
            timeElapsed={engine.timeElapsed}
            timeRemaining={engine.timeRemaining}
            isTimedMode={mode.startsWith('time-')}
            correctChars={engine.correctChars}
            totalTyped={engine.totalTyped}
          />
          {engine.started && !engine.finished && <ProgressBar progress={engine.progress} />}
          
          <AnimatePresence mode="wait">
            {engine.finished ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                onClick={(e) => e.stopPropagation()}
              >
                <TestResults
                  wpm={engine.netWpm}
                  rawWpm={engine.rawWpm}
                  accuracy={engine.accuracy}
                  mistakes={engine.mistakes}
                  correctChars={engine.correctChars}
                  totalTyped={engine.totalTyped}
                  timeElapsed={engine.timeElapsed}
                  wpmHistory={engine.wpmHistory}
                  mode={mode}
                  onRestart={handleRestart}
                  autoSave={true}
                />
              </motion.div>
            ) : (
              <motion.div
                key="typing"
                onClick={focusInput}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="typing-stage cursor-text"
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  onKeyDown={engine.handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  tabIndex={0}
                  aria-label="Typing input"
                />
                <TypingDisplay
                  chars={engine.chars}
                  cursorPos={engine.cursorPos}
                  extraCharsMap={engine.extraCharsMap}
                  isFocused={isFocused}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Permanent End Test Button while session is active */}
      {engine.started && !engine.finished && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="end-session-trigger flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              engine.endSession();
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            End Test Early
          </button>
          <button
            className="end-session-trigger flex items-center gap-2 opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleRestart();
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.27l5.58 5.7" />
            </svg>
            Restart (Tab)
          </button>
        </div>
      )}
    </div>
  );
};
