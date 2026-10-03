import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useDashboard, useTestHistory } from '../hooks/useDashboard';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/userService';
import { formatDuration, getRelativeTime } from '../lib/utils';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboard();
  const { tests, isLoading: testsLoading } = useTestHistory(1, 10);
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({ username });
      toast.success('Profile updated!');
      setEditing(false);
      window.location.reload();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent text-3xl font-bold">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="flex items-center gap-3">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={handleSave} isLoading={saving} size="sm">Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setUsername(user?.username || ''); }}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-text-primary">{user?.username}</h1>
                    <button onClick={() => setEditing(true)} className="text-text-muted hover:text-accent transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-text-secondary text-sm">{user?.email}</p>
                  <p className="text-text-muted text-xs mt-1">
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'} • 
                    via {user?.provider || 'email'}
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold text-accent font-mono">{stats?.highestWpm || 0}</div>
            <div className="text-xs text-text-muted mt-1">Best WPM</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-text-primary font-mono">{stats?.averageWpm || 0}</div>
            <div className="text-xs text-text-muted mt-1">Avg WPM</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-text-primary font-mono">{stats?.testsCompleted || 0}</div>
            <div className="text-xs text-text-muted mt-1">Tests</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-text-primary font-mono">{formatDuration(stats?.totalTypingTime || 0)}</div>
            <div className="text-xs text-text-muted mt-1">Time Typed</div>
          </Card>
        </div>

        {/* Test History */}
        <Card>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Test History</h2>
          {testsLoading ? (
            <Spinner />
          ) : tests.length > 0 ? (
            <div className="space-y-2">
              {tests.map((test) => (
                <div key={test._id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-bg-tertiary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted w-16">{test.mode}</span>
                    <span className="text-lg font-bold font-mono text-accent">{test.netWpm} wpm</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span>{test.accuracy}%</span>
                    <span>{getRelativeTime(test.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-muted py-8">No tests yet</p>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
