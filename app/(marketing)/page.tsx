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
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>The Workspace Loop</p>
          <h2 className="title" style={{ fontSize: '2.25rem' }}>A workspace, not a chatbot.</h2>
          <p className="subtitle" style={{ marginTop: '1rem' }}>Tessarion forces you to do the hard work of generation. It is built for careful learning, grounding every interaction in the text you provide.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '3rem 0', maxWidth: '800px', margin: '0 auto' }}>
          <div className="card card-ruled" style={{ width: '100%', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>1. Source Material</h3>
              <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem', maxWidth: '400px' }}>Upload your textbook chapters and notes. Tessarion will never invent facts outside your curriculum.</p>
            </div>
          </div>
          
          <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--ink-soft)' }} aria-hidden="true" />
          
          <div className="card card-ruled" style={{ width: '100%', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>2. Knowledge Graph</h3>
              <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem', maxWidth: '400px' }}>Concepts are extracted and mapped to prerequisites, creating a visual mental model of the subject.</p>
            </div>
          </div>
          
          <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--ink-soft)' }} aria-hidden="true" />
          
          <div className="card card-ruled" style={{ width: '100%', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>3. Teach-Back</h3>
              <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem', maxWidth: '400px' }}>Select a node in the graph and explain it from memory. The system detects gaps and unsupported claims.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide" style={{ paddingTop: '5rem', paddingBottom: '5rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: 640, marginInline: 'auto' }}>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>The Cognitive Science</p>
          <h2 className="title" style={{ fontSize: '2.25rem' }}>Why teaching back works.</h2>
          <p className="subtitle" style={{ marginTop: '1rem' }}>Rereading notes creates the illusion of competence. True mastery comes from struggling to recall and explain.</p>
        </div>

        <div className="flow-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          <article className="flow-step card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>Retrieval Practice</h3>
            <p className="muted">
              Every time you try to pull information from memory without looking at the answer, you strengthen the neural pathway. Tessarion forces you to explain concepts from memory before you can see the grounded feedback.
            </p>
          </article>
          
          <article className="flow-step card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>Metacognition</h3>
            <p className="muted">
              You don&apos;t know what you don&apos;t know until you try to teach it. Tessarion&apos;s gap detection compares your explanation directly against the source text to highlight omissions and weak connections.
            </p>
          </article>
          
          <article className="flow-step card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>Grounded Feedback</h3>
            <p className="muted">
              Unlike generic chatbot responses, Tessarion explicitly highlights parts of your explanation that are unsupported by the uploaded curriculum, preventing hallucinated learning.
            </p>
          </article>
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
