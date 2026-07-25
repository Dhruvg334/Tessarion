import { SiteShell } from '@/components/site/site-shell';
import { Prose } from '@/components/site/prose';

export const metadata = {
  title: 'How It Works | Tessarion',
};

export default function HowItWorksPage() {
  return (
    <SiteShell className="container" style={{ padding: '4rem 2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--ink)' }}>
          How Tessarion Works
        </h1>
        <p className="muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', color: 'var(--ink-soft)' }}>
          A technical look at the architecture of the learning loop.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }} className="dashboard-grid-responsive">
        <aside style={{ position: 'sticky', top: '2rem' }}>
          <nav>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)', marginBottom: '1rem' }}>Architecture</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#ingestion" className="muted" style={{ textDecoration: 'none' }}>1. Source Ingestion</a></li>
              <li><a href="#concept-graph" className="muted" style={{ textDecoration: 'none' }}>2. Concept Graph</a></li>
              <li><a href="#teach-back" className="muted" style={{ textDecoration: 'none' }}>3. Teach-Back</a></li>
              <li><a href="#mastery" className="muted" style={{ textDecoration: 'none' }}>4. Mastery & Review</a></li>
              <li><a href="#tutoring" className="muted" style={{ textDecoration: 'none' }}>5. Socratic Tutoring</a></li>
            </ul>
          </nav>
        </aside>

        <Prose style={{ maxWidth: '100%' }}>
          <section id="ingestion" style={{ scrollMarginTop: '2rem', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>1. Source Ingestion and Chunking</h2>
            <p>
              The learning process begins by uploading text. Tessarion breaks this text down into semantic chunks and creates vector embeddings for each chunk. 
            </p>
            <p>
              <strong>Why it exists:</strong> Grounding the system in the user&apos;s own material prevents hallucinated facts and ensures the learning strictly follows the desired curriculum.
            </p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong>Input:</strong> Raw text documents.</li>
              <li><strong>Output:</strong> `source_chunks` with text content and semantic embeddings.</li>
            </ul>
          </section>

          <section id="concept-graph" style={{ scrollMarginTop: '2rem', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>2. Concept Extraction and Graph Construction</h2>
            <p>
              Tessarion analyzes the chunks to identify discrete concepts and their prerequisite relationships, forming a Directed Acyclic Graph (DAG).
            </p>
            <p>
              <strong>Why it exists:</strong> Linear reading hides the dependency structure of knowledge. The concept graph makes it visually obvious which foundational concepts must be mastered before advancing.
            </p>
            <p>
              Every concept node retains strict foreign key relationships (`concept_source_relationships`) back to the specific `source_chunks` that define it.
            </p>
          </section>

          <section id="teach-back" style={{ scrollMarginTop: '2rem', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>3. Teach-Back and Gap Detection</h2>
            <p>
              Users select a concept and attempt to explain it. The system retrieves the exact source chunks associated with that concept and evaluates the explanation against them.
            </p>
            <p>
              <strong>Why it exists:</strong> Generation is the most effective form of study. By forcing the user to generate an answer, Tessarion exposes the &quot;illusion of competence.&quot;
            </p>
            <p>
              If an explanation misses critical details found in the source text, the system records a <strong>Gap Finding</strong>. If it is accurate, it records a positive mastery signal.
            </p>
          </section>

          <section id="mastery" style={{ scrollMarginTop: '2rem', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>4. Mastery Model and Review Scheduling</h2>
            <p>
              A deterministic engine processes the ledger of `mastery_signals`. It calculates a `mastery_level` (ranging from 0.0 to 1.0) and computes the optimal time for the next review using a spaced-repetition algorithm.
            </p>
            <p>
              <strong>Why it exists:</strong> To automate the scheduling of practice so the user reviews concepts exactly when they are on the verge of forgetting them.
            </p>
            <p>
              If a gap was found, a `review_schedule` is immediately created with `high` or `critical` priority.
            </p>
          </section>

          <section id="tutoring" style={{ scrollMarginTop: '2rem', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>5. Socratic Tutoring</h2>
            <p>
              When a user struggles with a concept, they enter a Socratic tutoring session. The tutor is explicitly instructed <strong>never</strong> to give the direct answer. Instead, it asks leading questions based on the exact source text.
            </p>
            <p>
              <strong>Why it exists:</strong> Simply reading the correct answer after failing a question does not build strong neural pathways. Struggling to retrieve the answer with minimal hints does.
            </p>
            <p>
              The tutoring system tracks turn counts and abandons the session if the user becomes too frustrated, suggesting they return to the source material instead.
            </p>
          </section>

        </Prose>
      </div>
    </SiteShell>
  );
}
