'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, GitFork, History, Route, Sparkles } from 'lucide-react';
import { demoNotebook } from '@/lib/demo/notebook';
import { InfoDialog } from '@/components/ui/info-dialog';

type DemoPanel = 'overview' | 'source' | 'graph' | 'teach-back' | 'tutor' | 'review' | 'trace';
const panels: Array<{ id: DemoPanel; label: string }> = [
  { id: 'overview', label: 'Study board' }, { id: 'source', label: 'Source' }, { id: 'graph', label: 'Knowledge graph' },
  { id: 'teach-back', label: 'Teach-back' }, { id: 'tutor', label: 'Tutor' }, { id: 'review', label: 'Review' }, { id: 'trace', label: 'Trace' },
];

const capabilityCards = [
  { icon: BookOpen, title: 'Evidence', copy: 'Every diagnosis points back to the source.' },
  { icon: GitFork, title: 'Graph', copy: 'Dependencies explain why a gap matters.' },
  { icon: Sparkles, title: 'Diagnosis', copy: 'Different failures produce different routes.' },
  { icon: History, title: 'Review', copy: 'The next interval follows the evidence.' },
  { icon: Route, title: 'Trace', copy: 'Each important decision is inspectable.' },
] as const;

export function DemoNotebook() {
  const [panel, setPanel] = useState<DemoPanel>('overview');
  const [scenarioId, setScenarioId] = useState('misconception');
  const [compareId, setCompareId] = useState('grounded');
  const [conceptId, setConceptId] = useState('cache');
  const [tutorStep, setTutorStep] = useState(1);
  const reduced = useReducedMotion();
  const scenario = useMemo(() => demoNotebook.scenarios.find((item) => item.id === scenarioId) ?? demoNotebook.scenarios[0], [scenarioId]);
  const comparison = useMemo(() => demoNotebook.scenarios.find((item) => item.id === compareId) ?? demoNotebook.scenarios[0], [compareId]);
  const concept = useMemo(() => demoNotebook.concepts.find((item) => item.id === conceptId) ?? demoNotebook.concepts[0], [conceptId]);
  const gapCount = Number(scenario.gaps.length);
  const gapLabel = gapCount === 1 ? 'issue' : 'issues';

  return (
    <div className="demo-notebook-shell">
      <header className="demo-notebook-header"><div><p className="eyebrow">Public demo notebook</p><h1>{demoNotebook.title}</h1><p>{demoNotebook.description}</p></div><div className="demo-mode-note"><strong>Deterministic demo</strong><span>No account or provider key required</span></div></header>
      <nav className="demo-panel-nav" aria-label="Demo notebook sections">{panels.map((item) => <button key={item.id} type="button" className={panel === item.id ? 'is-active' : ''} onClick={() => setPanel(item.id)}>{item.label}</button>)}</nav>

      <LazyMotion features={domAnimation} strict>
        <AnimatePresence mode="wait">
          <m.div key={panel} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            {panel === 'overview' && (
              <div className="demo-overview-grid">
                <section className="demo-report-card demo-report-card-primary"><p className="eyebrow">Current route</p><h2>Inspect a deliberate misconception</h2><p>Follow the evidence from source text to graph context, diagnosis, tutoring, review, attempt comparison, and execution trace.</p><button type="button" className="btn" onClick={() => setPanel('teach-back')}>Open teach-back report</button></section>
                <section className="demo-summary-grid" aria-label="Demo notebook summary"><article><strong>1</strong><span>source</span></article><article><strong>{demoNotebook.concepts.length}</strong><span>concepts</span></article><article><strong>{demoNotebook.scenarios.length}</strong><span>diagnosis cases</span></article><article><strong>{demoNotebook.trace.length}</strong><span>trace steps</span></article></section>
                <section className="demo-capability-matrix">{capabilityCards.map(({ icon: Icon, title, copy }) => <article key={title}><Icon size={17}/><h3>{title}</h3><p>{copy}</p></article>)}</section>
              </div>
            )}

            {panel === 'source' && <section className="demo-reading-panel"><p className="eyebrow">Ground truth</p><h2>{demoNotebook.source.title}</h2><p>{demoNotebook.source.body}</p><InfoDialog trigger={<button className="text-button" type="button">How evidence is used</button>} title="Evidence boundary"><p>Every scenario in this demo is evaluated against this source. Claims absent from the source are marked unsupported rather than silently accepted.</p></InfoDialog></section>}

            {panel === 'graph' && (
              <section className="demo-graph-panel"><div className="demo-panel-heading"><div><p className="eyebrow">Derived projection</p><h2>Evidence-linked concept structure</h2></div><span>Select a concept</span></div>
                <div className="demo-graph-interactive"><div className="demo-concept-list">{demoNotebook.concepts.map((item) => <button key={item.id} type="button" className={item.id === concept.id ? 'is-active' : ''} onClick={() => setConceptId(item.id)}><small>{item.level}</small><strong>{item.label}</strong></button>)}</div><aside className="demo-concept-inspector"><p className="eyebrow">Selected concept</p><h3>{concept.label}</h3><p>{concept.evidence}</p><h4>Connected relationships</h4><ul>{demoNotebook.edges.filter(([from,to]) => from === concept.id || to === concept.id).map(([from,to,relation]) => <li key={`${from}-${to}-${relation}`}>{from} <span>{relation}</span> {to}</li>)}</ul><button type="button" className="btn btn-secondary" onClick={() => setPanel('teach-back')}>Teach this concept</button></aside></div>
              </section>
            )}

            {panel === 'teach-back' && (
              <section className="demo-teachback-layout"><div className="demo-scenario-picker"><p className="eyebrow">Choose a response</p>{demoNotebook.scenarios.map((item) => <button key={item.id} type="button" className={item.id === scenario.id ? 'is-active' : ''} onClick={() => setScenarioId(item.id)}><strong>{item.label}</strong><span>{item.response}</span></button>)}</div><div className="demo-diagnosis-report"><div className="demo-report-head"><div><p className="eyebrow">Diagnosis report</p><h2>{scenario.state}</h2></div><span>{scenario.confidence}</span></div><blockquote>{scenario.response}</blockquote><div className="demo-report-columns"><div><h3>What needs attention</h3>{scenario.gaps.length ? <ul>{scenario.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : <p>No material gaps detected.</p>}</div><div><h3>Selected route</h3><strong>{scenario.nextAction}</strong><p>{scenario.review}</p></div></div><div className="demo-compare-panel"><label>Compare with<select value={compareId} onChange={(event) => setCompareId(event.target.value)}>{demoNotebook.scenarios.filter((item) => item.id !== scenario.id).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><article><span>{comparison.state}</span><p>{comparison.response}</p></article></div><button type="button" className="btn" onClick={() => setPanel(scenario.id === 'misconception' || scenario.id === 'prerequisite' ? 'tutor' : 'review')}>{scenario.nextAction} <ArrowRight size={15}/></button></div></section>
            )}

            {panel === 'tutor' && (
              <section className="demo-tutor-panel"><div className="demo-panel-heading"><div><p className="eyebrow">Socratic recovery</p><h2>One question at a time</h2></div><span>{tutorStep} / {demoNotebook.tutor.length}</span></div><div className="demo-tutor-thread">{demoNotebook.tutor.slice(0,tutorStep).map((turn,index) => <article key={`${turn.role}-${index}`} className={`demo-turn is-${turn.role}`}><span>{turn.role}</span><p>{turn.text}</p></article>)}</div><div className="demo-tutor-controls"><button type="button" className="btn btn-secondary" disabled={tutorStep <= 1} onClick={() => setTutorStep((value) => Math.max(1,value-1))}>Previous</button><button type="button" className="btn" disabled={tutorStep >= demoNotebook.tutor.length} onClick={() => setTutorStep((value) => Math.min(demoNotebook.tutor.length,value+1))}>Next turn</button>{tutorStep >= demoNotebook.tutor.length ? <button type="button" className="btn" onClick={() => setPanel('review')}>Continue to review</button> : null}</div></section>
            )}

            {panel === 'review' && <section className="demo-reading-panel"><p className="eyebrow">Review decision</p><h2>{scenario.nextAction}</h2><p>{scenario.review}</p><div className="demo-review-reason"><strong>Why this route?</strong><p>{gapCount ? `${gapCount} evidence-linked ${gapLabel} remain.` : 'No material gap remains, so a lighter review is appropriate.'}</p></div><button type="button" className="btn" onClick={() => setPanel('trace')}>Inspect workflow trace</button></section>}

            {panel === 'trace' && <section className="demo-trace-panel"><div className="demo-panel-heading"><div><p className="eyebrow">Execution trace</p><h2>How the route was produced</h2></div><span>{demoNotebook.trace.length} recorded steps</span></div><ol>{demoNotebook.trace.map(([step,detail,status],index) => <li key={step}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{step}</strong><p>{detail}</p></div><em>{status}</em></li>)}</ol></section>}
          </m.div>
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}
