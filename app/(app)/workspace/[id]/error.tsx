'use client';
import { useEffect } from 'react';

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Workspace route error:', error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--error)', marginBottom: '1rem' }}>Something went wrong!</h2>
      <p style={{ color: 'var(--ink-soft)', marginBottom: '2rem' }}>
        Tessarion could not connect to Supabase. Check your local Supabase service and environment variables.
      </p>
      <button
        onClick={() => reset()}
        className="btn"
      >
        Try again
      </button>
    </div>
  );
}
