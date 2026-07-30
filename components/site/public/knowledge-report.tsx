'use client';

import { useState } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, BookOpenCheck, CircleAlert, CircleCheck, GitBranch, Route } from 'lucide-react';

const views = ['diagnosis', 'graph'] as const;
type ReportView = (typeof views)[number];

export function KnowledgeReport() {
  const reduced = useReducedMotion();
  const [view, setView] = useState<ReportView>('diagnosis');

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className="knowledge-report-stage"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="knowledge-report-panel knowledge-report-switcher">
          <header className="knowledge-report-topline knowledge-report-switcher-header">
            <div><span>Example report</span><strong>Cache hierarchy</strong></div>
            <div className="knowledge-report-view-controls" role="tablist" aria-label="Example report view">
              <button type="button" role="tab" aria-selected={view === 'diagnosis'} className={view === 'diagnosis' ? 'is-active' : undefined} onClick={() => setView('diagnosis')}>Diagnosis</button>
              <button type="button" role="tab" aria-selected={view === 'graph'} className={view === 'graph' ? 'is-active' : undefined} onClick={() => setView('graph')}>Concept path</button>
            </div>
          </header>

          <div className="knowledge-report-swap-stage">
            <AnimatePresence mode="wait" initial={false}>
              {view === 'diagnosis' ? (
                <m.section
                  key="diagnosis"
                  className="knowledge-report-view knowledge-report-detail-card"
                  initial={reduced ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? undefined : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.24 }}
                >
                  <div className="report-detail-summary">
                    <div><p className="eyebrow">Teach-back diagnosis</p><span>Grounded</span></div>
                    <h3>Misconception detected</h3>
                    <blockquote>“Cache is slower because it is smaller.”</blockquote>
                  </div>

                  <div className="report-detail-grid">
                    <article className="report-detail-item is-conflict"><CircleAlert size={17} /><div><span>Contradicted claim</span><strong>The source states that cache is faster and closer to the processor.</strong></div></article>
                    <article className="report-detail-item"><CircleCheck size={17} /><div><span>Covered correctly</span><strong>The learner separated cache from main memory.</strong></div></article>
                    <article className="report-detail-item"><BookOpenCheck size={17} /><div><span>Evidence</span><strong>2 source references support this decision.</strong></div></article>
                  </div>

                  <div className="report-route-card report-route-card-wide"><Route size={18} /><div><span>Selected route</span><strong>Socratic tutoring</strong><small>Repair speed, proximity, and memory hierarchy before the next teach-back.</small></div><ArrowUpRight size={17} /></div>
                  <footer className="report-audit-line"><span>Graph path: 1 hop</span><span>Persistence: validated</span><span>Workflow: 6 steps</span></footer>
                </m.section>
              ) : (
                <m.section
                  key="graph"
                  className="knowledge-report-view knowledge-report-concept-card"
                  initial={reduced ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? undefined : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.24 }}
                >
                  <div className="report-concept-heading"><GitBranch size={17} /><div><p className="eyebrow">Evidence-linked concept path</p><h3>Why the misconception matters</h3></div></div>
                  <div className="report-concept-path" role="img" aria-label="Locality explains cache. Cache contrasts with main memory.">
                    <div className="report-concept-node"><span>01</span><strong>Locality</strong><small>Reuse principle</small></div>
                    <div className="report-concept-edge"><em>explains</em><ArrowDown size={18} /></div>
                    <div className="report-concept-node is-focus"><span>02</span><strong>Cache</strong><small>Selected concept</small></div>
                    <div className="report-concept-edge"><em>contrasts with</em><ArrowDown size={18} /></div>
                    <div className="report-concept-node"><span>03</span><strong>Main memory</strong><small>Slower comparison</small></div>
                  </div>
                  <div className="report-evidence-strip report-evidence-strip-contained"><BookOpenCheck size={16} /><div><strong>Source chunk 04</strong><span>“Cache is closer to the processor and faster than main memory.”</span></div></div>
                </m.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
