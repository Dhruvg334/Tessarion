'use client';

import { useMemo, useState } from 'react';
import { demoNotebook } from '@/lib/demo/notebook';

type DemoPanel = 'overview' | 'source' | 'graph' | 'teach-back' | 'tutor' | 'review' | 'trace';

const panels: Array<{ id: DemoPanel; label: string }> = [
  { id: 'overview', label: 'Study board' },
  { id: 'source', label: 'Source' },
  { id: 'graph', label: 'Knowledge graph' },
  { id: 'teach-back', label: 'Teach-back' },
  { id: 'tutor', label: 'Tutor' },
  { id: 'review', label: 'Review' },
  { id: 'trace', label: 'Trace' },
];

export function DemoNotebook() {
  const [panel, setPanel] = useState<DemoPanel>('overview');
  const [scenarioId, setScenarioId] = useState('misconception');
  const scenario = useMemo(
    () => demoNotebook.scenarios.find((item) => item.id === scenarioId) ?? demoNotebook.scenarios[0],
    [scenarioId],
  );

  return (
    <div className="demo-notebook-shell">
      <header className="demo-notebook-header">
        <div>
          <p className="eyebrow">Public demo notebook</p>
          <h1>{demoNotebook.title}</h1>
          <p>{demoNotebook.description}</p>
        </div>
        <div className="demo-mode-note">
          <strong>Deterministic demo</strong>
          <span>No account or provider key required</span>
        </div>
      </header>

      <nav className="demo-panel-nav" aria-label="Demo notebook sections">
        {panels.map((item) => (
          <button key={item.id} type="button" className={panel === item.id ? 'is-active' : ''} onClick={() => setPanel(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>

      {panel === 'overview' && (
        <div className="demo-overview-grid">
          <section className="demo-report-card demo-report-card-primary">
            <p className="eyebrow">Current route</p>
            <h2>Inspect a deliberate misconception</h2>
            <p>Follow the evidence from source text to graph context, diagnosis, tutoring, review, and execution trace.</p>
            <button type="button" className="btn" onClick={() => setPanel('teach-back')}>Open teach-back report</button>
          </section>
          <section className="demo-summary-grid" aria-label="Demo notebook summary">
            <article><strong>1</strong><span>source</span></article>
            <article><strong>{demoNotebook.concepts.length}</strong><span>concepts</span></article>
            <article><strong>3</strong><span>diagnosis cases</span></article>
            <article><strong>{demoNotebook.trace.length}</strong><span>trace steps</span></article>
          </section>
          <section className="demo-capability-matrix">
            {[
              ['Evidence', 'Every diagnosis points back to the supplied source.'],
              ['Graph', 'Relationships explain prerequisites and comparisons.'],
              ['Diagnosis', 'Contradictions and omissions remain separate.'],
              ['Tutor', 'One bounded question at a time.'],
              ['Review', 'The next interval follows the diagnosis state.'],
              ['Trace', 'Each important decision is inspectable.'],
            ].map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
          </section>
        </div>
      )}

      {panel === 'source' && (
        <section className="demo-reading-panel">
          <p className="eyebrow">Ground truth</p>
          <h2>{demoNotebook.source.title}</h2>
          <p>{demoNotebook.source.body}</p>
        </section>
      )}

      {panel === 'graph' && (
        <section className="demo-graph-panel">
          <div className="demo-panel-heading"><div><p className="eyebrow">Derived projection</p><h2>Evidence-linked concept structure</h2></div><span>Bounded to this notebook</span></div>
          <div className="demo-graph-canvas">
            {demoNotebook.concepts.map((concept, index) => (
              <article key={concept.id} className={`demo-concept-node demo-node-${index + 1}`}>
                <small>{concept.level}</small><strong>{concept.label}</strong><span>{concept.evidence}</span>
              </article>
            ))}
            <div className="demo-edge-list">
              {demoNotebook.edges.map(([from, to, relation]) => <p key={`${from}-${to}`}>{from} <span>— {relation} →</span> {to}</p>)}
            </div>
          </div>
        </section>
      )}

      {panel === 'teach-back' && (
        <section className="demo-teachback-layout">
          <div className="demo-scenario-picker">
            <p className="eyebrow">Choose a response</p>
            {demoNotebook.scenarios.map((item) => (
              <button key={item.id} type="button" className={item.id === scenario.id ? 'is-active' : ''} onClick={() => setScenarioId(item.id)}>
                <strong>{item.label}</strong><span>{item.response}</span>
              </button>
            ))}
          </div>
          <div className="demo-diagnosis-report">
            <div className="demo-report-head"><div><p className="eyebrow">Diagnosis report</p><h2>{scenario.state}</h2></div><span>{scenario.confidence}</span></div>
            <blockquote>{scenario.response}</blockquote>
            <div className="demo-report-columns">
              <div><h3>What needs attention</h3>{scenario.gaps.length ? <ul>{scenario.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : <p>No material gaps detected.</p>}</div>
              <div><h3>Next action</h3><p>{scenario.nextAction}</p><button type="button" className="btn btn-secondary" onClick={() => setPanel(scenario.id === 'misconception' ? 'tutor' : 'review')}>Continue route</button></div>
            </div>
          </div>
        </section>
      )}

      {panel === 'tutor' && (
        <section className="demo-tutor-panel">
          <div className="demo-panel-heading"><div><p className="eyebrow">Socratic recovery</p><h2>One question, then wait</h2></div><span>Target: volatility + speed</span></div>
          <div className="demo-thread">
            {demoNotebook.tutor.map((turn, index) => <article key={index} data-role={turn.role}><small>{turn.role}</small><p>{turn.text}</p></article>)}
          </div>
        </section>
      )}

      {panel === 'review' && (
        <section className="demo-review-grid">
          {demoNotebook.scenarios.map((item) => (
            <article key={item.id} className="demo-review-card"><p className="eyebrow">{item.state}</p><h2>{item.label}</h2><p>{item.review}</p><strong>{item.nextAction}</strong></article>
          ))}
        </section>
      )}

      {panel === 'trace' && (
        <section className="demo-trace-panel">
          <div className="demo-panel-heading"><div><p className="eyebrow">Execution trace</p><h2>How the result was produced</h2></div><span>Safe structured trace</span></div>
          <ol>{demoNotebook.trace.map(([step, detail, status], index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{step}</strong><p>{detail}</p></div><em>{status}</em></li>)}</ol>
        </section>
      )}
    </div>
  );
}
