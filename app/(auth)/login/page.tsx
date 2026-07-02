"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { hasSupabaseClientEnv } from '@/lib/config/env';

export default function LoginPage() {
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
      setError('Supabase is not configured.');
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
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex-center">
      <div className="card" style={{ width: 400 }}>
        <h1 className="title">Login</h1>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
          />
          <button disabled={loading} type="submit" style={{ padding: '0.5rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '2rem' }}>
          <a href="/signup">→ Go to Signup</a>
        </div>
      </div>
    </div>
  );
}