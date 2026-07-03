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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex-center">
      <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--foreground)' }}>
          <TesseractIcon size={24} />
          <span style={{ fontWeight: 600 }}>Tessarion</span>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', maxWidth: '1000px', width: '100%' }}>
        
        {/* Left: Context */}
        <div style={{ flex: 1, display: 'none', '@media (min-width: 768px)': { display: 'block' } } as React.CSSProperties}>
          <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Create your workspace</h2>
          <p className="muted" style={{ fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '400px' }}>
            Join Tessarion to start building your personal knowledge graph.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--muted)' }}>
            <li>✓ Private, isolated workspaces</li>
            <li>✓ Source-grounded learning history</li>
            <li>✓ Mastery tracking over time</li>
          </ul>
        </div>

        {/* Right: Form */}
        <div className="card" style={{ flex: 1, width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sign Up</h2>
          
          {!hasSupabaseClientEnv() && (
            <div style={{ padding: '1rem', background: '#fffbeb', color: '#b45309', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #fcd34d', fontSize: '0.875rem' }}>
              <strong>Setup Required:</strong> Supabase environment variables are missing. Auth is disabled in this local environment.
            </div>
          )}

          {error && <p style={{ color: '#b91c1c', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          
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
              Already have an account? <Link href="/login" style={{ fontWeight: 500 }}>Log in</Link>
            </p>
            <p className="muted">
              Just looking around? <Link href="/demo" style={{ fontWeight: 500 }}>Try the demo</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}