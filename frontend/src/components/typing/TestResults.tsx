import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { testService } from '../../services/testService';
import { formatTime } from '../../lib/utils';
import type { TestMode } from '../../types/test';

interface TestResultsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mistakes: number;
  correctChars: number;
  totalTyped: number;
  timeElapsed: number;
  wpmHistory: number[];
  mode: TestMode;
  onRestart: () => void;
  autoSave?: boolean;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export const TestResults: React.FC<TestResultsProps> = ({
  wpm, rawWpm, accuracy, mistakes, correctChars,
  totalTyped, timeElapsed, wpmHistory, mode, onRestart, autoSave = true,
}) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = React.useState(false);
  const [saved,  setSaved]  = React.useState(false);

  const chartData = wpmHistory.map((w, i) => ({ s: i + 1, wpm: w }));
  const avgWpm = wpmHistory.length
    ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
    : wpm;

  const handleSave = async () => {
    if (!isAuthenticated) { toast.info('Login to save your results'); return; }
    if (saved) return;
    setSaving(true);
    try {
      await testService.saveTest({
        duration: Math.max(1, Math.round(timeElapsed)),
        wordsTyped: Math.round(correctChars / 5),
        charactersTyped: totalTyped,
        mistakes,
        rawWpm,
        netWpm: wpm,
        accuracy,
        language: 'english',
        mode,
        wpmHistory,
      });
      setSaved(true);
      toast.success('Result saved!');
    } catch {
      toast.error('Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (autoSave && isAuthenticated && !saved && wpm > 0) handleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grade =
    wpm >= 120 ? { label: 'Legendary', color: '#FACC15' }
    : wpm >= 90 ? { label: 'Expert',    color: '#60A5FA' }
    : wpm >= 60 ? { label: 'Advanced',  color: '#22C55E' }
    : wpm >= 40 ? { label: 'Proficient',color: '#F97316' }
    :             { label: 'Beginner',  color: '#A78BFA' };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-5"
    >
      {/* ── Header badge ── */}
      <motion.div variants={fadeUp} className="text-center">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border"
          style={{ color: grade.color, borderColor: grade.color + '40', background: grade.color + '12' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: grade.color }} />
          {grade.label} Typist
        </span>
      </motion.div>

      {/* ── Main stats ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'WPM',      value: wpm,                  accent: true,  big: true },
          { label: 'Accuracy', value: `${accuracy}%`,       accent: false, big: true },
          { label: 'Raw WPM',  value: rawWpm,               accent: false, big: false },
          { label: 'Time',     value: formatTime(timeElapsed), accent: false, big: false },
        ].map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-accent/30 transition-all"
          >
            <span
              className="font-mono font-bold tabular-nums leading-none"
              style={{ fontSize: s.big ? '2.5rem' : '1.75rem', color: s.accent ? 'var(--accent-color)' : 'var(--text-primary)' }}
            >
              {s.value}
            </span>
            <span className="text-xs text-[var(--text-muted)] mt-1.5 uppercase tracking-widest font-semibold">
              {s.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Detail row ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Correct',   value: correctChars, color: 'var(--color-success, #22C55E)' },
          { label: 'Mistakes',  value: mistakes,      color: mistakes > 0 ? 'var(--color-error, #EF4444)' : 'var(--text-secondary)' },
          { label: 'Total Chars', value: totalTyped, color: 'var(--text-secondary)' },
          { label: 'Mode',      value: mode,          color: '#60A5FA' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <span className="text-xl font-bold font-mono tabular-nums" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── WPM Chart ── */}
      {chartData.length > 1 && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-5">
            WPM over time
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="s"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickFormatter={(v) => `${v}s`}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                formatter={(value) => [`${Number(value ?? 0)} wpm`, 'WPM']}
                labelFormatter={(l) => `${l}s`}
              />
              <ReferenceLine
                y={avgWpm}
                stroke="rgba(250,204,21,0.3)"
                strokeDasharray="4 4"
                label={{ value: `avg ${avgWpm}`, fill: 'rgba(250,204,21,0.5)', fontSize: 10, position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--accent-color)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--accent-color)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                filter="url(#glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── Actions ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap pt-2">
        <Button onClick={onRestart} size="lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </Button>

        {!isAuthenticated && (
          <Button variant="secondary" size="lg" onClick={() => toast.info('Please login to save results')} disabled={saving}>
            Login to Save
          </Button>
        )}

        {isAuthenticated && saved && (
          <div className="flex items-center gap-1.5 text-sm text-success px-4 py-2 rounded-xl bg-success/10 border border-success/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved to profile
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
