"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { hasSupabaseClientEnv } from '@/lib/config/env';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!hasSupabaseClientEnv()) {
      setError('Supabase is not configured. Add the public Supabase URL and anonymous key to .env.local, then restart the development server.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = await response.json().catch(() => ({ error: 'Signup returned an unreadable response.' })) as { error?: string; confirmationRequired?: boolean };

      if (!response.ok) {
        setError(payload.error ?? 'Account creation failed.');
        return;
      }

      if (payload.confirmationRequired) {
        setSuccess('Check your email for the confirmation link. Local Supabase messages are available in Inbucket.');
      } else {
        router.replace('/dashboard');
        router.refresh();
      }
    } catch {
      setError('The application could not reach its signup endpoint. Check that the development server is still running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Link href="/" className="auth-logo brand-link"><TesseractIcon size={23} /><span className="brand-word">Tessarion</span></Link>
      <section className="auth-brand-panel" aria-labelledby="signup-context">
        <p className="eyebrow">Create a workspace</p>
        <h1 id="signup-context" className="title" style={{ marginTop: '0.7rem' }}>Build a concept model from material you are actually studying.</h1>
        <ul className="auth-list"><li>Evidence-linked concept relationships</li><li>Teach-back diagnosis and review</li><li>Guided tutoring without premature answers</li></ul>
      </section>
      <section className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 style={{ margin: 0, fontSize: '1.45rem' }}>Create an account</h2>
          <p className="muted" style={{ margin: '0.35rem 0 1.3rem' }}>Start with one focused source and one concept.</p>
          {!hasSupabaseClientEnv() && <div className="notice" style={{ marginBottom: '1rem' }}>Account creation is unavailable until Supabase is configured.</div>}
          {error && <p className="notice" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>}
          {success && <p className="notice" role="status" style={{ marginBottom: '1rem' }}>{success}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
            <label><span className="eyebrow" style={{ display: 'block', marginBottom: '0.35rem' }}>Email</span><input type="email" autoComplete="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label><span className="eyebrow" style={{ display: 'block', marginBottom: '0.35rem' }}>Password</span><input type="password" autoComplete="new-password" minLength={8} className="input" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="btn" disabled={loading} type="submit">{loading ? 'Creating account…' : 'Create account'}</button>
          </form>
          <p className="muted" style={{ margin: '1.2rem 0 0', textAlign: 'center' }}>Already registered? <Link href="/login" style={{ fontWeight: 750 }}>Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
