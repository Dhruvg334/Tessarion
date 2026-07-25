import { SiteShell } from '@/components/site/site-shell';

export const metadata = {
  title: 'About | Tessarion',
  description: 'Why Tessarion exists, how it is engineered, and what the project currently implements.',
};

const capabilities = [
  ['Source ingestion', 'Documents are split into evidence-bearing chunks with workspace ownership.'],
  ['Concept intelligence', 'Concepts and relationships are extracted, validated, versioned, and linked to provenance.'],
  ['Hybrid retrieval', 'Dense, sparse, metadata, and bounded graph context are combined through explicit ranking stages.'],
  ['Teach-back diagnosis', 'Learner explanations produce structured gaps, evidence links, and safe uncertainty states.'],
  ['Mastery and review', 'Deterministic services turn evidence into learning states and review recommendations.'],
  ['Socratic tutoring', 'A bounded one-question workflow guides recovery without prematurely supplying the answer.'],
  ['Workflow persistence', 'Checkpoint contracts preserve state transitions, interruptions, and resumable execution.'],
  ['Evaluation', 'Versioned datasets and regression suites measure retrieval, diagnosis, graph, tutoring, and runtime behavior.'],
] as const;

const nav = [
  ['origin', 'Why it exists'],
  ['builder', 'About the builder'],
  ['principles', 'Engineering principles'],
  ['state', 'Current state'],
  ['limits', 'Boundaries'],
] as const;

export default function AboutPage() {
  return (
    <SiteShell>
      <header className="about-hero">
        <p className="public-kicker">Project and philosophy</p>
        <div>
          <h1>Understanding should leave evidence.</h1>
          <p className="about-hero-copy" style={{ marginTop: '1.4rem' }}>
            Tessarion exists because reading a chapter, recognizing familiar terms, and answering a shallow quiz can feel like learning while leaving the underlying concept structure untouched. The project makes explanation the central act, then builds the surrounding retrieval, graph, memory, review, and evaluation systems needed to judge that explanation responsibly.
          </p>
        </div>
      </header>

      <div className="about-grid">
        <aside className="about-sidebar" aria-label="About page sections">
          {nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </aside>

        <div className="about-content">
          <section id="origin" className="about-section">
            <h2>Why it exists</h2>
            <div className="about-section-body">
              <p>
                Most study software optimizes access to information: faster summaries, generated answers, more flashcards, and more content. Tessarion focuses on a different question: can the learner reconstruct the idea, connect it to its prerequisites, and defend the explanation with the material they are studying?
              </p>
              <p>
                Teach-back creates the observable signal. The rest of the system exists to interpret that signal without inventing certainty: retrieve the relevant evidence, inspect nearby concept relationships, identify omissions or misconceptions, record a traceable learning state, and choose the next useful action.
              </p>
            </div>
          </section>

          <section id="builder" className="about-section">
            <h2>About the builder</h2>
            <div className="about-section-body">
              <p>
                Tessarion is built by <strong>Dhruv Gupta</strong>, a final-year Computer Science student at KIIT Bhubaneswar. The project combines his work across retrieval systems, structured model workflows, evaluation, backend integration, and product design into one long-running engineering effort.
              </p>
              <p>
                The goal is not to wrap a conversation interface around study notes. It is to build an open system where each important learning decision has a defined input, a bounded workflow, a validation rule, an evidence trail, and a measurable failure mode.
              </p>
            </div>
          </section>

          <section id="principles" className="about-section">
            <h2>Engineering principles</h2>
            <div className="about-section-body">
              <p><strong>Use workflows selectively.</strong> Stateful orchestration is reserved for diagnosis, concept intelligence, and tutoring. Deterministic calculations remain ordinary tested services.</p>
              <p><strong>Keep one canonical record.</strong> Postgres owns transactional learner and source data. Vector and graph systems are derived projections that can be rebuilt.</p>
              <p><strong>Validate before persistence.</strong> Generated concepts, relationships, gaps, and tutor moves must satisfy schema, provenance, and policy checks before they become product state.</p>
              <p><strong>Improve through evaluation.</strong> Production failures become labelled cases; candidate changes are compared offline before promotion. The system does not autonomously rewrite and deploy its own rules.</p>
            </div>
          </section>

          <section id="state" className="about-section">
            <h2>Current project state</h2>
            <div className="about-section-body">
              <p>
                The repository contains the core learning domain, security model, operational events, structured workflow foundations, retrieval and graph contracts, checkpoint persistence, and a growing evaluation inventory. The interface and infrastructure are being rebuilt in controlled phases rather than presented as finished prematurely.
              </p>
              <div className="capability-grid">
                {capabilities.map(([title, description]) => (
                  <div key={title} className="capability-item">
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="limits" className="about-section">
            <h2>Boundaries and limitations</h2>
            <div className="about-section-body">
              <p>
                Tessarion is not a replacement for a teacher, a grading authority, or proof that a learner has mastered a subject. Its judgments are constrained by the supplied material, the quality of extraction and retrieval, the available evidence, and the coverage of its evaluation datasets.
              </p>
              <p>
                A missing evidence path must reduce confidence. A failed provider or derived index must degrade safely. A tutoring session must not silently mark a concept as understood. These boundaries are treated as product behavior, not implementation details.
              </p>
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
