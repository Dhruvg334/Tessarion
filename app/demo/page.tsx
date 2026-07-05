import Link from 'next/link';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';

export default function DemoPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SiteHeader />
      <main className="container-wide" style={{ flex: 1, paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <span className="eyebrow" style={{ display: 'inline-block', border: '1px solid var(--line-strong)', padding: '0.35rem 0.75rem', borderRadius: 999, marginBottom: '1rem' }}>
            Static preview
          </span>
          <h1 className="title">Demo workspace</h1>
          <p className="subtitle" style={{ margin: '0 auto' }}>A non-authenticated preview of the source → graph → teach-back loop.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 650, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Source documents
              </h2>
              <div style={{ padding: '1rem', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                <p style={{ fontWeight: 650 }}>Cellular Respiration — Chapter 9</p>
                <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>12 pages • 84 chunks</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--muted)', fontStyle: 'italic', paddingLeft: '1rem', borderLeft: '3px solid var(--line-strong)' }}>
                  &quot;Glycolysis occurs in the cytosol and begins the degradation process by breaking glucose into two molecules of pyruvate...&quot;
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 650, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Concept graph preview
              </h2>
              <div style={{ minHeight: '220px', display: 'grid', placeItems: 'center', background: 'var(--paper)', borderRadius: '16px', border: '1px dashed var(--line-strong)', color: 'var(--muted)', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: 360 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><span className="arch-node">Glucose</span><span className="arch-node">ATP</span></div>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }} className="annotation">leads into</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><span className="arch-node">Glycolysis</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 650, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              Teach-back session
            </h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 650, marginBottom: '0.5rem' }}>Concept: Glycolysis</p>
              <p className="muted">Explain the role of ATP investment in the early stages of glycolysis.</p>
            </div>

            <div style={{ padding: '1.1rem', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <p className="annotation">
                The cell spends ATP first to phosphorylate glucose, making it unstable so it can break apart later.
              </p>
            </div>

            <div className="notice" style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: 750, marginBottom: '0.5rem' }}>Grounded feedback</h4>
              <p style={{ fontSize: '0.92rem', marginBottom: '0.75rem' }}>
                You correctly identified ATP investment and glucose phosphorylation.
              </p>
              <p style={{ fontSize: '0.92rem' }}>
                <strong>Follow-up:</strong> According to the source, what enzyme catalyzes the first transfer?
              </p>
            </div>

            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
              <Link href="/signup" className="btn" style={{ width: '100%' }}>Create account to try it</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
