"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { hasSupabaseClientEnv } from '@/lib/config/env';
import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!hasSupabaseClientEnv()) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart Next.js.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (error) {
        setError(error.message);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError('Could not reach Supabase Auth. Check that Supabase is running, .env.local points to the correct local API URL, and the dev server was restarted after editing env variables.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Link href="/" className="auth-logo brand-link">
        <TesseractIcon size={24} />
        <span className="handwritten" style={{ fontSize: '1.5rem' }}>Tessarion</span>
      </Link>

      <div className="auth-brand-panel">
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>Return to the notebook</p>
        <h2 className="title">Welcome back.</h2>
        <p className="subtitle" style={{ maxWidth: '420px' }}>
          Continue teaching concepts back, refining weak links, and building a graph that reflects what you actually understand.
        </p>
        <ul className="auth-list" style={{ marginTop: '2rem' }}>
          <li>— Private, isolated workspaces</li>
          <li>— Source-grounded learning history</li>
          <li>— Feedback built from your material</li>
        </ul>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 style={{ fontSize: '1.85rem', fontWeight: 650, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Log in</h2>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>Open your Tessarion notebooks.</p>

          {!hasSupabaseClientEnv() && (
            <div className="notice" style={{ marginBottom: '1.5rem' }}>
              <strong>Setup required:</strong> Supabase environment variables are missing. Auth is disabled in this local environment.
            </div>
          )}

          {error && <p className="notice" style={{ marginBottom: '1rem' }}><strong>Error:</strong> {error}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="btn" disabled={loading} type="submit" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Authenticating...' : 'Log in'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            <p className="muted">Don&apos;t have an account? <Link href="/signup" style={{ fontWeight: 700 }}>Sign up</Link></p>
            <p className="muted">Just looking around? <Link href="/demo" style={{ fontWeight: 700 }}>Try the demo</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
