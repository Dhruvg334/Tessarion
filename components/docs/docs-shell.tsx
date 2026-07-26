import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteShell } from '@/components/site/site-shell';
import { docsPages } from '@/lib/docs/content';

const topLinks = [
  ['Overview', '/docs/overview'],
  ['Architecture', '/docs/architecture'],
  ['Learning system', '/docs/learning-system'],
  ['Quality', '/docs/quality-and-operations'],
  ['Security & status', '/docs/security-and-status'],
] as const;

export function DocsShell({ currentSlug, children }: { currentSlug?: string; children: ReactNode }) {
  return (
    <SiteShell>
      <div className="docs-topbar">
        <nav className="container docs-topbar-inner" aria-label="Documentation sections">
          {topLinks.map(([label, href]) => (
            <Link href={href} key={href} aria-current={href.endsWith(currentSlug ?? '__none__') ? 'page' : undefined}>{label}</Link>
          ))}
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
