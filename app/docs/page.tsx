import Link from 'next/link';

import { DocsShell } from '@/components/docs/docs-shell';
import { docsPages } from '@/lib/docs/content';

export const metadata = { title: 'Documentation' };

export default function DocsIndexPage() {
  return (
    <DocsShell>
      <article className="docs-article docs-index">
        <header>
          <p className="eyebrow">System documentation</p>
          <h1>Five substantial guides to the complete Tessarion system.</h1>
          <p className="lead">The documentation is consolidated around the questions that matter: what the product does, how the system is built, how learning decisions are made, how quality is measured, and what is ready for deployment.</p>
        </header>
        <div className="docs-index-list">
          {docsPages.map((page, index) => (
            <Link className="docs-index-card" href={`/docs/${page.slug}`} key={page.slug}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p className="eyebrow">{page.group} · {page.status}</p>
                <h2>{page.title}</h2>
                <p>{page.summary}</p>
              </div>
              <strong aria-hidden="true">→</strong>
            </Link>
          ))}
        </div>
      </article>
    </DocsShell>
  );
}
