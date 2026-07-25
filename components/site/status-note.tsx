import React from 'react';

export function StatusNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: 'var(--cream)',
      border: '1px solid var(--ink)',
      borderRadius: '4px',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <div style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}
