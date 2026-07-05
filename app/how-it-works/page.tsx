import { SiteHeader } from '@/components/site/header';

export default function HowItWorksPage() {
  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <main className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: '800px' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--ink)' }}>How Tessarion Works</h1>
        <p className="muted" style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '4rem', color: 'var(--ink-soft)', maxWidth: 640, marginInline: 'auto' }}>
          Tessarion is designed around proven cognitive science principles. We replace passive reading with active, difficult learning.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>1</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Concept Mapping</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '1rem' }}>
                <strong>The Product:</strong> You upload text materials, and Tessarion builds a visual graph of concepts and their prerequisites. Every node is explicitly grounded in the source text.
              </p>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                <strong>The Science:</strong> Knowledge is highly interconnected. Visualizing these relationships helps prevent rote memorization of isolated facts. When you can see that &quot;Recursion&quot; is a prerequisite for &quot;Tree Traversal&quot;, you build a more robust mental model.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>2</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Retrieval Practice & The Generation Effect</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '1rem' }}>
                <strong>The Product:</strong> You select a concept, hide the original text, and explain the idea back to the system in your own words.
              </p>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                <strong>The Science:</strong> The struggle of recalling information from memory strengthens the neural pathway to that information. Explaining it in your own words (the generation effect) ensures you are processing the meaning, not just recalling words. Tessarion enforces this &quot;desirable difficulty&quot; instead of just giving you the answer.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>3</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Metacognition</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '1rem' }}>
                <strong>The Product:</strong> The Teach-Back Agent analyzes your explanation strictly against the uploaded text. It returns specific feedback highlighting omissions, unsupported claims, and weak connections.
              </p>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                <strong>The Science:</strong> You often don&apos;t know what you don&apos;t know until you try to teach it. Tessarion&apos;s gap detection provides immediate, objective feedback, helping you calibrate your own understanding (metacognition) and focus your study on actual weaknesses rather than perceived ones.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="handwritten" style={{ fontSize: '3rem', color: 'var(--ink)', width: '3rem' }}>4</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Elaborative Interrogation</h2>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '1rem' }}>
                <strong>The Product:</strong> After grading your explanation, Tessarion asks one single Socratic follow-up question grounded in the text, targeting your highest-risk gap.
              </p>
              <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                <strong>The Science:</strong> Prompting a learner to explain *why* a fact is true or *how* it connects to another concept forces deeper processing. Instead of a multi-turn chat that can do the work for you, Tessarion demands one clear, elaborated response.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
