import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';

const methods = [
  ['Feynman-style explanation', 'Explain an idea in plain language without copying the source.', 'Teach-back exposes vague wording, missing mechanisms, and borrowed familiarity.'],
  ['Retrieval practice', 'Reconstruct information from memory before seeing the answer.', 'Tessarion evaluates the explanation produced from recall rather than rewarding rereading.'],
  ['Elaboration', 'Connect a concept to causes, examples, contrasts, and prerequisites.', 'The concept graph gives diagnosis a structure beyond keyword matching.'],
  ['Socratic questioning', 'Use one targeted question to repair a specific gap.', 'The tutor avoids giving a complete answer too early and routes the learner back to teach-back.'],
  ['Spaced review', 'Return to a concept after a delay chosen from the learning evidence.', 'Review is scheduled from gaps, severity, prior attempts, and mastery signals rather than decorative streaks.'],
  ['Metacognition', 'Inspect why a learning decision was made.', 'Evidence and workflow traces help learners distinguish confidence from demonstrated understanding.'],
] as const;

export const metadata = { title: 'Learning methods', description: 'The study methods behind Tessarion and how they are implemented.' };

export default function LearningMethodsPage() {
  return (
    <SiteShell>
      <main className="methods-page">
        <header className="page-hero"><div className="container page-hero-inner"><p className="eyebrow">Learning methods</p><h1>Methods that require the learner to reconstruct, connect, and correct.</h1><p className="subtitle">Tessarion combines established study practices with explicit evidence and workflow boundaries. It supports these methods; it does not guarantee a learning outcome.</p></div></header>
        <div className="container methods-grid">
          {methods.map(([title, practice, implementation], index) => (
            <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h2>{title}</h2><p><strong>Practice:</strong> {practice}</p><p><strong>In Tessarion:</strong> {implementation}</p></article>
          ))}
        </div>
        <div className="container methods-footer"><Link href="/about" className="btn btn-secondary">Back to About</Link><Link href="/docs/learning-system" className="btn">Read the learning system</Link></div>
      </main>
    </SiteShell>
  );
}
