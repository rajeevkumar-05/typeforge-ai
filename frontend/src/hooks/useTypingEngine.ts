import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import type { TestMode, CharStatus } from '../types/test';
import { calculateWPM, calculateRawWPM, calculateAccuracy } from '../lib/utils';
import { DEFAULT_WORD_COUNT, WPM_UPDATE_INTERVAL_MS } from '../lib/constants';
import { generateDataset } from '../lib/datasetGenerator';
import type { TypingConfiguration } from '../store/typingStore';

interface TypingEngineState {
  chars: CharStatus[];
  cursorPos: number;
  started: boolean;
  finished: boolean;
  mistakes: number;
  correctChars: number;
  totalTyped: number;
  wpmHistory: number[];
  extraCharsMap: Map<number, string[]>;
}

interface TypingEngineReturn {
  text: string;
  chars: CharStatus[];
  cursorPos: number;
  started: boolean;
  finished: boolean;
  timeElapsed: number;
  timeRemaining: number;
  liveWpm: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  mistakes: number;
  correctChars: number;
  totalTyped: number;
  wpmHistory: number[];
  progress: number;
  extraCharsMap: Map<number, string[]>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  restart: () => void;
  endSession: () => void;
}

export const useTypingEngine = (
  mode: TestMode,
  duration: number,
  customWordCount: number = DEFAULT_WORD_COUNT,
  configuration: TypingConfiguration
): TypingEngineReturn => {
  const [text, setText] = useState(() => generateDataset(mode, customWordCount, configuration));
  const [state, setState] = useState<TypingEngineState>(() => createInitialState(text));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const textRef = useRef(text);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const wpmIntervalRef = useRef<number>(0);
  const lastWpmUpdateRef = useRef<number>(0);
  const isTimedMode = mode.startsWith('time-');
  const targetDuration = isTimedMode ? duration : 0;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = 0;
    }
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = 0;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = performance.now();

    // Main timer tick using requestAnimationFrame
    const tick = () => {
      const elapsed = Math.max(0.001, (performance.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);

      if (isTimedMode && elapsed >= targetDuration) {
        // Time's up
        stopTimer();
        setState((prev) => ({ ...prev, finished: true }));
        return;
      }

      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);

    // WPM history sampling every second
    wpmIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.max(0.001, (performance.now() - startTimeRef.current) / 1000);
      setState((prev) => {
        if (prev.finished) return prev;
        const wpm = calculateWPM(prev.correctChars, elapsed);
        return { ...prev, wpmHistory: [...prev.wpmHistory, wpm] };
      });
    }, 1000);
  }, [isTimedMode, targetDuration, stopTimer]);

  const restart = useCallback(() => {
    stopTimer();
    const newText = generateDataset(mode, customWordCount, configuration);
    textRef.current = newText;
    setText(newText);
    setState(createInitialState(newText));
    setTimeElapsed(0);
    setLiveWpm(0);
    startTimeRef.current = 0;
    lastWpmUpdateRef.current = 0;
  }, [mode, customWordCount, configuration, stopTimer]);

  const endSession = useCallback(() => {
    stopTimer();
    // Freeze elapsed time at current or minimum 0.1s
    if (startTimeRef.current > 0) {
      const finalElapsed = Math.max(0.1, (performance.now() - startTimeRef.current) / 1000);
      setTimeElapsed(finalElapsed);
    }
    setState((previous) => previous.finished ? previous : { ...previous, finished: true });
  }, [stopTimer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ignore modifier keys (except shift)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      // Allow Ctrl+Backspace
      if (!(e.ctrlKey && e.key === 'Backspace')) return;
    }
    if (e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      restart();
      return;
    }
    if (e.key === 'Shift' || e.key === 'CapsLock' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    e.preventDefault();

    setState((prev) => {
      if (prev.finished) return prev;

      let newState = { ...prev };
      const chars = [...prev.chars];
      let extraCharsMap = new Map(prev.extraCharsMap);

      // Start timer on first keypress
      if (!prev.started) {
        newState.started = true;
        startTimer();
      }

      if (e.key === 'Backspace') {
        if (e.ctrlKey) {
          // Delete entire previous word
          let pos = newState.cursorPos - 1;
          while (pos >= 0 && textRef.current[pos] === ' ') pos--;
          while (pos >= 0 && textRef.current[pos] !== ' ') pos--;
          const deleteFrom = pos + 1;

          // Remove extra chars and reset deleted positions
          for (let i = deleteFrom; i < newState.cursorPos; i++) {
            extraCharsMap.delete(i);
            if (chars[i]) {
              if (chars[i].status === 'incorrect') newState.mistakes = Math.max(0, newState.mistakes - 1);
              if (chars[i].status === 'correct') newState.correctChars--;
              chars[i] = { ...chars[i], status: 'upcoming' };
              newState.totalTyped = Math.max(0, newState.totalTyped - 1);
            }
          }
          newState.cursorPos = deleteFrom;
        } else {
          // Check if there are extra chars at current position
          const extrasAtPrev = extraCharsMap.get(newState.cursorPos - 1);
          if (extrasAtPrev && extrasAtPrev.length > 0) {
            const newExtras = [...extrasAtPrev];
            newExtras.pop();
            if (newExtras.length > 0) {
              extraCharsMap.set(newState.cursorPos - 1, newExtras);
            } else {
              extraCharsMap.delete(newState.cursorPos - 1);
            }
            newState.totalTyped = Math.max(0, newState.totalTyped - 1);
          } else if (newState.cursorPos > 0) {
            newState.cursorPos--;
            const char = chars[newState.cursorPos];
            if (char) {
              if (char.status === 'incorrect') newState.mistakes = Math.max(0, newState.mistakes - 1);
              if (char.status === 'correct') newState.correctChars--;
              chars[newState.cursorPos] = { ...char, status: 'upcoming' };
              newState.totalTyped = Math.max(0, newState.totalTyped - 1);
            }
          }
        }
      } else if (e.key.length === 1) {
        // Regular character input
        if (newState.cursorPos >= textRef.current.length) {
          // Extra character at end — mark as extra
          const existingExtras = extraCharsMap.get(newState.cursorPos - 1) || [];
          extraCharsMap.set(newState.cursorPos - 1, [...existingExtras, e.key]);
          newState.totalTyped++;
          newState.mistakes++;
        } else {
          const expected = textRef.current[newState.cursorPos];
          const isCorrect = e.key === expected;

          chars[newState.cursorPos] = {
            char: expected,
            status: isCorrect ? 'correct' : 'incorrect',
          };

          if (isCorrect) {
            newState.correctChars++;
          } else {
            newState.mistakes++;
          }

          newState.totalTyped++;
          newState.cursorPos++;

          // Check if test is complete (non-timed modes)
          if (!isTimedMode && mode !== 'zen' && newState.cursorPos >= textRef.current.length) {
            newState.finished = true;
            stopTimer();
          }
        }
      }

      newState.chars = chars;
      newState.extraCharsMap = extraCharsMap;

      // Keep a rolling text buffer for timed and Zen practice. The append happens
      // well before the caret reaches the end, so it never creates a visible pause.
      const isInfiniteMode = isTimedMode || mode === 'zen';
      // Keep a bounded, rolling viewport for unbounded sessions. Removing only
      // already-typed content preserves the active caret while preventing an
      // ever-growing DOM and character array during long Zen sessions.
      if (isInfiniteMode && newState.cursorPos > 360) {
        const recycleAt = textRef.current.lastIndexOf(' ', 240);
        if (recycleAt > 0) {
          const removeCount = recycleAt + 1;
          textRef.current = textRef.current.slice(removeCount);
          chars.splice(0, removeCount);
          newState.cursorPos -= removeCount;
          const recycledExtras = new Map<number, string[]>();
          extraCharsMap.forEach((extras, index) => {
            if (index >= removeCount) recycledExtras.set(index - removeCount, extras);
          });
          extraCharsMap = recycledExtras;
          setText(textRef.current);
        }
      }
      if (isInfiniteMode && !newState.finished && textRef.current.length - newState.cursorPos < 120) {
        const buffer = ` ${generateDataset('words', 120, configuration)}`;
        textRef.current += buffer;
        chars.push(...buffer.split('').map((char) => ({ char, status: 'upcoming' as const })));
        newState.chars = chars;
        setText(textRef.current);
      }

      // Throttle live WPM updates
      const now = performance.now();
      if (now - lastWpmUpdateRef.current > WPM_UPDATE_INTERVAL_MS) {
        lastWpmUpdateRef.current = now;
        const elapsed = startTimeRef.current > 0 ? (now - startTimeRef.current) / 1000 : 0;
        if (elapsed > 0) {
          setLiveWpm(calculateWPM(newState.correctChars, elapsed));
        }
      }

      return newState;
    });
  }, [isTimedMode, mode, startTimer, stopTimer, restart, configuration]);

  // Derived values
  const elapsed = timeElapsed;
  const timeRemaining = isTimedMode ? Math.max(0, targetDuration - elapsed) : 0;
  const rawWpm = useMemo(() => calculateRawWPM(state.totalTyped, elapsed), [state.totalTyped, elapsed]);
  const netWpm = useMemo(() => calculateWPM(state.correctChars, elapsed), [state.correctChars, elapsed]);
  const accuracy = useMemo(
    () => calculateAccuracy(state.correctChars, state.totalTyped),
    [state.correctChars, state.totalTyped]
  );

  const progress = useMemo(() => {
    if (isTimedMode) {
      return targetDuration > 0 ? ((targetDuration - timeRemaining) / targetDuration) * 100 : 0;
    }
    return text.length > 0 ? (state.cursorPos / text.length) * 100 : 0;
  }, [isTimedMode, targetDuration, timeRemaining, state.cursorPos, text.length]);

  // Reset when configuration changes and cleanup on unmount
  useEffect(() => {
    restart();
    return () => {
      stopTimer();
    };
  }, [mode, customWordCount, duration, configuration, restart, stopTimer]);

  return {
    text,
    chars: state.chars,
    cursorPos: state.cursorPos,
    started: state.started,
    finished: state.finished,
    timeElapsed: elapsed,
    timeRemaining,
    liveWpm,
    rawWpm,
    netWpm,
    accuracy,
    mistakes: state.mistakes,
    correctChars: state.correctChars,
    totalTyped: state.totalTyped,
    wpmHistory: state.wpmHistory,
    progress,
    extraCharsMap: state.extraCharsMap,
    handleKeyDown,
    restart,
    endSession,
  };
};

function createInitialState(text: string): TypingEngineState {
  return {
    chars: text.split('').map((char) => ({
      char,
      status: 'upcoming' as const,
    })),
    cursorPos: 0,
    started: false,
    finished: false,
    mistakes: 0,
    correctChars: 0,
    totalTyped: 0,
    wpmHistory: [],
    extraCharsMap: new Map(),
  };
}
