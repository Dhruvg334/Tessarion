import Link from 'next/link';

const flowSteps = [
  ['Add sources', 'Paste notes, lectures, textbook excerpts, or reference material into a focused notebook.'],
  ['Build the graph', 'Tessarion extracts concepts, links prerequisites, and keeps evidence attached to source chunks.'],
  ['Teach it back', 'Explain a concept in your own words and receive one source-grounded follow-up question.'],
];

export default function MarketingPage() {
  return (
    <main>
      <section className="container-wide hero-grid">
        <div>
          <p className="eyebrow" style={{ marginBottom: '1.2rem' }}>Source-grounded learning workspace</p>
          <h1 className="handwritten hero-wordmark">Tessarion</h1>
          <p className="subtitle" style={{ margin: '1.2rem 0 2rem' }}>
            A clean notebook where students learn by teaching: upload study material, build a concept graph, explain ideas back, and uncover gaps using evidence from the source.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Link href="/signup" className="btn">Start learning</Link>
            <Link href="/how-it-works" className="btn btn-secondary">See how it works</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', maxWidth: 680 }}>
            <div><p className="annotation">graph-first</p><p className="muted" style={{ fontSize: '0.9rem' }}>Concepts are connected, not isolated.</p></div>
            <div><p className="annotation">grounded</p><p className="muted" style={{ fontSize: '0.9rem' }}>Feedback cites your material.</p></div>
            <div><p className="annotation">active</p><p className="muted" style={{ fontSize: '0.9rem' }}>You explain before you advance.</p></div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="notebook-board">
            <div className="float-card" style={{ marginBottom: '1rem' }}>
              <p className="eyebrow">Notebook</p>
              <h2 style={{ fontSize: '1.45rem', letterSpacing: '-0.03em' }}>Data Structures</h2>
              <p className="muted" style={{ fontSize: '0.92rem' }}>Arrays → Linked Lists → Trees → Graphs</p>
            </div>
            <div className="float-card" style={{ width: '82%', marginLeft: 'auto', marginBottom: '1rem' }}>
              <p className="annotation">Teach-back prompt</p>
              <p style={{ marginTop: '0.5rem' }}>Explain why tree traversal order changes the output sequence.</p>
            </div>
            <div className="float-card" style={{ width: '88%', marginTop: '2rem' }}>
              <p className="eyebrow">Grounded feedback</p>
              <p className="muted" style={{ marginTop: '0.5rem' }}>You covered recursion, but missed the role of the base case. Check the source note attached to traversal definitions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide" style={{ paddingTop: '4rem', paddingBottom: '4rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'end', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Learning loop</p>
            <h2 className="title" style={{ maxWidth: 720 }}>A study flow that makes gaps visible.</h2>
          </div>
          <Link href="/demo" className="btn btn-secondary">Explore demo</Link>
        </div>
        <div className="flow-row">
          {flowSteps.map(([title, body], index) => (
            <article className="flow-step" key={title}>
              <span className="big-number">0{index + 1}</span>
              <h3 style={{ fontSize: '1.35rem', margin: '0.5rem 0', letterSpacing: '-0.03em' }}>{title}</h3>
              <p className="muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-wide" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Architecture, not vibes</p>
          <h2 className="title" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}>Retrieval, concept graphs, and teach-back work together.</h2>
          <p className="subtitle" style={{ marginBottom: '2rem' }}>
            Tessarion is built around evidence. Source chunks feed retrieval, retrieval supports graph construction, and the teach-back agent uses that context to produce grounded feedback.
          </p>
          <div className="arch-strip">
            {['Sources', 'Chunks', 'Concept Graph', 'Teach-Back', 'Feedback'].map((node) => <div className="arch-node" key={node}>{node}</div>)}
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem', textAlign: 'center' }}>
        <p className="annotation" style={{ marginBottom: '0.5rem' }}>Ready to make your first notebook?</p>
        <h2 className="title">Start with one topic.</h2>
        <p className="subtitle" style={{ margin: '0 auto 2rem' }}>Paste one clear source, extract concepts, and explain one concept back. That is enough to see where understanding is strong and where it needs work.</p>
        <Link href="/signup" className="btn">Create notebook</Link>
      </section>
    </main>
  );
}
