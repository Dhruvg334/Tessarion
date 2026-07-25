'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard route error:', error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--error)', marginBottom: '1rem' }}>Could not load dashboard</h2>
      <p style={{ color: 'var(--ink-soft)', marginBottom: '2rem' }}>
        Tessarion could not connect to Supabase. Check your local Supabase service and environment variables.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={() => reset()} className="btn">Try again</button>
        <Link href="/" className="btn btn-secondary">Go to Home</Link>
      </div>
    </div>
  );
}
