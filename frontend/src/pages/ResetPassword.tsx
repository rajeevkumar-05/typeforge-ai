import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, CircleCheck, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, TriangleAlert } from 'lucide-react';
import { isAxiosError } from 'axios';
import { RecoveryLayout } from '../components/auth/RecoveryLayout';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState({ password: false, confirmation: false });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const tokenInvalid = !token || !/^[a-f0-9]{64}$/i.test(token);
  const passwordValid = Array.from(password).length >= 6 && new TextEncoder().encode(password).length <= 72;
  const passwordError = touched && !passwordValid
    ? Array.from(password).length < 6 ? 'Use at least 6 characters.' : 'This password is too long. Try a shorter one.'
    : '';
  const confirmationError = touched && (!confirmation || confirmation !== password) ? 'Both passwords must match.' : '';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    setTouched(true); setError('');
    if (!passwordValid) { passwordRef.current?.focus(); return; }
    if (!confirmation || confirmation !== password) { confirmationRef.current?.focus(); return; }
    if (tokenInvalid) return;
    submitting.current = true; setBusy(true);
    try {
      await authService.resetPassword(token, password);
      setPassword(''); setConfirmation(''); setSuccess(true);
    } catch (failure: unknown) {
      const status = isAxiosError(failure) ? failure.response?.status : undefined;
      if (status === 400 || status === 410) setExpired(true);
      else setError('We couldn’t update your password. Check your connection and try again.');
    } finally { submitting.current = false; setBusy(false); }
  };

  const invalid = tokenInvalid || expired;
  return <RecoveryLayout
    title={success ? 'Password updated' : invalid ? 'Let’s get a fresh link' : 'Set a new password'}
    description={success ? 'You’re ready to return to your next typing session.' : invalid ? 'This reset link is invalid, expired, or already used.' : 'Choose a password you haven’t used before.'}
    icon={success ? <CircleCheck /> : <KeyRound />}>
    {success ? <>
      <p className="recovery-message" role="status">Your new password is saved. Sign in with it to continue.</p>
      <Link className="login-submit" to="/login">Back to sign in <ArrowRight className="login-submit-arrow" aria-hidden="true" /></Link>
    </> : invalid ? <>
      <p className="recovery-message">Reset links work once and expire after one hour. Request a new link, then open the latest email.</p>
      <Link className="login-submit" to="/forgot-password">Request a new link <ArrowRight className="login-submit-arrow" aria-hidden="true" /></Link>
      <div className="recovery-links"><Link to="/login">Back to sign in</Link></div>
    </> : <>
      {error && <div className="login-alert" role="alert"><TriangleAlert aria-hidden="true" /><p>{error}</p></div>}
      <form className="login-form recovery-form" onSubmit={submit} noValidate aria-busy={busy}>
        <div className="login-field">
          <label htmlFor="new-password">New password</label>
          <div className={`login-input-wrap${passwordError ? ' has-error' : ''}`}>
            <LockKeyhole className="login-input-icon" aria-hidden="true" />
            <input ref={passwordRef} id="new-password" name="new-password" type={visible.password ? 'text' : 'password'}
              autoComplete="new-password" value={password} disabled={busy} required placeholder="Create a new password"
              onChange={event => setPassword(event.target.value)} aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'new-password-error' : 'password-requirements'} />
            <button className="login-password-toggle" type="button" disabled={busy} onClick={() => setVisible(p => ({ ...p, password: !p.password }))}
              aria-label={visible.password ? 'Hide new password' : 'Show new password'} aria-pressed={visible.password}>
              {visible.password ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
          {passwordError && <p className="login-field-error" id="new-password-error">{passwordError}</p>}
          <p className="recovery-hint" id="password-requirements">At least 6 characters. Longer, unique passwords are better.</p>
        </div>
        <div className="login-field">
          <label htmlFor="confirm-password">Confirm new password</label>
          <div className={`login-input-wrap${confirmationError ? ' has-error' : ''}`}>
            <LockKeyhole className="login-input-icon" aria-hidden="true" />
            <input ref={confirmationRef} id="confirm-password" name="confirm-password" type={visible.confirmation ? 'text' : 'password'}
              autoComplete="new-password" value={confirmation} disabled={busy} required placeholder="Enter it once more"
              onChange={event => setConfirmation(event.target.value)} aria-invalid={!!confirmationError}
              aria-describedby={confirmationError ? 'confirm-password-error' : undefined} />
            <button className="login-password-toggle" type="button" disabled={busy} onClick={() => setVisible(p => ({ ...p, confirmation: !p.confirmation }))}
              aria-label={visible.confirmation ? 'Hide confirmed password' : 'Show confirmed password'} aria-pressed={visible.confirmation}>
              {visible.confirmation ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
          {confirmationError && <p className="login-field-error" id="confirm-password-error">{confirmationError}</p>}
          {confirmation && confirmation === password && <ul className="recovery-checks"><li className="is-met"><Check aria-hidden="true" /> Passwords match</li></ul>}
        </div>
        <button className="login-submit" type="submit" disabled={busy}>
          {busy ? <><LoaderCircle className="login-loader" aria-hidden="true" />Updating password…</> : <>Save new password <ArrowRight className="login-submit-arrow" aria-hidden="true" /></>}
        </button>
        <p className="login-switch"><Link to="/login">Back to sign in</Link></p>
      </form>
    </>}
  </RecoveryLayout>;
}
