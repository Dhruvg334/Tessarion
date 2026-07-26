import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Compass, Layers3, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { FeatureExplorer } from '@/components/site/public/feature-explorer';
import { KnowledgeReport } from '@/components/site/public/knowledge-report';
import { SiteShell } from '@/components/site/site-shell';

const advantages = [
  ['Evidence you can inspect', 'Source-linked findings replace unexplained confidence.', ShieldCheck],
  ['Weak prerequisites become visible', 'Graph paths show what a learner may need before the active concept.', Layers3],
  ['Recovery matches the failure', 'A shallow answer, omission, and misconception lead to different routes.', Compass],
  ['Progress stays grounded', 'New mastery evidence comes from another explanation, not from finishing a chat.', CheckCircle2],
] as const;

export default function MarketingPage() {
  return (
    <SiteShell>
      <section className="hero hero-rebuilt" aria-labelledby="hero-title">
        <Image src="/hero-tessarion-network.svg" alt="" fill priority className="hero-background-art" sizes="100vw" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-inner">
          <p className="hero-kicker">Open-source learning intelligence</p>
          <h1 id="hero-title" className="hero-wordmark">Tessarion</h1>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-on-hero">Open a workspace</Link>
            <Link href="/demo/notebook" className="btn btn-ghost-on-hero">Try the public demo <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Reveal className="landing-report-showcase">
        <div className="container-wide landing-showcase-grid">
          <div className="landing-showcase-copy">
            <p className="eyebrow">A report, not a mystery score</p>
            <h2>See the concept structure, evidence, gap, and next action in one place.</h2>
            <p>Tessarion turns a learner explanation into an inspectable decision. The interface keeps source evidence, graph context, diagnosis, and routing connected.</p>
            <Link href="/docs/learning-system" className="text-link">Read the learning-system guide →</Link>
          </div>
          <KnowledgeReport />
        </div>
      </Reveal>

      <Reveal className="landing-feature-section">
        <div className="container-wide">
          <div className="landing-section-heading-centered">
            <p className="eyebrow">Explore the system</p>
            <h2>Six capabilities. One evidence-linked learning loop.</h2>
            <p>Select a capability to see the mechanism and the learner advantage.</p>
          </div>
          <FeatureExplorer />
        </div>
      </Reveal>

      <Reveal className="landing-advantages-section">
        <div className="container-wide">
          <div className="landing-section-heading-centered">
            <p className="eyebrow">Why the architecture matters</p>
            <h2>Technical boundaries become practical learning advantages.</h2>
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

      <Reveal className="landing-process-section">
        <div className="container landing-process-grid">
          <div>
            <p className="eyebrow">The working loop</p>
            <h2>Material becomes a concept model. Explanation becomes evidence.</h2>
          </div>
          <ol>
            <li><span>01</span><div><strong>Add source material</strong><p>Documents are chunked, indexed, and kept inside the notebook boundary.</p></div></li>
            <li><span>02</span><div><strong>Build the concept structure</strong><p>Concepts and evidence-bearing relationships form the context for diagnosis.</p></div></li>
            <li><span>03</span><div><strong>Teach it back</strong><p>The learner explains without copying the source.</p></div></li>
            <li><span>04</span><div><strong>Repair and review</strong><p>Tutoring, another attempt, or scheduled review follows the detected gap.</p></div></li>
          </ol>
        </div>
      </Reveal>

      <section className="landing-final-cta">
        <div className="container landing-final-cta-inner">
          <div><p className="eyebrow">Start with one concept</p><h2>Build a notebook around material you are actually studying.</h2></div>
          <div><Link href="/signup" className="btn btn-on-wood">Create an account</Link><Link href="/docs" className="btn btn-wood-outline">Read documentation</Link></div>
        </div>
      </section>
    </SiteShell>
  );
}
