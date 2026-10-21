import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Globe2, RotateCcw, Square } from 'lucide-react';
import { useTypingEngine } from '../../hooks/useTypingEngine';
import { useTypingStore } from '../../store/typingStore';
import { useThemeStore } from '../../store/themeStore';
import { THEMES } from '../../lib/constants';
import { TypingDisplay } from './TypingDisplay';
import { LiveStats } from './LiveStats';
import { ModeSelector } from './ModeSelector';
import { TestResults } from './TestResults';

export const TypingEngine: React.FC = () => {
  const { mode, duration, customWordCount, punctuation, numbers, language, customText } = useTypingStore();
  const { theme, setTheme } = useThemeStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const configuration = useMemo(() => ({ punctuation, numbers, language, customText }), [punctuation, numbers, language, customText]);
  const engine = useTypingEngine(mode, duration, customWordCount, configuration);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  const handleRestart = () => {
    engine.restart();
    // Results unmount the input; focus after the practice view is restored.
    requestAnimationFrame(focusInput);
  };

  useEffect(() => { focusInput(); }, []);

  return (
    <div className={`practice-workspace${engine.started && !engine.finished ? ' is-running' : ''}`}>
      <ModeSelector />
      <section className={`practice-stage${engine.finished ? ' is-finished' : ''}`} aria-label="English typing practice">
        {engine.finished ? (
          <TestResults
            wpm={engine.netWpm} rawWpm={engine.rawWpm} accuracy={engine.accuracy}
            mistakes={engine.mistakes} correctChars={engine.correctChars}
            totalTyped={engine.totalTyped} timeElapsed={engine.timeElapsed}
            wpmHistory={engine.wpmHistory} mode={mode} onRestart={handleRestart} autoSave
          />
        ) : (
          <>
            <div className="practice-language"><Globe2 aria-hidden="true" /> english</div>
            <LiveStats wpm={engine.liveWpm} accuracy={engine.accuracy}
              timeElapsed={engine.timeElapsed} timeRemaining={engine.timeRemaining}
              isTimedMode={mode.startsWith('time-')} started={engine.started} />
            <div className="typing-stage" onClick={focusInput}>
              <input ref={inputRef} type="text" className="typing-input"
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    handleRestart();
                    return;
                  }
                  engine.handleKeyDown(event);
                }}
                onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                aria-label="Typing input" aria-describedby="practice-shortcuts" />
              <TypingDisplay chars={engine.chars} cursorPos={engine.cursorPos}
                extraCharsMap={engine.extraCharsMap} isFocused={isFocused} />
            </div>
          </>
        )}
        <div className="practice-actions">
          <button className="practice-restart" onClick={handleRestart} aria-label="Restart typing test" title="Restart (Escape)">
            <RotateCcw aria-hidden="true" />
          </button>
          {engine.started && !engine.finished && (
            <button className="practice-finish" onClick={engine.endSession}><Square aria-hidden="true" /> finish test</button>
          )}
        </div>
      </section>
      <footer className="practice-footer">
        <p id="practice-shortcuts"><kbd>esc</kbd> restart test <span>·</span> <kbd>tab</kbd> move between controls</p>
        <div className="practice-themes" role="group" aria-label="Color theme">
          {THEMES.map(option => (
            <button key={option.value} onClick={() => setTheme(option.value)} aria-pressed={theme === option.value}
              aria-label={`${option.label} theme`}>
              <span className={`theme-swatch swatch-${option.value}`} aria-hidden="true" />{option.label.toLowerCase()}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
