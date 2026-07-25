import { SiteShell } from '@/components/site/site-shell';
import { Prose } from '@/components/site/prose';
import { StatusNote } from '@/components/site/status-note';

export const metadata = {
  title: 'About | Tessarion',
};

export default function AboutPage() {
  return (
    <SiteShell className="container" style={{ padding: '4rem 2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--ink)' }}>
          About Tessarion
        </h1>
        <p className="muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', color: 'var(--ink-soft)' }}>
          A rigorous learning environment designed to enforce active recall and deep synthesis over passive reading.
        </p>
      </header>

      <Prose>
        <p>
          Passive reading and multiple-choice quizzes create an illusion of competence. Tessarion was built to dismantle that illusion by demanding that students explain concepts in their own words, backed by direct evidence from their source materials.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1.5rem' }}>The Origin</h2>
        <p>
          Tessarion is built by <strong>Dhruv Gupta</strong>, a final-year Computer Science student at KIIT Bhubaneswar. It emerged from the practical need to study dense academic materials where superficial memorization simply fails. 
        </p>
        <p>
          Instead of building another wrapper around a chat model that gives you the answers, Tessarion is designed to evaluate whether <em>you</em> know the answers.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1.5rem' }}>Core Philosophy</h2>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Teach-back matters:</strong> You don&apos;t understand a concept until you can explain it simply.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Concept graphs:</strong> Knowledge is highly interconnected. Visualizing dependencies prevents fragmented learning.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>No fake confidence:</strong> If there is no evidence in your source text, the system will not invent it.</li>
        </ul>

        <StatusNote title="Current System State">
          <p>Tessarion currently implements:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <li>Source material ingestion and local semantic chunking</li>
            <li>Graph construction based on prerequisite relationships</li>
            <li>Socratic teach-back sessions with source-grounded gap detection</li>
            <li>An evidence-backed mastery model</li>
            <li>Deterministic spaced-repetition review scheduling</li>
            <li>Activity observability and operational audit logs</li>
          </ul>
        </StatusNote>

        <StatusNote title="Limitations and Safety Boundaries">
          <p>Tessarion is designed as an assistant, <strong>not a replacement for human teachers</strong>.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>We do not claim perfect detection of student understanding.</li>
            <li>The quality of the concept graph depends entirely on the quality of the uploaded material.</li>
            <li>This is a local-first architecture; running a production deployment requires proper environment setup and limits.</li>
          </ul>
        </StatusNote>
      </Prose>
    </SiteShell>
  );
}
