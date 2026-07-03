import { SiteHeader } from '@/components/site/header';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <main className="container" style={{ flex: 1, padding: '4rem 2rem', maxWidth: '800px' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--ink)' }}>About Tessarion</h1>
        <p className="muted" style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: '4rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Tessarion is an experimental learning environment designed to enforce active recall and deep synthesis. 
          It moves away from passive reading and multiple-choice quizzes, instead demanding that students explain concepts in their own words.
        </p>

        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--ink)', borderBottom: '2px solid var(--line)', paddingBottom: '0.5rem' }}>
          Architecture
        </h2>
        
        <p style={{ color: 'var(--ink-soft)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Built for precision and speed, Tessarion leverages a modern edge-ready stack to process documents, extract semantic graphs, and evaluate student responses in real-time.
        </p>

        {/* Architecture Diagram */}
        <div style={{ 
          border: '1px solid var(--line-strong)', 
          padding: '2rem', 
          borderRadius: '8px',
          backgroundColor: 'var(--white)',
          marginBottom: '3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}>
          {/* Client Layer */}
          <div style={{ padding: '1rem', border: '1px dashed var(--ink-soft)', borderRadius: '4px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Client Layer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Next.js 16 (App Router) • React 19 • CSS Tokens</p>
          </div>
          
          <div style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>↓</div>

          {/* API / Edge Layer */}
          <div style={{ padding: '1rem', border: '1px solid var(--ink)', borderRadius: '4px', textAlign: 'center', backgroundColor: 'var(--cream)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Application API</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Vercel AI SDK • Next.js Route Handlers • Edge Middleware</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', color: 'var(--ink-soft)' }}>
            <div>↙</div>
            <div>↘</div>
          </div>

          {/* Data & Background Layers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--line-strong)', borderRadius: '4px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Data & Auth</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Supabase • Postgres pgvector • Row-Level Security</p>
            </div>
            
            <div style={{ padding: '1rem', border: '1px solid var(--line-strong)', borderRadius: '4px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>Background Jobs</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Inngest (Planned / Embedded) • Document Processing</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
