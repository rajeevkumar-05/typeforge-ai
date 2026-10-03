import { clsx, type ClassValue } from 'clsx';

// Merge class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Calculate Words Per Minute
export function calculateWPM(
  correctChars: number,
  timeSeconds: number
): number {
  if (timeSeconds <= 0) return 0;
  // Standard: 1 word = 5 characters
  return Math.round((correctChars / 5) / (timeSeconds / 60));
}

// Calculate Raw WPM (all typed characters)
export function calculateRawWPM(
  totalChars: number,
  timeSeconds: number
): number {
  if (timeSeconds <= 0) return 0;
  return Math.round((totalChars / 5) / (timeSeconds / 60));
}

// Calculate accuracy percentage
export function calculateAccuracy(
  correctChars: number,
  totalChars: number
): number {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 1000) / 10;
}

// Format seconds to mm:ss
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Format duration in seconds to human readable
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Generate random words from a word list
export function generateText(
  words: string[],
  count: number
): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result.join(' ');
}

// Get relative time string
export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
