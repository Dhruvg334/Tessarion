import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { SiteShell } from '@/components/site/site-shell';


function GitHubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.486 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.093.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.344-3.369-1.344-.455-1.158-1.11-1.466-1.11-1.466-.908-.621.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.529 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.094.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.651 0 0 .84-.269 2.75 1.027A9.564 9.564 0 0 1 12 6.84a9.56 9.56 0 0 1 2.504.337c1.909-1.296 2.748-1.027 2.748-1.027.545 1.379.202 2.398.1 2.651.64.7 1.028 1.594 1.028 2.688 0 3.848-2.337 4.695-4.566 4.943.359.31.679.923.679 1.86 0 1.343-.012 2.426-.012 2.756 0 .268.18.58.688.481A10.026 10.026 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" />
    </svg>
  );
}

export const metadata = { title: 'About', description: 'Why Tessarion exists, how it is built, and the principles that govern its evolution.' };

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
              <div className="about-project-links">
                <Link href="https://github.com/Dhruvg334/Tessarion" className="text-link about-repo-link" target="_blank" rel="noreferrer"><GitHubMark /> View the GitHub repository</Link>
                <Link href="https://youtu.be/wEGKEA1_CVE" className="text-link about-repo-link" target="_blank" rel="noreferrer"><PlayCircle size={16} /> Watch the product demo</Link>
              </div>
            </div>
          </Reveal>
          <Reveal className="about-compact-section">
            <div className="about-section-label"><span>03</span><p>Engineering direction</p></div>
            <div className="about-reading-column">
              <h2>Extensions must preserve evidence, evaluation, and learner control.</h2>
              <p>Tessarion can evolve through additional providers, source formats, and learning tools, but every addition must preserve provenance, workspace isolation, measurable quality gates, and inspectable decisions.</p>
              <div className="about-actions"><Link href="/docs/current-status" className="btn btn-secondary">Production status</Link><Link href="/demo/notebook" className="btn">Open the demo</Link></div>
            </div>
          </Reveal>
        </div>
      </main>
    </SiteShell>
  );
}
