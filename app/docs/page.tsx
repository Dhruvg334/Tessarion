import Link from 'next/link';
import { ArrowRight, CircleCheck, TriangleAlert } from 'lucide-react';

import { DocsShell } from '@/components/docs/docs-shell';
import { docsPages } from '@/lib/docs/content';

export const metadata = { title: 'Documentation' };

export default function DocsIndexPage() {
  return (
    <DocsShell>
      <article className="docs-article docs-index">
        <header>
          <p className="eyebrow">System documentation</p>
          <h1>Tessarion from source ingestion to learning decisions.</h1>
          <p className="lead">These guides cover the product, architecture, agentic workflows, learning system, evaluation, security, and current status.</p>
        </header>

        <section className="docs-status-panel" aria-labelledby="docs-status-title">
          <div><p className="eyebrow">Current status</p><h2 id="docs-status-title">The complete learning loop is available; external services remain configurable.</h2></div>
          <div className="docs-status-points">
            <span><CircleCheck size={16} /> Product, learning workflows, evaluation, and deployment boundaries</span>
            <span><TriangleAlert size={16} /> Qdrant, Neo4j, background jobs, and trace collection need production credentials</span>
          </div>
          <Link href="/docs/current-status" className="text-link">Read status, limitations, and planned capabilities <ArrowRight size={15} /></Link>
        </section>

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
