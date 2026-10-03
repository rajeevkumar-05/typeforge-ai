import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glow = false,
  gradient = false,
  onClick,
}) => {
  if (hover || onClick) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className={cn(
          'bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6',
          'transition-all duration-300 hover:border-accent/30',
          'hover:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(250,204,21,0.08)]',
          onClick && 'cursor-pointer',
          glow && 'glow-accent',
          gradient && 'gradient-border bg-transparent',
          className
        )}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6',
        'transition-all duration-300',
        glow && 'glow-accent',
        gradient && 'gradient-border bg-transparent',
        className
      )}
    >
      {children}
    </div>
  );
};
