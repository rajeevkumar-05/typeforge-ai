import { useCallback, useRef, useState, useEffect } from 'react';

interface TimerOptions {
  mode: 'countdown' | 'countup';
  duration: number; // seconds (for countdown)
  onTick?: (timeElapsed: number, timeRemaining: number) => void;
  onComplete?: () => void;
}

export const useTimer = (options: TimerOptions) => {
  const { mode, duration, onTick, onComplete } = options;
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);

  // Keep callbacks fresh without restarting the timer
  onTickRef.current = onTick;
  onCompleteRef.current = onComplete;

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    setTimeElapsed(elapsed);

    const remaining = mode === 'countdown' ? Math.max(0, duration - elapsed) : 0;
    onTickRef.current?.(elapsed, remaining);

    if (mode === 'countdown' && elapsed >= duration) {
      setIsRunning(false);
      onCompleteRef.current?.();
      return;
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [mode, duration]);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = performance.now();
    setIsRunning(true);
    setTimeElapsed(0);
    rafIdRef.current = requestAnimationFrame(tick);
  }, [isRunning, tick]);

  const stop = useCallback(() => {
    setIsRunning(false);
    cancelAnimationFrame(rafIdRef.current);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeElapsed(0);
    cancelAnimationFrame(rafIdRef.current);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []);

  const timeRemaining = mode === 'countdown' ? Math.max(0, duration - timeElapsed) : 0;

  return {
    timeElapsed,
    timeRemaining,
    isRunning,
    start,
    stop,
    reset,
  };
};
