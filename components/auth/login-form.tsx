"use client";

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock3 } from 'lucide-react';

import { hasSupabaseClientEnv } from '@/lib/config/env';
import { TesseractIcon } from '@/components/ui/tesseract-icon';
import { PasswordInput } from '@/components/ui/password-input';

function safeNextPath(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'confirmation_failed') setError('The confirmation link could not be completed. Request a new link or try signing in again.');
    if (reason === 'missing_confirmation_code') setError('The confirmation link is incomplete. Request a new confirmation email.');
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || cooldown > 0) return;
    setLoading(true);
    setError('');

    if (!hasSupabaseClientEnv()) {
      setError('Supabase is not configured. Add the public Supabase URL and anonymous key to .env.local, then restart the development server.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = await response.json().catch(() => ({ error: 'Authentication returned an unreadable response.' })) as { error?: string; retryAfterSeconds?: number };

      if (!response.ok) {
        setError(payload.error ?? 'Authentication failed.');
        if (response.status === 429) setCooldown(payload.retryAfterSeconds ?? 60);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('The application could not reach its authentication endpoint. Check that the development server is still running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Link href="/" className="auth-logo brand-link"><TesseractIcon size={23} /><span className="brand-word">Tessarion</span></Link>
      <section className="auth-brand-panel" aria-labelledby="login-context">
        <p className="eyebrow">Continue learning</p>
        <h1 id="login-context" className="title" style={{ marginTop: '0.7rem' }}>Return to your evidence, explanations, and review queue.</h1>
        <ul className="auth-list"><li>Source-grounded learning history</li><li>Recorded diagnosis and mastery evidence</li><li>Resumable tutoring and review state</li></ul>
      </section>
      <section className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 style={{ margin: 0, fontSize: '1.45rem' }}>Sign in</h2>
          <p className="muted" style={{ margin: '0.35rem 0 1.3rem' }}>Open your Tessarion workspace.</p>
          {!hasSupabaseClientEnv() && <div className="notice" style={{ marginBottom: '1rem' }}>Authentication is unavailable until Supabase is configured.</div>}
          {error && <p className="notice" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
            <label><span className="eyebrow" style={{ display: 'block', marginBottom: '0.35rem' }}>Email</span><input type="email" autoComplete="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label><span className="eyebrow" style={{ display: 'block', marginBottom: '0.35rem' }}>Password</span><PasswordInput autoComplete="current-password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="btn" disabled={loading || cooldown > 0} type="submit">{cooldown > 0 ? <><Clock3 size={15} /> Try again in {cooldown}s</> : loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="muted" style={{ margin: '1.2rem 0 0', textAlign: 'center' }}>No account? <Link href="/signup" style={{ fontWeight: 750 }}>Create one</Link></p>
        </div>
      </section>
    </div>
  );
}
