import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <SiteShell>
      <header className="about-hero">
        <div className="container about-hero-inner">
          <p className="eyebrow">About Tessarion</p>
          <h1>Built to make understanding visible.</h1>
          <p>Tessarion is an open-source learning intelligence system created by Dhruv Gupta, a final-year Computer Science student at KIIT Bhubaneswar.</p>
        </div>
      </header>

      <main className="about-content">
        <section className="container about-origin-grid">
          <div className="about-section-label">
            <span>01</span>
            <p>Why it exists</p>
          </div>
          <div className="about-reading-column">
            <h2>Familiarity is not the same as understanding.</h2>
            <p>Students can reread a chapter until every sentence looks familiar and still struggle to reconstruct the central idea without the page in front of them. Most study tools reward exposure, completion, or answer production. They rarely show exactly what a learner can explain, what is missing, and which source evidence supports that conclusion.</p>
            <p>Tessarion begins at that gap. It converts material into an evidence-linked concept model, asks the learner to teach one concept back, and uses the result to choose a defensible next action.</p>
          </div>
        </section>

        <section className="about-band">
          <div className="container about-principles-grid">
            <div>
              <p className="eyebrow">The product thesis</p>
              <h2>Learning should leave an inspectable trail.</h2>
            </div>
            <div className="about-principles-list">
              <article><span>Evidence</span><p>Concepts, gaps, and recommendations remain linked to source material.</p></article>
              <article><span>Structure</span><p>Dependencies and prerequisites matter as much as isolated facts.</p></article>
              <article><span>Action</span><p>A diagnosis is useful only when it changes what the learner does next.</p></article>
              <article><span>Honesty</span><p>The system must state when evidence is insufficient rather than manufacture certainty.</p></article>
            </div>
          </div>
        </section>

        <section className="container about-origin-grid">
          <div className="about-section-label"><span>02</span><p>How it is built</p></div>
          <div className="about-reading-column">
            <h2>Deterministic where correctness matters. Stateful where reasoning requires it.</h2>
            <p>Postgres owns canonical learner and source records. Retrieval indexes, graph projections, workflow checkpoints, and traces are derived layers with explicit recovery boundaries. Deterministic services handle validation, mastery calculation, review scheduling, authorization, and limits.</p>
            <p>Stateful workflows are reserved for tasks that need conditional routing, interruption, retries, or multi-turn memory. Every consequential update must pass a validation boundary before persistence.</p>
            <Link href="/docs/architecture" className="text-link">Read the architecture documentation →</Link>
          </div>
        </section>

        <section className="about-band">
          <div className="container about-capabilities-grid">
            <div>
              <p className="eyebrow">Current state</p>
              <h2>Implemented foundations</h2>
            </div>
            <ul>
              <li>Source ingestion, chunking, and evidence references</li>
              <li>Concept extraction and relationship contracts</li>
              <li>Hybrid retrieval and bounded graph projection</li>
              <li>Teach-back diagnosis and mastery evidence</li>
              <li>Review scheduling and Socratic tutoring policies</li>
              <li>Workflow checkpoints, operational events, and trace export</li>
              <li>Versioned evaluation suites across the learning pipeline</li>
            </ul>
          </div>
        </section>

        <section className="container about-origin-grid">
          <div className="about-section-label"><span>03</span><p>Boundaries</p></div>
          <div className="about-reading-column">
            <h2>What the project does not claim.</h2>
            <p>Tessarion does not replace teachers, guarantee perfect measurement of understanding, or treat generated output as authoritative. Its quality is bounded by the supplied material, the evaluation coverage, and the evidence available for each decision.</p>
            <p>The project is being built in public with its architecture, implementation status, evaluation method, and limitations documented separately.</p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
