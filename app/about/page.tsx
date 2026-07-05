import { SiteHeader } from '@/components/site/header';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <main className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: '800px' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--ink)' }}>About Tessarion</h1>
        <p className="muted" style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '4rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Tessarion is a rigorous learning environment designed to enforce active recall and deep synthesis. 
          It moves away from passive reading and multiple-choice quizzes, instead demanding that students explain concepts in their own words, backed by evidence.
        </p>

        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--ink)', borderBottom: '2px solid var(--line)', paddingBottom: '0.5rem' }}>
          System Architecture
        </h2>
        
        <p style={{ color: 'var(--ink-soft)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Built for precision, safety, and evidence-grounding, Tessarion leverages a modern stack to process documents and evaluate student responses locally where possible, falling back to external providers only when necessary. We strictly avoid unconstrained generative AI features.
        </p>

        <div style={{ 
          border: '1px solid var(--line-strong)', 
          padding: '2rem', 
          borderRadius: '12px',
          backgroundColor: 'var(--white)',
          marginBottom: '3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Client Layer */}
          <div style={{ padding: '1.25rem', border: '1px dashed var(--ink-soft)', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Client Layer</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>Next.js (App Router) • React Server Components • Vanilla CSS Tokens</p>
          </div>
          
          <div style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>↓</div>

          {/* API / AI Layer */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--ink)', borderRadius: '8px', textAlign: 'center', backgroundColor: 'var(--cream)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Application & Intelligence API</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>Vercel AI SDK • Local Deterministic Fallbacks • Structured Output Generation</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', color: 'var(--ink-soft)' }}>
            <div>↙</div>
            <div>↘</div>
          </div>

          {/* Data & Background Layers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ padding: '1.25rem', border: '1px solid var(--line-strong)', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Data & Auth</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>Supabase • Postgres pgvector • Strict Row-Level Security</p>
            </div>
            
            <div style={{ padding: '1.25rem', border: '1px solid var(--line-strong)', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Background Processing</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>Inngest (Planned) • Chunking & Embedding</p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--ink)', borderBottom: '2px solid var(--line)', paddingBottom: '0.5rem' }}>
          Design Principles
        </h2>
        <ul style={{ color: 'var(--ink-soft)', lineHeight: 1.6, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li><strong>No Hallucinated Tutors:</strong> Feedback is strictly bounded by the chunks of text you provide. The system does not invent curriculum.</li>
          <li><strong>Graph-First Mental Models:</strong> Concepts are always visualized as a network of prerequisites, not isolated flashcards.</li>
          <li><strong>Local Fallbacks:</strong> Core teach-back routing and structured evaluation can gracefully degrade to deterministic local functions if API access fails.</li>
        </ul>
      </main>
    </div>
  );
}
