import Link from 'next/link';

import { DocsShell } from '@/components/docs/docs-shell';
import { docsPages } from '@/lib/docs/content';

export const metadata = { title: 'Documentation' };

export default function DocsIndexPage() {
  return (
    <DocsShell>
      <article className="docs-article">
        <header><p className="eyebrow">System documentation</p><h1>Tessarion, from source material to the next learning action.</h1><p className="lead">These pages describe data ownership, retrieval, graph reasoning, workflow state, learner evidence, evaluation, observability, and current implementation status.</p></header>
        <div className="feature-grid">
          {docsPages.map((page) => (
            <Link className="card feature-card" href={`/docs/${page.slug}`} key={page.slug}>
              <p className="eyebrow">{page.group} · {page.status}</p>
              <h3 style={{ marginTop: '0.65rem' }}>{page.title}</h3>
              <p>{page.summary}</p>
            </Link>
          ))}
        </div>
      </article>
    </DocsShell>
  );
}
