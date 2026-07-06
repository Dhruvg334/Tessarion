import React from 'react';

interface LoadingStateProps {
  message?: string;
  type?: 'page' | 'panel' | 'button';
}

export function LoadingState({ message = 'Loading...', type = 'panel' }: LoadingStateProps) {
  if (type === 'button') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <span 
          aria-hidden="true" 
          style={{ 
            display: 'inline-block', 
            width: '12px', 
            height: '12px', 
            border: '2px solid currentColor', 
            borderRightColor: 'transparent', 
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite'
          }} 
        />
        <span aria-live="polite" className="sr-only">{message}</span>
        <span aria-hidden="true">{message}</span>
      </span>
    );
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: type === 'page' ? '20vh 2rem' : '4rem 2rem',
        color: 'var(--ink-soft)'
      }}
    >
      <div 
        aria-hidden="true"
        style={{ 
          width: '24px', 
          height: '24px', 
          border: '2px solid var(--ink)', 
          borderRightColor: 'transparent', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} 
      />
      <div aria-live="polite" style={{ fontWeight: 500 }}>
        {message}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div 
      aria-hidden="true"
      style={{ 
        border: '1px solid var(--line)', 
        borderRadius: '8px', 
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    >
      <div style={{ height: '1.25rem', width: '40%', backgroundColor: 'var(--line-strong)', borderRadius: '4px' }} />
      <div style={{ height: '0.875rem', width: '100%', backgroundColor: 'var(--line)', borderRadius: '4px' }} />
      <div style={{ height: '0.875rem', width: '80%', backgroundColor: 'var(--line)', borderRadius: '4px' }} />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />
    </div>
  );
}
