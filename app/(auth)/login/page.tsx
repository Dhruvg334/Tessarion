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
      setError('Database connection not configured. Please set up your environment variables.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push(nextPath);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink)' }}>
          <TesseractIcon size={24} />
          <span className="handwritten" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Tessarion</span>
        </Link>
      </div>

      {/* Left: Context */}
      <div className="auth-brand-panel">
        <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Welcome back.</h2>
        <p className="muted" style={{ fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '400px' }}>
          Continue building your personal knowledge graph.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--muted)' }}>
          <li>✓ Private, isolated workspaces</li>
          <li>✓ Source-grounded learning history</li>
          <li>✓ Mastery tracking over time</li>
        </ul>
      </div>

      {/* Right: Form */}
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Log In</h2>
          
          {!hasSupabaseClientEnv() && (
            <div style={{ padding: '1rem', border: '2px solid var(--ink)', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Setup Required:</strong> Supabase environment variables are missing. Auth is disabled in this local environment.
            </div>
          )}

          {error && <p style={{ borderLeft: '4px solid var(--ink)', paddingLeft: '0.75rem', fontWeight: 500, marginBottom: '1rem', fontSize: '0.875rem' }}>Error: {error}</p>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn" disabled={loading} type="submit" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Authenticating...' : 'Log In'}
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            <p className="muted">
              Don&apos;t have an account? <Link href="/signup" style={{ fontWeight: 500, color: 'var(--ink)' }}>Sign up</Link>
            </p>
            <p className="muted">
              Just looking around? <Link href="/demo" style={{ fontWeight: 500, color: 'var(--ink)' }}>Try the demo</Link>
            </p>
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