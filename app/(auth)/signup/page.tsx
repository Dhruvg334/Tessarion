"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { hasSupabaseClientEnv } from '@/lib/config/env';
import Link from 'next/link';
import { TesseractIcon } from '@/components/ui/tesseract-icon';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!hasSupabaseClientEnv()) {
      setError('Database connection not configured. Please set up your environment variables.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user && !data.session) {
      setSuccess('Check your email for the confirmation link.');
    } else {
      router.push('/dashboard');
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
        <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Start learning deeply.</h2>
        <p className="muted" style={{ fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '400px' }}>
          Tessarion builds a personal knowledge graph as you learn, identifying gaps and testing your understanding.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--muted)' }}>
          <li>✓ Source-grounded feedback</li>
          <li>✓ Socratic teach-back loops</li>
          <li>✓ Visual concept maps</li>
        </ul>
      </div>

      {/* Right: Form */}
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Create an account</h2>
          
          {!hasSupabaseClientEnv() && (
            <div style={{ padding: '1rem', border: '2px solid var(--ink)', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Setup Required:</strong> Supabase environment variables are missing. Auth is disabled in this local environment.
            </div>
          )}

          {error && <p style={{ borderLeft: '4px solid var(--ink)', paddingLeft: '0.75rem', fontWeight: 500, marginBottom: '1rem', fontSize: '0.875rem' }}>Error: {error}</p>}
          {success && <p style={{ borderLeft: '4px solid var(--line-strong)', paddingLeft: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</p>}
          
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
              {loading ? 'Authenticating...' : 'Sign Up'}
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            <p className="muted">
              Already have an account? <Link href="/login" style={{ fontWeight: 500, color: 'var(--ink)' }}>Log in</Link>
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