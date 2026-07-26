"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { hasSupabaseClientEnv } from '@/lib/config/env';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

function safeNextPath(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      const payload = await response.json().catch(() => ({ error: 'Authentication returned an unreadable response.' })) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Authentication failed.');
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
            <label><span className="eyebrow" style={{ display: 'block', marginBottom: '0.35rem' }}>Password</span><input type="password" autoComplete="current-password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="btn" disabled={loading} type="submit">{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="muted" style={{ margin: '1.2rem 0 0', textAlign: 'center' }}>No account? <Link href="/signup" style={{ fontWeight: 750 }}>Create one</Link></p>
        </div>
      </section>
    </div>
  );
}
