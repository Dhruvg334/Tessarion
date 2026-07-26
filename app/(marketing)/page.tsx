import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';

const loop = [
  ['01', 'Ground', 'Add the exact material you are studying.'],
  ['02', 'Model', 'Build concepts, evidence links, and dependencies.'],
  ['03', 'Explain', 'Teach one idea back without reading the source.'],
  ['04', 'Diagnose', 'Locate omissions, misconceptions, and weak prerequisites.'],
  ['05', 'Recover', 'Use tutoring and review before explaining it again.'],
];

const systemLayers = [
  ['Evidence', 'Source chunks stay attached to every concept and diagnosis.'],
  ['Reasoning', 'Workflow transitions are explicit, bounded, and inspectable.'],
  ['Memory', 'Learner state records what changed and why it changed.'],
  ['Evaluation', 'Versioned datasets measure retrieval, diagnosis, review, and tutoring.'],
];

export default function MarketingPage() {
  return (
    <SiteShell>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <h1 id="hero-title" className="hero-wordmark">Tessarion</h1>
          <div className="hero-actions">
            <Link href="/signup" className="btn">Open a workspace</Link>
            <Link href="/docs" className="btn btn-secondary">Explore the system</Link>
          </div>
        </div>
      </section>

      <section className="landing-intro-section">
        <div className="container landing-intro-grid">
          <div className="landing-intro-heading">
            <p className="eyebrow">A different study loop</p>
            <h2>Reading creates familiarity. Explanation reveals whether the idea can be rebuilt.</h2>
          </div>
          <div className="landing-intro-copy">
            <p>Tessarion turns source material into an evidence-linked learning system. It asks you to explain a concept, checks the explanation against the source and its dependencies, then selects the next learning action.</p>
            <p>The result is not a score without context. It is a traceable record of what was covered, what was missed, and which evidence supports the diagnosis.</p>
          </div>
        </div>
      </section>

      <section className="landing-loop-section">
        <div className="container-wide">
          <div className="landing-section-title">
            <p className="eyebrow">The complete loop</p>
            <h2>One continuous path from material to durable understanding.</h2>
          </div>
          <div className="landing-loop-rail">
            {loop.map(([index, title, description]) => (
              <article key={index}>
                <span>{index}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-system-section">
        <div className="container landing-system-grid">
          <div className="landing-system-map" aria-label="Tessarion system flow">
            <div className="system-map-column">
              <span className="eyebrow">Input</span>
              <strong>Source material</strong>
              <small>documents · chunks · evidence</small>
            </div>
            <div className="system-map-arrow" aria-hidden="true">→</div>
            <div className="system-map-column system-map-core">
              <span className="eyebrow">Learning engine</span>
              <strong>Concepts + workflows</strong>
              <small>retrieval · graph · diagnosis</small>
            </div>
            <div className="system-map-arrow" aria-hidden="true">→</div>
            <div className="system-map-column">
              <span className="eyebrow">Output</span>
              <strong>Next action</strong>
              <small>review · tutor · teach-back</small>
            </div>
          </div>

          <div className="landing-system-copy">
            <p className="eyebrow">Inside the system</p>
            <h2>Each layer has one responsibility.</h2>
            <div className="system-layer-list">
              {systemLayers.map(([title, copy]) => (
                <div key={title}><h3>{title}</h3><p>{copy}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-proof-section">
        <div className="container landing-proof-grid">
          <div>
            <p className="eyebrow">Engineering standard</p>
            <h2>Evidence before confidence.</h2>
          </div>
          <div className="landing-proof-list">
            <p><span>01</span> Generated output cannot update learner state until validation passes.</p>
            <p><span>02</span> Vector and graph layers remain rebuildable projections, not canonical records.</p>
            <p><span>03</span> Workflow checkpoints, tool calls, and failure boundaries are inspectable.</p>
            <p><span>04</span> Evaluation datasets are versioned and run as regression gates.</p>
          </div>
        </div>
      </section>

      <section className="landing-status-section">
        <div className="container landing-status-inner">
          <div>
            <p className="eyebrow">Current implementation</p>
            <h2>The learning core is active. External retrieval and graph services remain replaceable.</h2>
          </div>
          <Link href="/docs/current-status" className="btn btn-secondary">Read implementation status</Link>
        </div>
      </section>
    </SiteShell>
  );
}
