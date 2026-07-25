import { SiteShell } from '@/components/site/site-shell';
import { Prose } from '@/components/site/prose';

export const metadata = {
  title: 'Demo | Tessarion',
};

export default function DemoPage() {
  return (
    <SiteShell className="container" style={{ padding: '4rem 2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--ink)' }}>
          Try Tessarion
        </h1>
        <p className="muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', color: 'var(--ink-soft)' }}>
          How to evaluate the system locally.
        </p>
      </header>

      <Prose>
        <p>
          Tessarion does not currently offer a public, unauthenticated sandbox due to the high computational costs of building concept graphs and running evaluation models. 
        </p>
        <p>
          However, you can run the entire system locally by cloning the repository and providing your own API keys.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem' }}>Local Evaluation Flow</h3>
        <p>Once deployed locally, we recommend the following flow to test the system&apos;s capabilities:</p>
        <ol style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Create a Workspace:</strong> Make a notebook for a specific topic (e.g., &quot;Photosynthesis&quot;).</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Upload Source Material:</strong> Paste in a dense, factual text of about 500-1000 words.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>View the Graph:</strong> Watch as Tessarion extracts concepts and links them by prerequisites.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Teach-Back:</strong> Select a core concept and try to explain it. <em>First, try a perfect explanation. Then, try an explanation that intentionally misses a critical detail from your source text.</em></li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Observe the Gap Detection:</strong> See how the system strictly uses your uploaded text to identify what you missed, without hallucinating outside facts.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Try Socratic Tutoring:</strong> Click on the resulting review task and engage the tutor. Notice how it asks leading questions instead of just giving you the answer.</li>
        </ol>

        <div style={{ padding: '1.5rem', border: '1px solid var(--line-strong)', borderRadius: '4px', backgroundColor: 'var(--white)', marginTop: '3rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Suggested Sample Text</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>
            If you need material to test with, try a short Wikipedia excerpt about a technical process. For example, the mechanism of action of Aspirin (Cyclooxygenase inhibition) works exceptionally well for generating a clear concept graph and testing precise explanations.
          </p>
        </div>
      </Prose>
    </SiteShell>
  );
}
