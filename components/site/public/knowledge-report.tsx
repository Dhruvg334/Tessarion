'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BookOpenCheck, CircleAlert, CircleCheck, GitBranch, Route } from 'lucide-react';

const graphSteps = [
  { label: 'Locality', detail: 'reuse principle', tone: 'plain' },
  { label: 'Cache', detail: 'selected concept', tone: 'focus' },
  { label: 'Main memory', detail: 'slower comparison', tone: 'plain' },
] as const;

export function KnowledgeReport() {
  const reduced = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className="knowledge-report-stage"
        initial={reduced ? false : { opacity: 0, rotate: -0.8, y: 18 }}
        whileInView={reduced ? undefined : { opacity: 1, rotate: -0.45, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="knowledge-report-panel knowledge-report-panel-upgraded">
          <header className="knowledge-report-topline">
            <div><span>Example report</span><strong>Cache hierarchy</strong></div>
            <div><span>workflow</span><strong>6 validated steps</strong></div>
          </header>

          <div className="knowledge-report-grid knowledge-report-grid-upgraded">
            <section className="knowledge-report-graph knowledge-report-graph-upgraded" aria-label="Example evidence-linked concept graph">
              <div className="report-graph-heading">
                <GitBranch size={16} />
                <div><strong>Concept structure</strong><span>Two evidence-bearing relationships</span></div>
              </div>

              <div className="report-graph-flow" role="img" aria-label="Locality explains cache. Cache contrasts with main memory.">
                {graphSteps.map((step, index) => (
                  <div className="report-graph-flow-item" key={step.label}>
                    <div className={`report-graph-flow-node${step.tone === 'focus' ? ' is-focus' : ''}`}>
                      <strong>{step.label}</strong>
                      <span>{step.detail}</span>
                    </div>
                    {index < graphSteps.length - 1 ? (
                      <div className="report-graph-flow-edge" aria-hidden="true">
                        <span>{index === 0 ? 'explains' : 'contrasts with'}</span>
                        <ArrowRight size={18} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="report-evidence-strip">
                <BookOpenCheck size={15} />
                <div>
                  <strong>Source chunk 04</strong>
                  <span>“Cache is closer to the processor and faster than main memory.”</span>
                </div>
              </div>
            </section>

            <section className="knowledge-report-diagnosis knowledge-report-diagnosis-upgraded">
              <div className="report-diagnosis-heading"><p className="eyebrow">Teach-back diagnosis</p><span>Grounded</span></div>
              <h3>Misconception detected</h3>
              <blockquote>“Cache is slower because it is smaller.”</blockquote>
              <div className="report-finding is-conflict"><CircleAlert size={15} /><span><strong>Contradicted claim</strong><em>The source states that cache is faster and closer to the processor.</em></span></div>
              <div className="report-finding"><CircleCheck size={15} /><span><strong>Covered correctly</strong><em>The learner separated cache from main memory.</em></span></div>
              <div className="report-route-card"><Route size={17} /><div><span>Selected route</span><strong>Socratic tutoring</strong><small>Repair speed, proximity, and memory hierarchy.</small></div><ArrowUpRight size={16} /></div>
              <footer className="report-audit-line"><span>Evidence: 2 references</span><span>Graph path: 1 hop</span><span>Persistence: validated</span></footer>
            </section>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
