'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Clock3 } from 'lucide-react';

import { hasSupabaseClientEnv } from '@/lib/config/env';
import { TesseractIcon } from '@/components/ui/tesseract-icon';
import { PasswordInput } from '@/components/ui/password-input';

type SignupPayload = { error?: string; kind?: string; retryAfterSeconds?: number; confirmationRequired?: boolean; requestId?: string };

const blockedTestDomains = new Set(['test.com', 'example.com', 'example.org', 'example.net']);

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  const normalizedEmail = email.trim().toLowerCase();
  const emailDomain = normalizedEmail.split('@')[1] ?? '';
  const usesBlockedTestDomain = blockedTestDomains.has(emailDomain) || emailDomain.endsWith('.test') || emailDomain.endsWith('.example');
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail) && !usesBlockedTestDomain, [normalizedEmail, usesBlockedTestDomain]);
  const passwordValid = password.length >= 8;
  const formValid = emailValid && passwordValid && cooldown === 0 && !loading && hasSupabaseClientEnv();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid) {
      setError(usesBlockedTestDomain ? 'Use a real email inbox. Test and example domains are not accepted.' : !emailValid ? 'Enter a complete email address, including the domain.' : 'Use a password with at least eight characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const payload = await response.json().catch(() => ({ error: 'Signup returned an unreadable response.' })) as SignupPayload;

      if (!response.ok) {
        setError(payload.error ?? 'Account creation could not be completed.');
        if (response.status === 429) setCooldown(payload.retryAfterSeconds ?? 60);
        return;
      }

      if (payload.confirmationRequired) {
        setSuccess(`A confirmation link was sent to ${normalizedEmail}. Open it to finish creating the account.`);
      } else {
        router.replace('/dashboard');
        router.refresh();
      }
    } catch {
      setError('The signup endpoint could not be reached. Check the connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Link href="/" className="auth-logo brand-link"><TesseractIcon size={23} /><span className="brand-word">Tessarion</span></Link>
      <section className="auth-brand-panel" aria-labelledby="signup-context">
        <p className="eyebrow">Create a workspace</p>
        <h1 id="signup-context" className="title">Build a concept model from material you are actually studying.</h1>
        <ul className="auth-list"><li>Evidence-linked concept relationships</li><li>Teach-back diagnosis and review</li><li>Guided tutoring without premature answers</li></ul>
      </section>
      <section className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2>Create an account</h2>
          <p className="muted auth-card-intro">Start with one focused source and one concept.</p>
          {!hasSupabaseClientEnv() && <div className="notice auth-notice">Account creation is unavailable until Supabase is configured.</div>}
          {error && <p className="notice auth-notice" role="alert">{error}</p>}
          {success && <p className="notice auth-notice" role="status">{success}</p>}
          <form onSubmit={handleSubmit} className="auth-form-grid" noValidate>
            <label>
              <span className="eyebrow auth-field-label">Email</span>
              <input type="email" inputMode="email" autoComplete="email" className="input" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} aria-invalid={email.length > 0 && !emailValid} required />
              <small className={email.length > 0 && emailValid ? 'field-help is-valid' : 'field-help'}>{email.length > 0 && emailValid ? <><Check size={13} /> Email format looks complete</> : usesBlockedTestDomain ? 'Use a real inbox; test.com and example domains are rejected.' : 'Use an address you can receive email at.'}</small>
            </label>
            <label>
              <span className="eyebrow auth-field-label">Password</span>
              <PasswordInput autoComplete="new-password" minLength={8} className="input" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} aria-invalid={password.length > 0 && !passwordValid} required />
              <small className={passwordValid ? 'field-help is-valid' : 'field-help'}>{passwordValid ? <><Check size={13} /> Minimum length met</> : 'Use at least eight characters.'}</small>
            </label>
            <button className="btn" disabled={!formValid} type="submit">
              {cooldown > 0 ? <><Clock3 size={15} /> Try again in {cooldown}s</> : loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="muted auth-card-footer">Already registered? <Link href="/login">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
