import React from 'react';

export function Prose({ children, className = '', style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`prose ${className}`} style={{
      maxWidth: '65ch',
      margin: '0 auto',
      color: 'var(--ink)',
      lineHeight: 1.65,
      fontSize: '1.05rem',
      ...style
    }}>
      {children}
    </div>
  );
}
