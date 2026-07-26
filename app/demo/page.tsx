import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'Demo' };

export default function DemoPage() {
  return (
    <SiteShell>
      <header className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow">Guided evaluation</p>
          <h1 className="title">Test the same learning loop used by the application.</h1>
          <p className="subtitle">The demo path is a reproducible sequence, not a simulated dashboard. It uses a source, a concept, two contrasting explanations, and the resulting evidence trail.</p>
        </div>
      </header>
      <div className="container page-content">
        <div className="feature-grid">
          <article className="card feature-card"><h3>1. Create a workspace</h3><p>Use a focused topic so the concept and evidence boundaries remain clear.</p></article>
          <article className="card feature-card"><h3>2. Add the sample source</h3><p>Use the arrays and linked-lists passage documented in the testing guide.</p></article>
          <article className="card feature-card"><h3>3. Compare responses</h3><p>Submit one grounded explanation and one deliberate misconception.</p></article>
          <article className="card feature-card"><h3>4. Inspect the route</h3><p>Review detected gaps, evidence references, mastery recommendation, and next action.</p></article>
          <article className="card feature-card"><h3>5. Enter tutoring</h3><p>Confirm that the tutor asks one bounded question rather than giving the answer.</p></article>
          <article className="card feature-card"><h3>6. Return to teach-back</h3><p>Finish with another explanation; tutoring alone does not mark the concept understood.</p></article>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/demo/notebook" className="btn">Try demo notebook</Link>
          <Link href="/docs/teach-back" className="btn btn-secondary">Read the teach-back contract</Link>
        </div>
      </div>
    </SiteShell>
  );
}
