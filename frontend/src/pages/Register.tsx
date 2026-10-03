import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';

const Icon = ({ children }: { children: React.ReactNode }) => <span className="auth-field-icon" aria-hidden="true">{children}</span>;

const Register: React.FC = () => {
  const [username, setUsername] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate(); const { register } = useAuth(); const toast = useToast();
  const validate = () => { const errs: Record<string, string> = {}; if (username.length < 3) errs.username = 'Username must be at least 3 characters'; if (!/^[a-zA-Z0-9_]+$/.test(username)) errs.username = 'Only letters, numbers, and underscores'; if (!email.includes('@')) errs.email = 'Please enter a valid email'; if (password.length < 6) errs.password = 'Password must be at least 6 characters'; if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'; setErrors(errs); return Object.keys(errs).length === 0; };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!validate()) return; setIsLoading(true); try { await register({ username, email, password }); toast.success('Account created successfully!'); navigate('/dashboard'); } catch (err: any) { console.error('Registration error:', err); const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed'; toast.error(message); } finally { setIsLoading(false); } };

  return <div className="auth-page"><Link to="/" className="auth-back"><span>←</span> Back to Home</Link><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-panel-wrap auth-register-wrap"><div className="auth-card">
    <div className="auth-heading"><h1>Create your account</h1><p>Start your typing journey today.</p></div>
    <div className="auth-socials">
      <a href={authService.getGoogleAuthUrl()} className="auth-social-button"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09A6.9 6.9 0 015.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A10.94 10.94 0 001 12c0 1.78.43 3.45 1.18 4.93z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>Continue with Google</a>
    </div>
    <div className="auth-divider"><span>or continue with email</span></div>
    <form onSubmit={handleSubmit} className="auth-form auth-register-form">
      <Input label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="typist_pro" icon={<Icon>♙</Icon>} error={errors.username} required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={<Icon>✉</Icon>} error={errors.email} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={<Icon>♟</Icon>} error={errors.password} required />
      <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" icon={<Icon>♟</Icon>} error={errors.confirmPassword} required />
      <Button type="submit" isLoading={isLoading} className="auth-submit">Create Account <span aria-hidden="true">→</span></Button>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </div></motion.div></div>;
};
export default Register;
