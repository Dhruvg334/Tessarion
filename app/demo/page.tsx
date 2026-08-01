import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = {
  title: 'Demo',
  description: 'Watch the Tessarion product walkthrough and explore the complete public notebook without creating an account.',
};

const steps = [
  ['Inspect the source', 'Start with the computer-architecture source. Every concept and finding points back to it.'],
  ['Explore the graph', 'Select concepts, read evidence, and inspect prerequisites, contrasts, and dependencies.'],
  ['Switch explanations', 'Compare strong, shallow, partial, unsupported, prerequisite-gap, and misconception cases.'],
  ['Read the diagnosis', 'See coverage, gaps, evidence conflicts, mastery evidence, and the selected route.'],
  ['Step through tutoring', 'Follow one bounded question at a time, then return to a fresh teach-back attempt.'],
  ['Inspect review and trace', 'See why review was scheduled and which workflow steps produced the decision.'],
] as const;

export default function DemoPage() {
  return (
    <SiteShell>
      <main className="demo-page-expanded" id="main-content">
        <header className="page-hero demo-page-hero">
          <div className="container page-hero-inner">
            <p className="eyebrow">Interactive product demo</p>
            <h1>Follow one learning decision from source to next action.</h1>
            <p className="subtitle">The public notebook exposes the source, concept graph, diagnosis cases, tutoring route, review state, and execution trace without requiring an account.</p>
            <div className="demo-guide-actions">
              <Link href="/demo/notebook" className="btn">Open demo notebook</Link>
              <Link href="/docs/learning-system" className="btn btn-secondary">Read the learning-system guide</Link>
            </div>
          </div>
        </header>

        <Reveal className="container demo-video-section">
          <div className="demo-video-heading">
            <div>
              <p className="eyebrow">Product walkthrough</p>
              <h2>See the complete evidence-linked learning loop.</h2>
            </div>
            <span>Official Tessarion demo</span>
          </div>
          <div className="demo-video-frame">
            <iframe
              src="https://www.youtube-nocookie.com/embed/wEGKEA1_CVE?rel=0"
              title="Tessarion product demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="demo-video-caption">
            <PlayCircle size={18} aria-hidden="true" />
            <p>The walkthrough introduces the public experience and follows a learning decision through diagnosis, concept context, and trace inspection.</p>
          </div>
        </Reveal>

        <Reveal className="container demo-guide-section">
          <div className="landing-section-heading-centered">
            <p className="eyebrow">Suggested walkthrough</p>
            <h2>Inspect the complete learning loop in six steps.</h2>
            <p>The demo is deterministic, public, and read-only. It writes no account data and requires no provider key.</p>
          </div>
          <div className="demo-guide-grid">
            {steps.map(([title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="demo-guide-actions">
            <Link href="/demo/notebook" className="btn">Try demo notebook</Link>
            <Link href="/docs/learning-system" className="btn btn-secondary">Read the learning-system guide</Link>
          </div>
        </Reveal>
      </main>
    </SiteShell>
  );
}
