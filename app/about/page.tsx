import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = {
  title: 'About',
  description: 'Why Tessarion exists, who is building it, and where the project goes next.',
};

export default function AboutPage() {
  return (
    <SiteShell>
      <div className="about-page">
        <header className="about-hero container">
          <p className="eyebrow">About Tessarion</p>
          <h1>A learning system built around explanation, evidence, and the next useful action.</h1>
        </header>

        <div className="container about-three-sections">
          <section className="about-compact-section">
            <div className="about-section-label"><span>01</span><p>Why it exists</p></div>
            <div className="about-reading-column">
              <h2>Studying can feel productive without revealing what is actually understood.</h2>
              <p>Rereading, highlighting, and answer generation often produce familiarity rather than recall. Tessarion asks the learner to explain a concept, checks that explanation against source evidence and concept dependencies, then chooses a specific next action: explain again, repair a misconception through tutoring, or review later.</p>
              <p>The system is designed to make that decision inspectable. It should show what evidence was used, where the explanation failed, and why a particular learning route was selected.</p>
            </div>
          </section>

          <section className="about-compact-section">
            <div className="about-section-label"><span>02</span><p>Who built it</p></div>
            <div className="about-reading-column">
              <h2>Built by Dhruv Gupta.</h2>
              <p>Dhruv is a final-year Computer Science student at KIIT Bhubaneswar focused on building production-oriented learning systems, retrieval pipelines, workflow orchestration, and evidence-grounded interfaces.</p>
              <p>Tessarion brings those areas together in one open-source project: a serious technical system that remains honest about what is implemented, what is measured, and what still needs validation.</p>
              <Link href="/docs/architecture" className="text-link">Read the architecture →</Link>
            </div>
          </section>

          <section className="about-compact-section">
            <div className="about-section-label"><span>03</span><p>Future scope</p></div>
            <div className="about-reading-column">
              <h2>From a strong foundation to a dependable learning platform.</h2>
              <p>The next work is operational rather than cosmetic: production deployment, external retrieval and graph services, broader reviewed evaluation datasets, stronger browser-level testing, and better support for long-running indexing jobs.</p>
              <p>Tessarion will continue to avoid claims that exceed its evidence. It is not a replacement for teachers, and its recommendations remain bounded by the supplied material, evaluation coverage, and quality of the underlying learning signals.</p>
              <div className="about-actions">
                <Link href="/docs/security-and-status" className="btn btn-secondary">Current status</Link>
                <Link href="/demo/notebook" className="btn">Open the demo</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
