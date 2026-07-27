import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'Demo', description: 'Watch the product walkthrough and explore the public demo notebook.' };

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
      <main className="demo-page-expanded">
        <header className="page-hero demo-page-hero"><div className="container page-hero-inner"><p className="eyebrow">Product walkthrough</p><h1>Watch the flow, then inspect it yourself.</h1><p className="subtitle">The video gives a quick orientation. The public notebook lets you interact with the same source, concepts, diagnosis cases, tutoring route, review state, and trace without creating an account.</p></div></header>

        <Reveal className="container-wide demo-video-section">
          <div className="demo-video-heading"><div><p className="eyebrow">Temporary walkthrough</p><h2>A guided view of the complete learning loop.</h2></div><span>Replaceable video · 16:9</span></div>
          <div className="demo-video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/JSnYRxWMMus?rel=0" title="Tessarion temporary product demonstration" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />
          </div>
          <div className="demo-video-caption"><PlayCircle size={18} /><p>This temporary video will be replaced with the final Tessarion walkthrough. The interactive notebook below shows the current product behaviour.</p></div>
        </Reveal>

        <Reveal className="container demo-guide-section">
          <div className="landing-section-heading-centered"><p className="eyebrow">How to use the demo</p><h2>Follow the evidence from source to next action.</h2><p>The demo is deterministic and public. It writes no account data and requires no provider key.</p></div>
          <div className="demo-guide-grid">
            {steps.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
          <div className="demo-guide-actions"><Link href="/demo/notebook" className="btn">Try demo notebook</Link><Link href="/docs/learning-system" className="btn btn-secondary">Read the learning-system guide</Link></div>
        </Reveal>
      </main>
    </SiteShell>
  );
}
