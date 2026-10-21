import { commonWords } from '../data/words';
import { getRandomQuote } from '../data/quotes';
import { getRandomSnippet } from '../data/codeSnippets';
import type { TestMode } from '../types/test';
import type { TypingConfiguration } from '../store/typingStore';

const numericTokens = ['2026', '95', '150', '32', '15', '128', '555', '87'];
const punctuation = ['.', ',', '!', '?', ':', ';'];
const pick = <T,>(values: T[]) => values[Math.floor(Math.random() * values.length)];

export function generateDataset(mode: TestMode, wordCount: number, config: TypingConfiguration): string {
  if (mode === 'custom' && config.customText.trim()) return config.customText.trim();
  if (mode === 'code') return getRandomSnippet().text;
  if (mode === 'quote') return sanitize(getRandomQuote().text, config);
  const length = mode === 'zen' || mode.startsWith('time-') ? 200 : wordCount;
  const output = Array.from({ length }, (_, index) => {
    let token = config.numbers && index % 11 === 8 ? pick(numericTokens) : pick(commonWords);
    if (config.punctuation) token += index % 9 === 8 ? pick(punctuation) : index % 5 === 4 ? ',' : '';
    return token;
  });
  return output.join(' ');
}

function sanitize(text: string, config: TypingConfiguration) {
  let result = text;
  if (!config.punctuation) result = result.replace(/[.,!?;:'"()[\]{}—…-]/g, '');
  if (!config.numbers) result = result.replace(/\d+/g, '');
  return result.replace(/\s+/g, ' ').trim();
}
