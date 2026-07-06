import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        border: '1px dashed var(--line-strong)',
        borderRadius: '8px',
        backgroundColor: 'var(--paper)',
        margin: '2rem 0'
      }}
    >
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.75rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--ink-soft)', maxWidth: '28rem', marginBottom: action ? '2rem' : 0, lineHeight: 1.6 }}>
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
