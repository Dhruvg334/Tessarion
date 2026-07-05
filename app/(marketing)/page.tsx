import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main>
      <section className="container" style={{ padding: '8rem 2rem 6rem', textAlign: 'center', maxWidth: 800 }}>
        <h1 className="handwritten" style={{ fontSize: 'clamp(4rem, 8vw, 6rem)', lineHeight: 1, marginBottom: '1.5rem', color: 'var(--ink)' }}>
          Tessarion
        </h1>
        <p className="subtitle" style={{ fontSize: '1.25rem', marginBottom: '2.5rem', marginInline: 'auto', color: 'var(--ink)' }}>
          A study workspace that builds understanding through explanation, not just reading. Upload materials, visualize concepts, and test your knowledge by teaching it back.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="btn">Start learning</Link>
          <Link href="/how-it-works" className="btn btn-secondary">See how it works</Link>
        </div>
      </section>

      <section className="container-wide" style={{ paddingTop: '5rem', paddingBottom: '5rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: 640, marginInline: 'auto' }}>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>The Cognitive Science</p>
          <h2 className="title" style={{ fontSize: '2.25rem' }}>Learning requires desirable difficulty.</h2>
          <p className="subtitle" style={{ marginTop: '1rem' }}>Rereading notes creates the illusion of competence. True mastery comes from struggling to recall and explain.</p>
        </div>

        <div className="flow-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          <article className="flow-step" style={{ padding: '2rem', border: '1px solid var(--ink-light)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>Retrieval Practice</h3>
            <p className="muted">
              Every time you try to pull information from memory without looking at the answer, you strengthen the neural pathway. Tessarion forces you to explain concepts from memory before you can see the grounded feedback.
            </p>
          </article>
          
          <article className="flow-step" style={{ padding: '2rem', border: '1px solid var(--ink-light)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>Concept Mapping</h3>
            <p className="muted">
              Knowledge is not a list of facts; it is a network of relationships. When you upload a document, Tessarion builds a visual graph of concepts and prerequisites, helping you see how ideas connect.
            </p>
          </article>
          
          <article className="flow-step" style={{ padding: '2rem', border: '1px solid var(--ink-light)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>Metacognition</h3>
            <p className="muted">
              You don&apos;t know what you don&apos;t know until you try to teach it. Tessarion&apos;s gap detection compares your explanation directly against the source text to highlight omissions, unsupported claims, and weak connections.
            </p>
          </article>
        </div>
      </section>

      <section className="container-wide" style={{ paddingTop: '5rem', paddingBottom: '5rem', borderTop: '1px solid var(--line)' }}>
        <div className="card" style={{ padding: '4rem 3rem', textAlign: 'center' }}>
          <p className="eyebrow" style={{ marginBottom: '1rem' }}>No illusions</p>
          <h2 className="title" style={{ fontSize: '2.25rem', maxWidth: 800, marginInline: 'auto', marginBottom: '1.5rem' }}>
            A notebook built on evidence, not generative hallucination.
          </h2>
          <p className="subtitle" style={{ maxWidth: 680, marginInline: 'auto' }}>
            Tessarion is not an autonomous tutor that gives you answers. It is a strict workspace that requires you to do the hard work of generation and elaboration. Feedback is strictly bounded by the chunks of text you provide.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem', textAlign: 'center' }}>
        <h2 className="title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to test your understanding?</h2>
        <p className="subtitle" style={{ maxWidth: 500, marginInline: 'auto', marginBottom: '2.5rem' }}>Create your first notebook, add a study source, and try teaching it back.</p>
        <Link href="/signup" className="btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>Create notebook</Link>
      </section>
    </main>
  );
}
