import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../hooks/useToast';
import { cn } from '../../lib/utils';

const icons = {
  success: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const styles = {
  success: { icon: 'bg-success/15 text-success', bar: 'bg-success' },
  error:   { icon: 'bg-error/15 text-error',   bar: 'bg-error' },
  info:    { icon: 'bg-[#60A5FA]/15 text-[#60A5FA]', bar: 'bg-[#60A5FA]' },
  warning: { icon: 'bg-warning/15 text-warning', bar: 'bg-warning' },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const style = styles[t.type as keyof typeof styles] ?? styles.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'pointer-events-auto relative flex items-start gap-3 p-4 pr-5 rounded-2xl overflow-hidden',
                'bg-[var(--bg-secondary)] border border-[var(--border-color)]',
                'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
                'min-w-[280px] max-w-[360px]'
              )}
            >
              {/* accent bar */}
              <div className={cn('absolute top-0 left-0 w-1 h-full rounded-l-2xl', style.bar)} />

              {/* icon */}
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', style.icon)}>
                {icons[t.type as keyof typeof icons] ?? icons.info}
              </div>

              {/* message */}
              <p className="flex-1 text-sm text-[var(--text-primary)] leading-snug pt-1">{t.message}</p>

              {/* close */}
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mt-0.5 cursor-pointer"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
