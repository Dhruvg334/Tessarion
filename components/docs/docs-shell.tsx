import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteShell } from '@/components/site/site-shell';
import { docsPages } from '@/lib/docs/content';

const topLinks = [
  ['Foundations', '/docs/architecture'],
  ['Learning system', '/docs/teach-back'],
  ['Operations', '/docs/evaluation'],
] as const;

export function DocsShell({ currentSlug, children }: { currentSlug?: string; children: ReactNode }) {
  return (
    <SiteShell>
      <div className="docs-topbar">
        <nav className="container docs-topbar-inner" aria-label="Documentation categories">
          {topLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          <Link href="/docs/current-status">Current status</Link>
        </nav>
      </div>
      <div className="container docs-layout">
        <aside className="docs-sidebar">
          <p className="eyebrow docs-sidebar-title">Documentation</p>
          <nav className="docs-nav" aria-label="Documentation pages">
            {docsPages.map((page) => (
              <Link key={page.slug} href={`/docs/${page.slug}`} aria-current={page.slug === currentSlug ? 'page' : undefined}>{page.title}</Link>
            ))}
          </nav>
        </aside>
        {children}
      </div>
    </SiteShell>
  );
}
