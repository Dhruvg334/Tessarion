import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function ErrorState({ title = 'An Error Occurred', message = 'Something went wrong while processing your request.', action }: ErrorStateProps) {
  return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--ink)', backgroundColor: 'var(--paper)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.75rem' }}>{title}</h3>
      <p className="muted" style={{ marginBottom: action ? '1.5rem' : 0 }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
