import React from 'react';
import { SiteHeader } from './header';
import { SiteFooter } from './footer';

export function SiteShell({ children, className = '', style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column', ...style }}>
      <SiteHeader />
      <main className={className} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
