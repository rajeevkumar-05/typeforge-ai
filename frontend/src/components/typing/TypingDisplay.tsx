import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CharStatus } from '../../types/test';
import { useSettingsStore } from '../../store/settingsStore';
import { cn } from '../../lib/utils';

interface TypingDisplayProps {
  chars: CharStatus[];
  cursorPos: number;
  extraCharsMap: Map<number, string[]>;
  isFocused: boolean;
}

type DisplayWord = { start: number; chars: CharStatus[] };

const splitIntoWords = (chars: CharStatus[]): DisplayWord[] => {
  const words: DisplayWord[] = [];
  let start = 0;
  let current: CharStatus[] = [];
  chars.forEach((char, index) => {
    current.push(char);
    if (/\s/.test(char.char)) { words.push({ start, chars: current }); start = index + 1; current = []; }
  });
  if (current.length) words.push({ start, chars: current });
  return words;
};

export const TypingDisplay: React.FC<TypingDisplayProps> = memo(({ chars, cursorPos, extraCharsMap, isFocused }) => {
  const { fontSize, smoothCaret } = useSettingsStore();
  const viewportRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);
  const words = splitIntoWords(chars);

  // Start at the first line, then scroll inside the three-line viewport.
  // Recalculate after a resize too, because words can wrap onto different lines.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      const lineHeight = parseFloat(getComputedStyle(cursor.parentElement!).lineHeight);
      const nextOffset = -Math.max(0, Math.floor(cursor.offsetTop / lineHeight) - 1) * lineHeight;
      setOffset(previous => Math.abs(previous - nextOffset) < 0.5 ? previous : nextOffset);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [cursorPos, chars.length, fontSize, isFocused]);

  const cursor = (atEnd = false) => isFocused ? <span
    ref={cursorRef}
    className={cn('typing-caret', smoothCaret && 'typing-caret-smooth')}
    aria-hidden="true"
  /> : (atEnd ? null : null);

  return <div className={cn('typing-display typing-viewport relative select-none', !isFocused && 'typing-unfocused')} style={{ fontSize: `${Math.max(24, Math.min(32, fontSize + 12))}px`, cursor: 'text' }} aria-label="Typing area">
    <div ref={viewportRef} className="typing-lines" aria-live="off">
      <div className="typing-track" style={{ transform: `translateY(${offset}px)` }}>
        {words.map((word) => <span className="typing-word" key={word.start}>
          {word.chars.map((charInfo, localIndex) => {
            const index = word.start + localIndex;
            const extras = extraCharsMap.get(index);
            return <React.Fragment key={index}>
              {index === cursorPos && cursor()}
              <span className={cn('typing-char', charInfo.status === 'correct' && 'correct', charInfo.status === 'incorrect' && 'incorrect', charInfo.status === 'upcoming' && 'upcoming')}>
                {charInfo.char === ' ' ? '\u00A0' : charInfo.char}
              </span>
              {extras?.map((extra, extraIndex) => <span key={`${index}-${extraIndex}`} className="typing-char extra">{extra}</span>)}
            </React.Fragment>;
          })}
        </span>)}
        {cursorPos >= chars.length && cursor(true)}
      </div>
    </div>
    {!isFocused && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="typing-focus-prompt"><span>Click anywhere to focus</span></motion.div>}
  </div>;
});

TypingDisplay.displayName = 'TypingDisplay';
