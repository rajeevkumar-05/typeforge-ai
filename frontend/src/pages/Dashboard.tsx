import React from 'react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import { formatDuration, getRelativeTime } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: 'Current WPM', value: stats?.currentWpm || 0, icon: '⚡', accent: true },
    { label: 'Average WPM', value: stats?.averageWpm || 0, icon: '📊' },
    { label: 'Highest WPM', value: stats?.highestWpm || 0, icon: '🏆' },
    { label: 'Accuracy', value: `${stats?.averageAccuracy || 0}%`, icon: '🎯' },
    { label: 'Current Streak', value: `${stats?.currentStreak || 0}d`, icon: '🔥' },
    { label: 'Tests Completed', value: stats?.testsCompleted || 0, icon: '✅' },
    { label: 'Typing Time', value: formatDuration(stats?.totalTypingTime || 0), icon: '⏱' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome back, <span className="text-accent">{user?.username}</span>
        </h1>
        <p className="text-text-secondary mt-1">Here's your typing performance overview</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8"
      >
        {statCards.map((stat) => (
          <Card key={stat.label} hover className={stat.accent ? 'border-accent/30' : ''}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold font-mono ${stat.accent ? 'text-accent' : 'text-text-primary'}`}>
              {stat.value}
            </div>
            <div className="text-xs text-text-muted mt-1">{stat.label}</div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Graph */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Performance Over Time
            </h3>
            {stats?.performanceData && stats.performanceData.length > 1 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.performanceData}>
                  <defs>
                    <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke="var(--accent-color)"
                    fill="url(#wpmGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-text-muted">
                Complete more tests to see your performance graph
              </div>
            )}
          </Card>
        </motion.div>

        {/* Typing Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Typing Activity Heatmap
            </h3>
            <TypingHeatmap data={stats?.heatmapData || []} />
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            Recent Activity
          </h3>
          {stats?.recentTests && stats.recentTests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="text-left py-3 px-2 font-medium">Mode</th>
                    <th className="text-right py-3 px-2 font-medium">WPM</th>
                    <th className="text-right py-3 px-2 font-medium">Raw</th>
                    <th className="text-right py-3 px-2 font-medium">Accuracy</th>
                    <th className="text-right py-3 px-2 font-medium">Mistakes</th>
                    <th className="text-right py-3 px-2 font-medium">Time</th>
                    <th className="text-right py-3 px-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTests.map((test) => (
                    <tr key={test._id} className="border-b border-border/50 hover:bg-bg-tertiary/50 transition-colors">
                      <td className="py-3 px-2 text-text-secondary">{test.mode}</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-accent">{test.netWpm}</td>
                      <td className="py-3 px-2 text-right font-mono text-text-secondary">{test.rawWpm}</td>
                      <td className="py-3 px-2 text-right font-mono text-text-primary">{test.accuracy}%</td>
                      <td className="py-3 px-2 text-right font-mono text-error">{test.mistakes}</td>
                      <td className="py-3 px-2 text-right text-text-muted">{test.duration}s</td>
                      <td className="py-3 px-2 text-right text-text-muted">{getRelativeTime(test.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-text-muted py-12">
              No tests completed yet. Start typing to see your activity!
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// Simple Heatmap Component
const TypingHeatmap: React.FC<{ data: { date: string; count: number }[] }> = ({ data }) => {
  const dataMap = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  const weeks = 20; // ~5 months
  const days: { date: string; count: number; dayOfWeek: number }[] = [];

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: dataMap.get(dateStr) || 0,
      dayOfWeek: d.getDay(),
    });
  }

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-bg-tertiary';
    if (count <= 2) return 'bg-accent/20';
    if (count <= 5) return 'bg-accent/40';
    if (count <= 10) return 'bg-accent/60';
    return 'bg-accent/80';
  };

  // Group into weeks
  const weekGroups: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekGroups.push(days.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-fit">
        {weekGroups.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors`}
                title={`${day.date}: ${day.count} tests`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-bg-tertiary" />
        <div className="w-3 h-3 rounded-sm bg-accent/20" />
        <div className="w-3 h-3 rounded-sm bg-accent/40" />
        <div className="w-3 h-3 rounded-sm bg-accent/60" />
        <div className="w-3 h-3 rounded-sm bg-accent/80" />
        <span>More</span>
      </div>
    </div>
  );
};

export default Dashboard;
