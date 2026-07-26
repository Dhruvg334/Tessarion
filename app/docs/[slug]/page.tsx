import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DocsShell } from '@/components/docs/docs-shell';
import { docsPageBySlug, docsPages } from '@/lib/docs/content';

export function generateStaticParams() {
  return docsPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = docsPageBySlug.get(slug);
  return page ? { title: page.title, description: page.summary } : {};
}

export default async function DocsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = docsPageBySlug.get(slug);
  if (!page) notFound();
  const index = docsPages.findIndex((item) => item.slug === page.slug);
  const previous = index > 0 ? docsPages[index - 1] : undefined;
  const next = index < docsPages.length - 1 ? docsPages[index + 1] : undefined;

  return (
    <DocsShell currentSlug={page.slug}>
      <article className="docs-article prose">
        <header><p className="eyebrow">{page.group} · {page.status}</p><h1>{page.title}</h1><p className="lead">{page.summary}</p></header>
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            {section.steps && <div className="docs-steps">{section.steps.map((step, stepIndex) => <div className="docs-step" key={step}><span className="docs-step-index">{stepIndex + 1}</span><p>{step}</p></div>)}</div>}
            {section.note && <div className="docs-block"><strong>Boundary:</strong> {section.note}</div>}
          </section>
        ))}
        <nav className="docs-pagination" aria-label="Documentation pagination">
          <span>{previous ? <Link href={`/docs/${previous.slug}`}>← {previous.title}</Link> : null}</span>
          <span>{next ? <Link href={`/docs/${next.slug}`}>{next.title} →</Link> : null}</span>
        </nav>
      </article>
    </DocsShell>
  );
}
