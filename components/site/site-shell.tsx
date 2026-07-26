import type { CSSProperties, ReactNode } from 'react';
import { SiteHeader } from './header';
import { SiteFooter } from './footer';

export function SiteShell({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className="site-root" style={style}>
      <SiteHeader />
      <main className={`site-main ${className}`.trim()}>{children}</main>
      <SiteFooter />
    </div>
  );
}
