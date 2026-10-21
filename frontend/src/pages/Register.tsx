import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, TriangleAlert, UserRound } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';
import './Login.css';
import './Register.css';

type Field = 'username' | 'email' | 'password' | 'confirmPassword';
const fields: Field[] = ['username', 'email', 'password', 'confirmPassword'];
const labels = { username: 'Username', email: 'Email address', password: 'Password', confirmPassword: 'Confirm password' };

export default function Register() {
  const [values, setValues] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [visible, setVisible] = useState({ password: false, confirmPassword: false });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const submitting = useRef(false);
  const inputRefs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const reducedMotion = useReducedMotion();

  const errors: Record<Field, string> = {
    username: !/^[a-zA-Z0-9_]{3,30}$/.test(values.username.trim()) ? 'Use 3–30 letters, numbers, or underscores.' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) ? 'Enter a valid email address.' : '',
    password: Array.from(values.password).length < 6 ? 'Use at least 6 characters.' : '',
    confirmPassword: !values.confirmPassword ? 'Enter your password again.' : values.password !== values.confirmPassword ? 'Your passwords do not match.' : '',
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    setFormError('');
    const invalid = fields.find(field => errors[field]);
    if (invalid) { inputRefs.current[invalid]?.focus(); return; }
    submitting.current = true;
    setIsLoading(true);
    try {
      await register({ username: values.username.trim(), email: values.email.trim(), password: values.password });
      toast.success('Account created. Welcome to TypeForge!');
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = isAxiosError(error) ? error.response?.data?.message : '';
      setFormError(isAxiosError(error) && !error.response
        ? 'We could not reach the server. Check your connection and try again.'
        : isAxiosError(error) && error.response?.status === 429
          ? 'Too many attempts. Please wait a little before trying again.'
          : typeof message === 'string' && isAxiosError(error) && error.response?.status === 400
            ? message : 'We could not create your account. Please try again.');
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  }

  return (
    <main className="login-screen register-screen">
      <Link to="/typing" className="login-back"><ArrowLeft aria-hidden="true" /> Back to practice</Link>
      <motion.div className="login-shell register-shell" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
        <div className="login-brand-block">
          <Link to="/" className="login-brand" aria-label="TypeForge home"><span className="login-mark" aria-hidden="true">T</span><span>typeforge<span className="login-brand-dot">.</span></span></Link>
          <p>Practice smarter. <span className="login-typing-line">Type faster.</span></p>
        </div>
        <section className="login-card register-card" aria-labelledby="register-title">
          <header className="login-heading"><h1 id="register-title">Make every keystroke <span>count.</span></h1><p>Create your account and start your typing journey.</p></header>
          <a className="login-google" href={authService.getGoogleAuthUrl()} aria-disabled={isLoading} tabIndex={isLoading ? -1 : 0} onClick={event => { if (submitting.current) event.preventDefault(); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09A6.9 6.9 0 015.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A10.94 10.94 0 001 12c0 1.78.43 3.45 1.18 4.93z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>Continue with Google
          </a>
          <div className="login-divider"><span>or sign up with email</span></div>
          <form className="login-form register-form" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
            {formError && <div className="login-alert" role="alert"><TriangleAlert aria-hidden="true" /><span>{formError}</span></div>}
            <div className="register-fields">
              {fields.map(field => {
                const secret = field === 'password' || field === 'confirmPassword';
                const Icon = field === 'username' ? UserRound : field === 'email' ? Mail : LockKeyhole;
                const error = touched[field] ? errors[field] : '';
                const hint = field === 'username' ? '3–30 letters, numbers, or underscores.' : field === 'password' ? 'At least 6 characters.' : '';
                return <div className="login-field" key={field}>
                  <label htmlFor={'register-' + field}>{labels[field]}</label>
                  <div className={'login-input-wrap' + (error ? ' has-error' : '')}>
                    <Icon className="login-input-icon" aria-hidden="true" />
                    <input id={'register-' + field} name={field} ref={element => { inputRefs.current[field] = element; }} type={secret ? visible[field] ? 'text' : 'password' : field === 'email' ? 'email' : 'text'}
                      value={values[field]} placeholder={field === 'username' ? 'typist_pro' : field === 'email' ? 'you@example.com' : field === 'password' ? 'Create a password' : 'Repeat your password'}
                      autoComplete={secret ? 'new-password' : field} autoCapitalize="none" spellCheck={false} required disabled={isLoading}
                      aria-invalid={!!error} aria-describedby={error ? field + '-error' : hint ? field + '-hint' : undefined}
                      onChange={event => { setValues(current => ({ ...current, [field]: event.target.value })); setFormError(''); }}
                      onBlur={() => setTouched(current => ({ ...current, [field]: true }))} />
                    {secret ? <button className="login-password-toggle" type="button" disabled={isLoading} aria-label={(visible[field] ? 'Hide ' : 'Show ') + labels[field].toLowerCase()} aria-controls={'register-' + field} aria-pressed={visible[field]} onClick={() => setVisible(current => ({ ...current, [field]: !current[field] }))}>{visible[field] ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button>
                      : touched[field] && !errors[field] && <Check className="login-valid-icon" aria-hidden="true" />}
                  </div>
                  {error ? <p id={field + '-error'} className="login-field-error" aria-live="polite">{error}</p> : hint && <p id={field + '-hint'} className="register-hint">{hint}</p>}
                </div>;
              })}
            </div>
            <button className="login-submit" type="submit" disabled={isLoading}>{isLoading && <LoaderCircle className="login-loader" aria-hidden="true" />}<span>{isLoading ? 'Creating your account…' : 'Create account'}</span>{!isLoading && <ArrowRight className="login-submit-arrow" aria-hidden="true" />}</button>
            <p className="login-switch">Already have an account? <Link to="/login">Sign in <ArrowRight aria-hidden="true" /></Link></p>
          </form>
        </section>
        <p className="login-footer"><span className="login-footer-spark" aria-hidden="true">✦</span> Your next personal best starts here.</p>
      </motion.div>
    </main>
  );
}
