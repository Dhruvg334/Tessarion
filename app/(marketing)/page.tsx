import Link from 'next/link';
import { ArrowRight, CheckCircle2, Compass, Layers3, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { FeatureExplorer } from '@/components/site/public/feature-explorer';
import { KnowledgeReport } from '@/components/site/public/knowledge-report';
import { SiteShell } from '@/components/site/site-shell';

const advantages = [
  ['Inspectable evidence', 'Every diagnosis points to source chunks or concept evidence.', ShieldCheck],
  ['Visible prerequisites', 'Graph paths show which missing concept affects the current explanation.', Layers3],
  ['Targeted recovery', 'Omissions, shallow answers, and misconceptions lead to different actions.', Compass],
  ['Grounded progress', 'Mastery changes after a new explanation, not after completing a chat.', CheckCircle2],
] as const;

export default function MarketingPage() {
  return (
    <SiteShell>
      <section className="hero hero-rebuilt hero-clean" aria-labelledby="hero-title">
        <div className="hero-inner">
          <p className="hero-kicker">Evidence-linked learning</p>
          <h1 id="hero-title" className="hero-wordmark">Tessarion</h1>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-on-hero">Create a notebook</Link>
            <Link href="/demo/notebook" className="btn btn-ghost-on-hero">Explore the live demo <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Reveal className="landing-report-showcase">
        <div className="container-wide landing-showcase-grid">
          <div className="landing-showcase-copy">
            <p className="eyebrow">From explanation to action</p>
            <h2>A single report connects the source, graph, diagnosis, and next step.</h2>
            <p>Instead of returning a score, Tessarion shows what the learner said, what the source supports, which concept relationship matters, and what to do next.</p>
            <ul className="landing-clarity-list">
              <li>Source evidence remains visible.</li>
              <li>Concept dependencies explain why a gap matters.</li>
              <li>The next action follows the diagnosed failure.</li>
            </ul>
            <Link href="/docs/learning-system" className="text-link">Read the learning-system guide →</Link>
          </div>
          <KnowledgeReport />
        </div>
      </Reveal>

      <Reveal className="landing-feature-section">
        <div className="container-wide">
          <div className="landing-section-heading-centered">
            <p className="eyebrow">Core capabilities</p>
            <h2>Explore the parts that make the learning loop work.</h2>
            <p>Select a capability to see its mechanism, boundary, and learner benefit.</p>
          </div>
          <FeatureExplorer />
        </div>
      </Reveal>

      <Reveal className="landing-advantages-section">
        <div className="container-wide">
          <div className="landing-section-heading-centered">
            <p className="eyebrow">What the learner gains</p>
            <h2>Each technical boundary produces a clear learning advantage.</h2>
          </div>
          <div className="advantage-grid">
            {advantages.map(([title, copy, Icon], index) => (
              <article key={title}>
                <div className="advantage-card-top"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={18} /></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      <section className="landing-simple-cta">
        <div className="container landing-simple-cta-inner">
          <h2>Start with one source and one concept.</h2>
          <Link href="/signup" className="btn">Create your notebook</Link>
        </div>
      </section>
    </SiteShell>
  );
}
