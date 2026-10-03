import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Reset Password</h1>
          <p className="text-text-secondary">
            {sent ? 'Check your email for a reset link' : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <span className="text-5xl block">📧</span>
              <p className="text-text-secondary">
                If an account with <strong className="text-text-primary">{email}</strong> exists, you'll receive a password reset link shortly.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="mt-4">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Button type="submit" isLoading={isLoading} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          <Link to="/login" className="text-accent hover:underline">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
