import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, KeyRound, LoaderCircle, Mail, MailCheck, TriangleAlert } from 'lucide-react';
import { isAxiosError } from 'axios';
import { RecoveryLayout } from '../components/auth/RecoveryLayout';
import { authService } from '../services/authService';

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [requestedEmail, setRequestedEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const deadline = useRef(0);
  const submitting = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const emailError = touched && !validEmail(email) ? 'Enter a valid email address.' : '';

  useEffect(() => {
    if (!remaining) return;
    const timer = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, [remaining > 0]);

  const requestLink = async (address: string) => {
    if (submitting.current || Date.now() < deadline.current) return;
    submitting.current = true;
    setBusy(true); setError('');
    try {
      await authService.forgotPassword(address);
      setRequestedEmail(address);
      deadline.current = Date.now() + 60000;
      setRemaining(60);
    } catch (failure: unknown) {
      const status = isAxiosError(failure) ? failure.response?.status : undefined;
      setError(status === 503
        ? 'Password-reset emails are temporarily unavailable. Please try again later. You can still use Google sign-in if that’s how you registered.'
        : status === 429 ? 'Please wait a little before requesting another reset link.'
        : 'We couldn’t request a reset link. Check your connection and try again.');
    } finally { submitting.current = false; setBusy(false); }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setTouched(true);
    if (!validEmail(email)) { emailRef.current?.focus(); return; }
    void requestLink(email.trim());
  };

  return <RecoveryLayout title={requestedEmail ? 'Check your inbox' : 'Forgot your password?'}
    description={requestedEmail ? 'Your reset-link request has been received.' : 'Enter your email and we’ll help you get back in.'}
    icon={requestedEmail ? <MailCheck /> : <KeyRound />}>
    {error && <div className="login-alert" role="alert"><TriangleAlert aria-hidden="true" /><p>{error}</p></div>}
    {requestedEmail ? <>
      <div className="recovery-message" role="status">
        <p>If this address has an email/password account, check its inbox:</p>
        <span className="recovery-email">{requestedEmail}</span>
        <p>Look in spam, too. Reset links expire after one hour.</p>
      </div>
      <button className="login-submit" type="button" disabled={busy || remaining > 0} onClick={() => void requestLink(requestedEmail)}>
        {busy && <LoaderCircle className="login-loader" aria-hidden="true" />}
        {busy ? 'Requesting link…' : remaining ? `Send again in ${remaining}s` : 'Send another reset link'}
      </button>
      <div className="recovery-links"><button type="button" disabled={busy} onClick={() => {
        setRequestedEmail(''); setError(''); setTouched(false);
        requestAnimationFrame(() => emailRef.current?.focus());
      }}>Use a different email</button><Link to="/login">Back to sign in</Link></div>
    </> : <form className="login-form recovery-form" onSubmit={submit} noValidate aria-busy={busy}>
      <div className="login-field">
        <label htmlFor="reset-email">Email address</label>
        <div className={`login-input-wrap${emailError ? ' has-error' : ''}`}>
          <Mail className="login-input-icon" aria-hidden="true" />
          <input ref={emailRef} id="reset-email" name="email" type="email" autoComplete="email" required
            placeholder="you@example.com" value={email} disabled={busy}
            onChange={event => { setEmail(event.target.value); setError(''); }} onBlur={() => setTouched(true)}
            aria-invalid={!!emailError} aria-describedby={emailError ? 'reset-email-error' : undefined} />
        </div>
        {emailError && <p className="login-field-error" id="reset-email-error">{emailError}</p>}
      </div>
      <button className="login-submit" type="submit" disabled={busy || remaining > 0}>
        {busy ? <><LoaderCircle className="login-loader" aria-hidden="true" />Requesting link…</>
          : <>{remaining ? `Try again in ${remaining}s` : 'Send reset link'}<ArrowRight className="login-submit-arrow" aria-hidden="true" /></>}
      </button>
      <p className="login-switch">Remember your password? <Link to="/login">Sign in</Link></p>
    </form>}
    <div className="recovery-google"><p>Registered with Google? You don’t need a TypeForge password.</p>
      <a href={authService.getGoogleAuthUrl()}>Continue with Google <ArrowRight aria-hidden="true" /></a>
    </div>
  </RecoveryLayout>;
}
