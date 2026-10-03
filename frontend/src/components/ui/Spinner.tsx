import React from 'react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm:  'w-4 h-4',
  md:  'w-6 h-6',
  lg:  'w-9 h-9',
  xl:  'w-14 h-14',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <svg
    className={cn('animate-spin text-accent', sizeMap[size], className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-label="Loading"
    role="status"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path
      className="opacity-80"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const FullPageSpinner: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)] z-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-sm text-[var(--text-muted)] animate-pulse">Loading…</p>
    </div>
  </div>
);
