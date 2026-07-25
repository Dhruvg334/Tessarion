import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';

export default function MarketingPage() {
  return (
    <SiteShell>
      <section className="container" style={{ padding: '8rem 2rem 6rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="handwritten" style={{ fontSize: 'clamp(3.5rem, 8vw, 5rem)', lineHeight: 1, marginBottom: '1.5rem', color: 'var(--ink)' }}>
          Tessarion
        </h1>
        <p className="subtitle" style={{ fontSize: '1.25rem', marginBottom: '3rem', color: 'var(--ink)' }}>
          A study workspace that builds understanding through explanation, not just reading. Upload materials, visualize concepts, and test your knowledge by teaching it back.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="btn" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Start learning</Link>
          <Link href="/how-it-works" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>See how it works</Link>
        </div>
      </section>

      <section className="container-wide" style={{ paddingTop: '5rem', paddingBottom: '5rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '640px', margin: '0 auto' }}>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>The Problem</p>
          <h2 className="title" style={{ fontSize: '2.25rem' }}>Passive studying fails.</h2>
          <p className="subtitle" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
            Highlighting textbooks and taking multiple-choice quizzes creates an illusion of competence. When asked to explain a concept from scratch, the gaps in understanding become immediately obvious.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
          <p className="eyebrow" style={{ alignSelf: 'flex-start', marginLeft: '1rem' }}>The Workspace Loop</p>
          
          <div className="card card-ruled" style={{ width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>1. Add Material</h3>
            <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem' }}>Upload your textbook chapters and notes. Tessarion will never invent facts outside your curriculum.</p>
          </div>

          <div className="card card-ruled" style={{ width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>2. Build Concept Map</h3>
            <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem' }}>Tessarion analyzes the text and extracts a visual graph of concepts and their prerequisites.</p>
          </div>

          <div className="card card-ruled" style={{ width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>3. Teach It Back</h3>
            <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem' }}>Select a concept and explain it in your own words. The system evaluates your explanation against the source text.</p>
          </div>

          <div className="card card-ruled" style={{ width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>4. Find Gaps & Review</h3>
            <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem' }}>If you miss critical details, the system flags the gap, schedules a review, and offers guided Socratic tutoring to help you discover the answer.</p>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <h2 className="title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>What Tessarion is not.</h2>
          <p className="subtitle" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
            It is not a chatbot that gives you the answers. It is not an essay writer. It will not pretend to know things outside of the documents you provide. It is a strict environment for building mastery through effort.
          </p>
          <div style={{ display: 'inline-block', padding: '1rem 1.5rem', border: '1px dashed var(--ink)', backgroundColor: 'var(--cream)', borderRadius: '4px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
              <strong>Current State:</strong> Tessarion is an active technical project. Not all edge cases are handled, but the core active recall loop is functional.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
