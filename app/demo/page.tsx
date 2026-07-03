import Link from 'next/link';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';

export default function DemoPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SiteHeader />
      <main className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
            Interactive Preview
          </span>
          <h1 className="title">Demo Workspace</h1>
          <p className="muted">This is a static preview. Create an account to upload your own materials and interact with the AI.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left Column: Source Material & Graph */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Source Documents
              </h2>
              <div style={{ padding: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <p style={{ fontWeight: 500 }}>Cellular Respiration (Chapter 9)</p>
                <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>12 pages • Extracted 84 chunks</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--muted)', fontStyle: 'italic', paddingLeft: '1rem', borderLeft: '3px solid var(--border)' }}>
                  &quot;...Glycolysis occurs in the cytosol and begins the degradation process by breaking glucose into two molecules of a compound called pyruvate...&quot;
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Concept Graph Preview
              </h2>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', borderRadius: '6px', border: '1px dashed var(--border)', color: 'var(--muted)' }}>
                [Static Graph Visualization Placeholder]
              </div>
            </div>
          </div>

          {/* Right Column: Teach-back flow */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              Teach-Back Session
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Concept: Glycolysis</p>
              <p className="muted">Explain the role of ATP investment in the early stages of glycolysis.</p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '1.5rem', lineHeight: 1.2, color: 'var(--foreground)' }}>
                The cell has to spend some ATP first to phosphorylate the glucose molecule, which makes it unstable so it can break in half later.
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '6px', marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '0.5rem' }}>AI Feedback (Grounded)</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Good start! You correctly identified that ATP is invested to phosphorylate glucose and make it unstable.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#b91c1c' }}>
                <strong>Missing nuance:</strong> According to the text, how many ATP are invested per glucose molecule, and what enzyme catalyzes the first transfer?
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
