import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  value: string;
  options: (string | SelectOption)[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  compact?: boolean;
  'aria-label'?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  icon,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  compact = false,
  'aria-label': ariaLabel = 'Select option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  // Normalize options array into uniform SelectOption structure
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update highlighted index when menu opens
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, normalizedOptions]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
            handleSelect(normalizedOptions[highlightedIndex].value);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        // Type-ahead jump to matching option
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const char = e.key.toLowerCase();
          const matchIndex = normalizedOptions.findIndex((opt) =>
            opt.label.toLowerCase().startsWith(char)
          );
          if (matchIndex >= 0) {
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(matchIndex);
          }
        }
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${compact ? 'min-w-[70px]' : 'min-w-[130px]'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] ${
          compact
            ? 'h-[38px] px-2.5 text-xs font-medium'
            : 'h-[40px] px-3 text-sm font-medium'
        } ${
          isOpen
            ? 'bg-[rgba(124,58,237,0.12)] border-[rgba(124,58,237,0.6)] text-white shadow-[0_0_12px_rgba(124,58,237,0.25)]'
            : 'bg-[rgba(0,0,0,0.25)] border-[rgba(255,255,255,0.06)] text-[#e5eafa] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.15)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="flex-none text-[#7c3aed]">{icon}</span>}
          {selectedOption.icon && <span className="flex-none">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption.label}</span>
        </div>

        {/* Animated Chevron */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="w-4 h-4 flex-none text-[#6a7698]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </motion.svg>
      </button>

      {/* Floating Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 top-[calc(100%+6px)] z-50 min-w-full ${
              compact ? 'w-[100px]' : 'w-max min-w-[160px] max-w-[280px]'
            } p-1.5 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,28,0.96)] shadow-[0_16px_36px_rgba(0,0,0,0.5),0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-xl outline-none`}
          >
            <div className="max-h-[240px] overflow-y-auto space-y-0.5 custom-select-scroll">
              {normalizedOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 select-none ${
                      isSelected
                        ? 'bg-[rgba(124,58,237,0.18)] text-white font-semibold'
                        : isHighlighted
                        ? 'bg-[rgba(255,255,255,0.06)] text-[#e5eafa]'
                        : 'text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="flex-none">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {/* Active Checkmark Indicator */}
                    {isSelected && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-3.5 h-3.5 text-[#a78bfa] flex-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
