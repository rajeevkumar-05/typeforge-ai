import React from 'react';
import { Clock3, Hash, Infinity, Type } from 'lucide-react';
import { useTypingStore } from '../../store/typingStore';
import { TEST_DURATIONS } from '../../lib/constants';
import type { TestMode } from '../../types/test';

export const ModeSelector: React.FC = () => {
  const store = useTypingStore();
  const timed = store.mode.startsWith('time-');
  const choices = timed ? TEST_DURATIONS : [10, 25, 50, 100];

  return (
    <div className="practice-toolbar" aria-label="Typing test settings">
      <div className="practice-control-group" role="group" aria-label="Text options">
        <button aria-pressed={store.punctuation} onClick={() => store.setConfiguration({ punctuation: !store.punctuation })}>
          <span aria-hidden="true">@</span> punctuation
        </button>
        <button aria-pressed={store.numbers} onClick={() => store.setConfiguration({ numbers: !store.numbers })}>
          <Hash aria-hidden="true" /> numbers
        </button>
      </div>
      <div className="practice-control-group" role="group" aria-label="Test mode">
        <button aria-pressed={timed} onClick={() => store.setMode('time-30')}><Clock3 aria-hidden="true" /> time</button>
        <button aria-pressed={store.mode === 'words'} onClick={() => store.setMode('words')}><Type aria-hidden="true" /> words</button>
        <button aria-pressed={store.mode === 'zen'} onClick={() => store.setMode('zen')}><Infinity aria-hidden="true" /> zen</button>
      </div>
      {store.mode !== 'zen' && (
        <div className="practice-control-group practice-presets" role="group" aria-label={timed ? 'Test duration in seconds' : 'Word count'}>
          {choices.map(value => (
            <button key={value}
              aria-label={timed ? `${value} seconds` : `${value} words`}
              aria-pressed={timed ? store.duration === value : store.customWordCount === value}
              onClick={() => timed ? store.setMode(`time-${value}` as TestMode) : store.setCustomWordCount(value)}>
              {value}
            </button>
          ))}
          <span className="practice-unit" aria-hidden="true">{timed ? 's' : 'words'}</span>
        </div>
      )}
    </div>
  );
};

