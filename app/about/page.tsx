import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <SiteShell>
      <header className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow">About</p>
          <h1 className="title">A project built around the difference between recognising an idea and being able to explain it.</h1>
          <p className="subtitle">Tessarion was created by Dhruv Gupta, a final-year Computer Science student at KIIT Bhubaneswar, to make difficult study material inspectable, testable, and connected.</p>
        </div>
      </header>
      <div className="container page-content">
        <article className="prose reading-column">
          <h2>Why the project exists</h2>
          <p>Reading can make unfamiliar material feel familiar without proving that it can be recalled or reconstructed. Tessarion asks the learner to explain a concept, then checks that explanation against the source and the relationships surrounding the concept.</p>
          <p>The aim is not to produce more answers. It is to expose what is missing, identify the evidence that matters, and decide what the learner should do next.</p>

          <h2>How the system is designed</h2>
          <p>Transactional records, learner state, and canonical source identifiers remain in Postgres. Retrieval indexes, graph projections, checkpoints, and traces are derived layers with explicit failure and recovery boundaries.</p>
          <p>Deterministic services handle validation, mastery calculation, review scheduling, authorization, and bounds. Stateful workflows are reserved for tasks that need conditional routing, interruption, recovery, or multi-turn memory.</p>

          <h2>What works today</h2>
          <ul>
            <li>Source ingestion, chunking, and evidence references</li>
            <li>Concept and relationship extraction contracts</li>
            <li>Hybrid retrieval and bounded graph projection foundations</li>
            <li>Teach-back diagnosis, mastery evidence, and review scheduling</li>
            <li>Socratic tutoring policies and resumable workflow contracts</li>
            <li>Operational events, trace export boundaries, and versioned evaluation suites</li>
          </ul>

          <h2>What Tessarion does not claim</h2>
          <ul>
            <li>It does not replace teachers or expert review.</li>
            <li>It does not claim perfect measurement of understanding.</li>
            <li>It cannot produce better grounding than the supplied material permits.</li>
            <li>Derived indexes and graph projections are not treated as canonical records.</li>
            <li>Unvalidated generated output is not allowed to update learner state.</li>
          </ul>

          <div className="docs-block">
            <h3>Open engineering record</h3>
            <p>The documentation records implemented behaviour, planned components, data ownership, workflow boundaries, evaluation methodology, and known limitations separately.</p>
          </div>
        </article>
      </div>
    </SiteShell>
  );
}
