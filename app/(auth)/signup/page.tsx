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
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart Next.js.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });

      if (error) {
        setError(error.message);
      } else if (data.user && !data.session) {
        setSuccess('Check your email for the confirmation link. In local Supabase, open Inbucket and confirm the message.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
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
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>Begin the notebook</p>
        <h2 className="title">Start learning deeply.</h2>
        <p className="subtitle" style={{ maxWidth: '430px' }}>
          Build a personal concept graph from your material, then test understanding by explaining ideas in your own words.
        </p>
        <ul className="auth-list" style={{ marginTop: '2rem' }}>
          <li>— Source-grounded feedback</li>
          <li>— Socratic teach-back prompts</li>
          <li>— Visual concept maps</li>
        </ul>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 style={{ fontSize: '1.85rem', fontWeight: 650, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Create an account</h2>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>Make your first Tessarion notebook.</p>

          {!hasSupabaseClientEnv() && (
            <div className="notice" style={{ marginBottom: '1.5rem' }}>
              <strong>Setup required:</strong> Supabase environment variables are missing. Auth is disabled in this local environment.
            </div>
          )}

          {error && <p className="notice" style={{ marginBottom: '1rem' }}><strong>Error:</strong> {error}</p>}
          {success && <p className="notice" style={{ marginBottom: '1rem' }}>{success}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="btn" disabled={loading} type="submit" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Creating...' : 'Sign up'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            <p className="muted">Already have an account? <Link href="/login" style={{ fontWeight: 700 }}>Log in</Link></p>
            <p className="muted">Just looking around? <Link href="/demo" style={{ fontWeight: 700 }}>Try the demo</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
