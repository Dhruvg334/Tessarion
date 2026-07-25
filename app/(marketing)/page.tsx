import Link from 'next/link';
import { ArchitectureRail } from '@/components/site/public/architecture-rail';
import { SystemPreview } from '@/components/site/public/system-preview';
import { SiteShell } from '@/components/site/site-shell';

const loop = [
  ['Add material', 'Keep the learning boundary tied to the notes, chapters, and references you choose.'],
  ['Map concepts', 'Turn linear text into concepts, evidence links, and bounded dependency relationships.'],
  ['Teach it back', 'Explain a concept in your own words instead of selecting an answer from a list.'],
  ['Diagnose gaps', 'Compare the explanation with source evidence and the surrounding concept structure.'],
  ['Recover and review', 'Use one-question tutoring, mastery evidence, and review scheduling to continue.'],
] as const;

const principles = [
  ['Evidence before confidence', 'A learning decision must point to source evidence, graph context, or an explicit lack of sufficient evidence.'],
  ['Deterministic where possible', 'Mastery transitions, review scheduling, bounds, validation, and authorization remain tested domain logic.'],
  ['Workflows over hidden loops', 'Long-running diagnosis and tutoring steps are modeled as inspectable state transitions with safe terminal states.'],
  ['Derived indexes, one source of truth', 'Transactional records remain canonical; retrieval and graph systems are rebuildable projections.'],
] as const;

export default function MarketingPage() {
  return (
    <SiteShell>
      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-kicker">Open learning intelligence system</p>
          <h1>
            Learn by explaining.
            <span className="handwritten public-hero-wordmark">Tessarion</span>
          </h1>
          <p className="public-hero-summary">
            Tessarion turns source material into an evidence-linked concept model, then uses teach-back,
            retrieval, graph reasoning, review, and Socratic guidance to expose what you understand—and what still needs work.
          </p>
          <div className="public-hero-actions">
            <Link href="/signup" className="btn">Create a workspace</Link>
            <Link href="/how-it-works" className="btn btn-secondary">Inspect the system</Link>
          </div>
          <div className="public-hero-proof" aria-label="Product principles">
            <div><strong>Grounded</strong><span>Decisions remain linked to source evidence.</span></div>
            <div><strong>Traceable</strong><span>Workflow steps and failures stay inspectable.</span></div>
            <div><strong>Active</strong><span>The learner explains before the system guides.</span></div>
          </div>
        </div>
        <SystemPreview />
      </section>

      <section className="public-section">
        <div className="public-section-inner">
          <div className="public-section-heading">
            <p className="eyebrow">The learning loop</p>
            <div>
              <h2>A study process built around generated explanation—not passive familiarity.</h2>
              <p>
                Each stage produces structured evidence for the next. The system does not jump from an uploaded document to a confident score without retrieval, validation, and explicit learning-state transitions.
              </p>
            </div>
          </div>
          <div className="learning-loop-grid">
            {loop.map(([title, description], index) => (
              <article key={title} className="learning-loop-step">
                <span>STEP {String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-section-inner">
          <div className="public-section-heading">
            <p className="eyebrow">Inside the engine</p>
            <div>
              <h2>Different problems are handled by different system layers.</h2>
              <p>
                Retrieval, concept traversal, tutoring, persistence, and evaluation have separate responsibilities. That boundary keeps the product debuggable and prevents one model call from silently owning the entire learning decision.
              </p>
            </div>
          </div>
          <ArchitectureRail />
        </div>
      </section>

      <section className="public-section">
        <div className="public-section-inner public-two-column">
          <div>
            <p className="eyebrow">Engineering position</p>
            <h2 className="title" style={{ marginTop: '0.8rem' }}>Useful complexity only where it improves the learning result.</h2>
            <p className="subtitle" style={{ marginTop: '1rem' }}>
              Tessarion uses structured workflows for diagnosis and tutoring, but keeps scoring, review rules, validation, access control, and retrieval bounds deterministic. The project is designed to be inspected, evaluated, and rebuilt from canonical data rather than treated as an opaque assistant.
            </p>
            <div className="public-hero-actions">
              <Link href="/about" className="btn btn-secondary">Read the project story</Link>
              <Link href="/demo" className="btn btn-secondary">Follow the demo path</Link>
            </div>
          </div>
          <div className="public-principles">
            {principles.map(([title, description]) => (
              <div key={title} className="public-principle">
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-section-inner public-two-column">
          <div>
            <p className="eyebrow">Current state</p>
            <h2 className="title" style={{ marginTop: '0.8rem' }}>A working product under an explicit engineering rebuild.</h2>
          </div>
          <div className="subtitle">
            <p>
              Source ingestion, teach-back, mastery evidence, review scheduling, tutoring policy, security boundaries, workflow contracts, hybrid retrieval, graph projections, checkpointing, and evaluation suites are present in the repository.
            </p>
            <p style={{ marginTop: '1rem' }}>
              Production infrastructure and the complete interface are still being hardened. Planned capabilities are documented as planned; the public site does not use fabricated statistics, testimonials, or simulated adoption claims.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
