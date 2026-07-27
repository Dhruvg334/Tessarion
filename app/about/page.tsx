import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'About', description: 'Why Tessarion exists, how it is built, and what comes next.' };

export default function AboutPage() {
  return (
    <SiteShell>
      <main className="about-page about-page-compact">
        <header className="about-hero container">
          <p className="eyebrow">About Tessarion</p>
          <h1>Built to test understanding through explanation.</h1>
          <Link href="/about/learning-methods" className="btn btn-secondary">Study methods behind Tessarion <ArrowRight size={16} /></Link>
        </header>
        <div className="container about-three-sections">
          <Reveal className="about-compact-section">
            <div className="about-section-label"><span>01</span><p>Why it exists</p></div>
            <div className="about-reading-column">
              <h2>Rereading often hides what a learner cannot explain.</h2>
              <p>Tessarion asks for a teach-back, checks it against source evidence and concept dependencies, then routes the learner to another attempt, tutoring, or review. Every important decision can be inspected.</p>
            </div>
          </Reveal>
          <Reveal className="about-compact-section">
            <div className="about-section-label"><span>02</span><p>Project</p></div>
            <div className="about-reading-column">
              <h2>An open-source learning system built by Dhruv Gupta.</h2>
              <p>The project brings retrieval, graph reasoning, workflow orchestration, evaluation, and product design into one evidence-linked learning loop.</p>
              <Link href="https://github.com/Dhruvg334/Tessarion" className="text-link about-repo-link" target="_blank" rel="noreferrer"><Github size={16} /> View the GitHub repository</Link>
            </div>
          </Reveal>
          <Reveal className="about-compact-section">
            <div className="about-section-label"><span>03</span><p>Future scope</p></div>
            <div className="about-reading-column">
              <h2>More learning formats, providers, and reviewed evidence.</h2>
              <p>Planned work includes social sign-in, provider choice, flashcards, Anki export, structured context books, external references, and a complete Agentic AI demo course.</p>
              <div className="about-actions"><Link href="/docs/current-status" className="btn btn-secondary">Current status</Link><Link href="/demo/notebook" className="btn">Open the demo</Link></div>
            </div>
          </Reveal>
        </div>
      </main>
    </SiteShell>
  );
}
