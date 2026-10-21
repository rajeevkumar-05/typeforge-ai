import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, TriangleAlert } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import './Login.css';

const rememberedEmailKey = 'typeforge_remembered_email';
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09A6.9 6.9 0 015.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A10.94 10.94 0 001 12c0 1.78.43 3.45 1.18 4.93z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

export default function Login() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => localStorage.getItem(rememberedEmailKey) || '');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(() => !!localStorage.getItem(rememberedEmailKey));
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(() => searchParams.has('error')
    ? 'Google sign-in could not be completed. Try again or use your email.' : '');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const reducedMotion = useReducedMotion();

  const emailError = touched.email && !validEmail(email) ? 'Enter a valid email address.' : '';
  const passwordError = touched.password && !password ? 'Enter your password to continue.' : '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setTouched({ email: true, password: true });
    setFormError('');
    if (!validEmail(email)) { emailRef.current?.focus(); return; }
    if (!password) { passwordRef.current?.focus(); return; }

    submittingRef.current = true;
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      if (rememberEmail) localStorage.setItem(rememberedEmailKey, email.trim());
      else localStorage.removeItem(rememberedEmailKey);
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      if (status === 401) {
        setFormError(typeof message === 'string' && /uses google login/i.test(message)
          ? 'This account uses Google. Choose “Continue with Google” above.'
          : 'That email and password don’t match. Try again or reset your password.');
      } else if (status === 429) {
        setFormError('Too many attempts. Please wait a little before trying again.');
      } else {
        setFormError('We couldn’t sign you in right now. Check your connection and try again.');
      }
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <Link className="login-back" to="/typing"><ArrowLeft aria-hidden="true" /> Back to practice</Link>
      <motion.div className="login-shell"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="login-brand-block">
          <Link className="login-brand" to="/" aria-label="TypeForge home"><span className="login-mark">T</span><span>typeforge<span className="login-brand-dot">.</span></span></Link>
          <p>Small sessions. <span className="login-typing-line">Steady progress.</span></p>
        </div>

        <section className="login-card" aria-labelledby="login-title">
          <header className="login-heading">
            <h1 id="login-title">Welcome back<span>.</span></h1>
            <p>Your next personal best starts here.</p>
          </header>

          <a className="login-google" href={authService.getGoogleAuthUrl()}
            aria-disabled={isLoading || undefined} onClick={event => { if (submittingRef.current) event.preventDefault(); }}>
            <GoogleIcon /><span>Continue with Google</span>
          </a>
          <div className="login-divider"><span>or sign in with email</span></div>

          <form className="login-form" noValidate onSubmit={handleSubmit} aria-busy={isLoading}>
            {formError && <div className="login-alert" role="alert"><TriangleAlert aria-hidden="true" /><p>{formError}</p></div>}
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <div className={`login-input-wrap${emailError ? ' has-error' : ''}`}>
                <Mail className="login-input-icon" aria-hidden="true" />
                <input ref={emailRef} id="login-email" name="email" type="email" autoComplete="email"
                  placeholder="you@example.com" value={email} disabled={isLoading} required
                  onChange={event => { setEmail(event.target.value); setFormError(''); }}
                  onBlur={() => setTouched(previous => ({ ...previous, email: true }))}
                  aria-invalid={!!emailError} aria-describedby={emailError ? 'login-email-error' : undefined} />
                {email && validEmail(email) && <Check className="login-valid-icon" aria-label="Valid email format" />}
              </div>
              {emailError && <p className="login-field-error" id="login-email-error">{emailError}</p>}
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className={`login-input-wrap${passwordError ? ' has-error' : ''}`}>
                <LockKeyhole className="login-input-icon" aria-hidden="true" />
                <input ref={passwordRef} id="login-password" name="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" placeholder="Enter your password" value={password}
                  disabled={isLoading} required onChange={event => { setPassword(event.target.value); setFormError(''); }}
                  onKeyDown={event => setCapsLock(event.getModifierState('CapsLock'))}
                  onKeyUp={event => setCapsLock(event.getModifierState('CapsLock'))}
                  onBlur={() => { setTouched(previous => ({ ...previous, password: true })); setCapsLock(false); }}
                  aria-invalid={!!passwordError}
                  aria-describedby={[passwordError ? 'login-password-error' : '', capsLock ? 'login-caps-lock' : ''].filter(Boolean).join(' ') || undefined} />
                <button className="login-password-toggle" type="button" disabled={isLoading}
                  onClick={() => setShowPassword(previous => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="login-password" aria-pressed={showPassword}>
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
              {passwordError && <p className="login-field-error" id="login-password-error">{passwordError}</p>}
              {capsLock && <p className="login-caps-lock" id="login-caps-lock" role="status">Caps Lock is on.</p>}
            </div>

            <div className="login-options">
              <label className="login-remember"><input type="checkbox" checked={rememberEmail} disabled={isLoading}
                onChange={event => {
                  setRememberEmail(event.target.checked);
                  if (!event.target.checked) localStorage.removeItem(rememberedEmailKey);
                }} /><span>Remember email</span></label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button className="login-submit" type="submit" disabled={isLoading}>
              {isLoading ? <><LoaderCircle className="login-loader" aria-hidden="true" /><span>Signing you in…</span></>
                : <><span>Sign in</span><ArrowRight className="login-submit-arrow" aria-hidden="true" /></>}
            </button>
            <p className="login-switch">New to TypeForge? <Link to="/register">Create an account <ArrowRight aria-hidden="true" /></Link></p>
          </form>
        </section>

        <footer className="login-footer"><span className="login-footer-spark" aria-hidden="true">✦</span> A little practice goes a long way.<Link to="/typing">Try a quick warm-up <ArrowRight aria-hidden="true" /></Link></footer>
      </motion.div>
    </div>
  );
}
