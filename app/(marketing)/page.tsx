import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <h1 className="handwritten">Tessarion</h1>
        <p className="muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          A learning workspace where students understand by teaching.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/signup" className="btn">Start learning</Link>
          <Link href="/demo" className="btn btn-secondary">Explore demo</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="container" style={{ padding: '6rem 2rem', borderTop: '1px solid var(--border)' }}>
        <h2 className="title" style={{ textAlign: 'center', marginBottom: '3rem' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. Add material</h3>
            <p className="muted">Upload your study materials, lecture notes, or textbook excerpts.</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. Context is built</h3>
            <p className="muted">Tessarion reads and organizes your documents into a searchable retrieval context.</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>3. Teach it back</h3>
            <p className="muted">Explain the concept in your own words. The AI finds gaps in your understanding.</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>4. Master the graph</h3>
            <p className="muted">Over time, build a personal knowledge graph of mastered concepts. (Coming soon)</p>
          </div>
        </div>
      </section>

      {/* Why it is different */}
      <section style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h2 className="title" style={{ marginBottom: '1.5rem' }}>Not just another chatbot</h2>
          <p className="muted" style={{ maxWidth: '700px', margin: '0 auto 3rem auto', fontSize: '1.125rem' }}>
            Tessarion is designed for serious STEM learning. It doesn&apos;t just give you the answers; it forces you to synthesize what you know and proves your mastery through source-grounded feedback.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Source-Grounded</h4>
              <p className="muted">Feedback is strictly tied to your uploaded materials. No hallucinations.</p>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Concept Graphs</h4>
              <p className="muted">Visualize how topics connect to form a cohesive understanding.</p>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Active Recall</h4>
              <p className="muted">Go beyond multiple-choice flashcards. Write out your reasoning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RAG & Engineering Credibility */}
      <section className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 className="title" style={{ marginBottom: '1.5rem' }}>Engineered for Precision</h2>
        <p className="muted" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          Our Retrieval-Augmented Generation (RAG) foundation is built on a provider-pluggable architecture, utilizing hybrid search (sparse + dense pgvector) and calibrated Reciprocal Rank Fusion. We strictly evaluate retrieval quality (nDCG@5, MRR) so your feedback is always accurate and relevant.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/demo" className="btn btn-secondary">Try the demo preview</Link>
        </div>
      </section>
    </div>
  );
}