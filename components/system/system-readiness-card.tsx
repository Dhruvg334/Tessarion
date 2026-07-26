import type { SystemReadiness } from '@/lib/system/readiness';

export function SystemReadinessCard({ readiness, compact = false }: { readiness: SystemReadiness; compact?: boolean }) {
  const rows = [
    ['Generation model', readiness.generation === 'configured' ? 'Configured' : 'Not configured'],
    ['Embeddings', readiness.embeddings === 'external' ? 'External provider' : 'Local deterministic'],
    ['Reranking', 'Local deterministic'],
    ['Workflow runtime', 'Ready'],
    ['Checkpoint storage', 'Ready'],
  ];

  return (
    <section className={`system-readiness-card${compact ? ' is-compact' : ''}`} aria-label="System readiness">
      <div className="system-readiness-head">
        <div><p className="eyebrow">System health</p><h2>{readiness.overall === 'ready' ? 'Learning engine ready' : 'Running with local fallbacks'}</h2></div>
        <span className={`system-readiness-dot ${readiness.overall}`} aria-hidden="true" />
      </div>
      <div className="system-readiness-list">
        {rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <p className="system-readiness-note">
        A configured model enables generated extraction and tutoring. Deterministic retrieval, scoring, routing, and evaluation remain available without it.
      </p>
    </section>
  );
}
