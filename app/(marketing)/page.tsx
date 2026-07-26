import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';

const loop = [
  ['01', 'Add material', 'Bring in the source you are actually studying.'],
  ['02', 'Map concepts', 'Extract concepts, evidence, and prerequisite relationships.'],
  ['03', 'Teach it back', 'Explain one concept without reading from the source.'],
  ['04', 'Diagnose gaps', 'Compare the explanation with evidence and concept dependencies.'],
  ['05', 'Recover and review', 'Use guided tutoring, then return for another teach-back.'],
];

export default function MarketingPage() {
  return (
    <SiteShell>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <h1 id="hero-title" className="hero-wordmark">Tessarion</h1>
          <div className="hero-actions">
            <Link href="/signup" className="btn">Open a workspace</Link>
            <Link href="/docs" className="btn btn-secondary">Read the system design</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">The learning loop</p>
            <h2>Understanding is tested through explanation, not passive exposure.</h2>
            <p>Tessarion links every diagnosis to source evidence, concept relationships, and a recorded learning state.</p>
          </div>
          <div className="flow-list">
            {loop.map(([index, title, copy]) => (
              <article className="card flow-item" key={index}>
                <span className="flow-index">{index}</span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Engineering boundaries</p>
            <h2>A learning decision is useful only when its evidence and route can be inspected.</h2>
          </div>
          <div className="feature-grid">
            <article className="card feature-card"><h3>Evidence-linked retrieval</h3><p>Dense, sparse, and graph-derived candidates are bounded, filtered by workspace, and retained with source references.</p></article>
            <article className="card feature-card"><h3>Stateful workflows</h3><p>Diagnosis and tutoring follow explicit transitions, checkpoints, retries, and deterministic fallbacks.</p></article>
            <article className="card feature-card"><h3>Measured behaviour</h3><p>Regression datasets cover retrieval, graph traversal, diagnosis, mastery, review, tutoring, and workflow reliability.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Current status</p>
            <h2>The core learning and evaluation foundations are implemented; infrastructure projections remain replaceable.</h2>
            <p>Postgres remains canonical. Vector, graph, workflow, and trace layers are treated as bounded, observable projections rather than competing sources of truth.</p>
          </div>
          <Link href="/docs/current-status" className="btn btn-secondary">Review implementation status</Link>
        </div>
      </section>
    </SiteShell>
  );
}
