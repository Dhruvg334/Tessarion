import { SiteHeader } from '@/components/site/header';

export default function HowItWorksPage() {
  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <main className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: '800px' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--ink)' }}>How Tessarion Works</h1>
        <p className="muted" style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '4rem', color: 'var(--ink-soft)' }}>
          A step-by-step guide to the current learning flow.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>1</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Upload Materials</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Start by providing raw text from your textbook, lecture notes, or research papers. Tessarion securely stores these materials in your private workspace.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>2</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Concept Extraction</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Using our AI pipeline, Tessarion scans your text and extracts the core concepts, building a visual knowledge graph. Every concept is explicitly grounded in the source text.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>3</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>The Teach-Back Loop</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Click on any concept in your graph and explain it in your own words. The Teach-Back Agent analyzes your explanation against the original source text.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>4</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Identify Gaps</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                The agent returns specific feedback, highlighting what you covered well and identifying gaps (like missing prerequisites or unsupported claims). A Socratic follow-up question is generated to test your understanding further.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
