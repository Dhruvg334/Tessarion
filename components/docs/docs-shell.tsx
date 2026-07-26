import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteShell } from '@/components/site/site-shell';
import { docsPages } from '@/lib/docs/content';

export function DocsShell({ currentSlug, children }: { currentSlug?: string; children: ReactNode }) {
  return (
    <SiteShell>
      <div className="container-wide docs-layout docs-layout-single-nav">
        <aside className="docs-sidebar">
          <p className="eyebrow docs-sidebar-title">Documentation</p>
          <nav className="docs-nav" aria-label="Documentation pages">
            {docsPages.map((page) => (
              <Link key={page.slug} href={`/docs/${page.slug}`} aria-current={page.slug === currentSlug ? 'page' : undefined}>
                <span>{page.title}</span><small>{page.group}</small>
              </Link>
            ))}
          </nav>
        </aside>
        {children}
      </div>
    </SiteShell>
  );
}
