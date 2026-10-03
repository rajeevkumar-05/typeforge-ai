import { commonWords } from '../data/words';
import { getRandomQuote } from '../data/quotes';
import { getRandomSnippet } from '../data/codeSnippets';
import type { TestMode } from '../types/test';
import type { TypingConfiguration } from '../store/typingStore';

const vocabulary = {
  Easy: commonWords.filter((word) => word.length <= 5),
  Normal: commonWords,
  Hard: ['architecture', 'consequence', 'perspective', 'sophisticated', 'extraordinary', 'unpredictable', 'simultaneously', 'infrastructure', 'transformation', 'collaboration'],
  Expert: ['asynchronous', 'deterministic', 'polymorphism', 'interoperability', 'cryptographic', 'idempotency', 'observability', 'normalization', 'concurrency', 'encapsulation'],
  Master: ['synecdoche', 'sesquipedalian', 'incommensurable', 'electroencephalogram', 'metaprogramming', 'quintessential', 'heterogeneous', 'pneumonoultramicroscopicsilicovolcanoconiosis'],
};
const languageWords: Record<TypingConfiguration['language'], string[]> = {
  English: [], French: ['bonjour', 'liberté', 'voyage', 'bonjour', 'étoile', 'réflexion'], Spanish: ['hola', 'gracias', 'mañana', 'corazón', 'alegría', 'camino'],
  German: ['hallo', 'freiheit', 'wunderbar', 'wissenschaft', 'freundschaft'], Hindi: ['namaste', 'bharat', 'dost', 'shanti', 'safar'],
  Programming: ['function', 'const', 'interface', 'async', 'return', 'boolean', 'component', 'variable'],
};
const numericTokens = ['2026', '95%', '$150', '3.2', 'Chapter 15', '12/08/2026', '+1-555-0142', '8 * 7'];
const punctuation = ['.', ',', '!', '?', ':', ';', "'", '"', '()', '[]', '{}', '-', '—', '…'];
const pick = <T,>(values: T[]) => values[Math.floor(Math.random() * values.length)];

export function generateDataset(mode: TestMode, wordCount: number, config: TypingConfiguration): string {
  if (mode === 'custom' && config.customText.trim()) return config.customText.trim();
  if (mode === 'code' || config.language === 'Programming') return getRandomSnippet().text;
  if (mode === 'quote') return sanitize(getRandomQuote().text, config);
  const isEasy = config.difficulty === 'Easy';
  const needsChallenge = config.difficulty === 'Hard' || config.difficulty === 'Expert' || config.difficulty === 'Master';
  const includeNumbers = !isEasy && (config.numbers || needsChallenge);
  const includePunctuation = !isEasy && (config.punctuation || needsChallenge);
  const words = [...vocabulary[config.difficulty], ...languageWords[config.language]];
  const source = words.length ? words : commonWords;
  const length = mode === 'zen' || mode.startsWith('time-') ? 200 : wordCount;
  const output = Array.from({ length }, (_, index) => {
    let token = includeNumbers ? (index % 11 === 8 ? pick(numericTokens) : pick(source)) : pick(source);
    if (includePunctuation) token += index % 9 === 8 ? pick(punctuation) : index % 5 === 4 ? ',' : '';
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
