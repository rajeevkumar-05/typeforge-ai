import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { LEADERBOARD_PERIODS } from '../lib/constants';
import type { LeaderboardPeriod } from '../types/leaderboard';
import { cn } from '../lib/utils';

const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('alltime');
  const { entries, isLoading } = useLeaderboard(period);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Leaderboard</h1>
            <p className="text-text-secondary mt-1">Top typists ranked by WPM</p>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-2xl p-1.5">
            {LEADERBOARD_PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                  period === p.value
                    ? 'bg-accent text-[var(--bg-primary)]'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : entries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-text-muted border-b border-border text-sm">
                    <th className="text-left py-3 px-3 font-medium w-16">Rank</th>
                    <th className="text-left py-3 px-3 font-medium">User</th>
                    <th className="text-right py-3 px-3 font-medium">Best WPM</th>
                    <th className="text-right py-3 px-3 font-medium">Accuracy</th>
                    <th className="text-right py-3 px-3 font-medium">Tests</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        'border-b border-border/50 transition-colors',
                        index < 3 ? 'hover:bg-accent/5' : 'hover:bg-bg-tertiary/50'
                      )}
                    >
                      <td className="py-4 px-3">
                        <span className={cn(
                          'text-lg font-bold',
                          index === 0 && 'text-yellow-500',
                          index === 1 && 'text-gray-400',
                          index === 2 && 'text-amber-600',
                          index > 2 && 'text-text-muted'
                        )}>
                          {getRankDisplay(entry.rank)}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                            {entry.avatar ? (
                              <img src={entry.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              entry.username?.[0]?.toUpperCase()
                            )}
                          </div>
                          <span className="font-medium text-text-primary">{entry.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className={cn(
                          'text-lg font-bold font-mono',
                          index < 3 ? 'text-accent' : 'text-text-primary'
                        )}>
                          {entry.bestWpm}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right font-mono text-text-secondary">
                        {entry.accuracy}%
                      </td>
                      <td className="py-4 px-3 text-right text-text-muted">
                        {entry.testsCompleted}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-text-muted py-20">
              <span className="text-4xl block mb-4">🏆</span>
              <p className="text-lg">No entries yet for this period</p>
              <p className="text-sm mt-1">Be the first to set a record!</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
