'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpenCheck, CircleAlert, CircleCheck, GitBranch, Route } from 'lucide-react';

const graphNodes = [
  { label: 'Locality', detail: 'principle', className: 'node-locality' },
  { label: 'Cache', detail: 'selected concept', className: 'node-cache' },
  { label: 'Main memory', detail: 'contrast', className: 'node-memory' },
] as const;

export function KnowledgeReport() {
  const reduced = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className="knowledge-report-stage"
        initial={reduced ? false : { opacity: 0, rotate: -1.2, y: 22 }}
        whileInView={reduced ? undefined : { opacity: 1, rotate: -0.8, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="knowledge-report-panel knowledge-report-panel-upgraded">
          <header className="knowledge-report-topline">
            <div><span>Example report</span><strong>Cache hierarchy</strong></div>
            <div><span>workflow</span><strong>6 validated steps</strong></div>
          </header>

          <div className="knowledge-report-grid knowledge-report-grid-upgraded">
            <section className="knowledge-report-graph knowledge-report-graph-upgraded" aria-label="Example evidence-linked concept graph">
              <div className="report-graph-heading"><GitBranch size={16} /><div><strong>Concept structure</strong><span>Evidence-bearing relationships</span></div></div>
              <div className="report-graph-canvas report-graph-canvas-simplified">
                <svg className="report-graph-links" viewBox="0 0 620 320" role="img" aria-label="Locality explains cache. Cache contrasts with main memory.">
                  <defs><marker id="report-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" /></marker></defs>
                  <path d="M165 86 C230 94 276 125 315 158" markerEnd="url(#report-arrow)" />
                  <path d="M355 185 C425 214 470 240 514 267" markerEnd="url(#report-arrow)" />
                  <g className="report-edge-label"><rect x="220" y="96" width="66" height="22" rx="8" /><text x="253" y="111">explains</text></g>
                  <g className="report-edge-label"><rect x="403" y="218" width="100" height="22" rx="8" /><text x="453" y="233">contrasts with</text></g>
                </svg>
                {graphNodes.map((node) => <div key={node.label} className={`report-graph-node ${node.className}`}><strong>{node.label}</strong><span>{node.detail}</span></div>)}
              </div>
              <div className="report-evidence-strip"><BookOpenCheck size={15} /><div><strong>Source chunk 04</strong><span>“Cache is closer to the processor and faster than main memory.”</span></div></div>
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
