import React from 'react';
import { SiteHeader } from './header';
import { SiteFooter } from './footer';

interface SiteShellProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SiteShell({ children, className = '', style }: SiteShellProps) {
  return (
    <div className="site-shell" style={style}>
      <SiteHeader />
      <main className={className}>{children}</main>
      <SiteFooter />
    </div>
  );
}
