import Link from 'next/link';
import { ArrowRight, CircleCheck, Network, ShieldCheck } from 'lucide-react';

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
          <p className="lead">These guides document the finished product, production architecture, learning workflows, evaluation system, security boundaries, and operating model.</p>
        </header>

        <section className="docs-status-panel" aria-labelledby="docs-status-title">
          <div><p className="eyebrow">Current status</p><h2 id="docs-status-title">Tessarion is production-ready across the complete learning loop.</h2></div>
          <div className="docs-status-points">
            <span><CircleCheck size={16} /> Source ingestion, learning workflows, tutoring, review, and evaluation are implemented</span>
            <span><Network size={16} /> Supabase, Qdrant, Neo4j, Inngest, and Arize AX are integrated</span>
            <span><ShieldCheck size={16} /> Workspace isolation, safe tracing, and production deployment controls are documented</span>
          </div>
          <Link href="/docs/current-status" className="text-link">Read production status and operating boundaries <ArrowRight size={15} /></Link>
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
