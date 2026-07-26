import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'About', description: 'Why Tessarion exists, who is building it, and what comes next.' };

export default function AboutPage() {
  return (
    <SiteShell>
      <main className="about-page about-page-compact">
        <header className="about-hero container">
          <p className="eyebrow">About Tessarion</p>
          <h1>Built to reveal understanding, not just activity.</h1>
          <Link href="/about/learning-methods" className="btn btn-secondary">Explore the learning methods <ArrowRight size={16} /></Link>
        </header>
        <div className="container about-three-sections">
          <Reveal className="about-compact-section"><div className="about-section-label"><span>01</span><p>Why it exists</p></div><div className="about-reading-column"><h2>Familiarity can feel like understanding.</h2><p>Tessarion asks learners to explain a concept, checks the explanation against evidence and dependencies, and chooses the next useful action. The goal is a learning decision that can be inspected rather than a score that must be trusted.</p></div></Reveal>
          <Reveal className="about-compact-section"><div className="about-section-label"><span>02</span><p>Who built it</p></div><div className="about-reading-column"><h2>Built by Dhruv Gupta.</h2><p>Dhruv is a final-year Computer Science student at KIIT Bhubaneswar focused on production-oriented learning systems, retrieval, workflow orchestration, and evidence-grounded product design.</p></div></Reveal>
          <Reveal className="about-compact-section"><div className="about-section-label"><span>03</span><p>Future scope</p></div><div className="about-reading-column"><h2>Broader evidence, stronger evaluation, dependable deployment.</h2><p>Future work includes larger reviewed datasets, production retrieval and graph services, richer learning-memory controls, and continued validation across subjects. Tessarion will remain explicit about its limitations and will not replace teacher judgement.</p><div className="about-actions"><Link href="/docs/security-and-status" className="btn btn-secondary">Current status</Link><Link href="/demo/notebook" className="btn">Open the demo</Link></div></div></Reveal>
        </div>
      </main>
    </SiteShell>
  );
}
