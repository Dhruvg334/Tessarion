'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, CircleCheck, GitBranch, Search, Sparkles } from 'lucide-react';

export function KnowledgeReport() {
  const reduced = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className="knowledge-report-stage"
        initial={reduced ? false : { opacity: 0, rotate: -1.5, y: 24 }}
        whileInView={reduced ? undefined : { opacity: 1, rotate: -1.1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="knowledge-report-panel">
          <div className="knowledge-report-topline">
            <span>Example diagnosis report</span>
            <span>trace · 6 steps</span>
          </div>
          <div className="knowledge-report-grid">
            <section className="knowledge-report-graph" aria-label="Example concept graph">
              <div className="report-node node-focus"><GitBranch size={15} /><strong>Cache</strong><small>selected concept</small></div>
              <div className="report-node node-a"><strong>Locality</strong><small>explains</small></div>
              <div className="report-node node-b"><strong>Main memory</strong><small>contrasts with</small></div>
              <div className="report-node node-c"><strong>Cache miss</strong><small>depends on</small></div>
              <svg viewBox="0 0 500 270" aria-hidden="true">
                <path d="M115 80 C190 60 245 95 300 125" />
                <path d="M105 205 C180 205 230 170 300 140" />
                <path d="M390 215 C390 180 370 160 335 145" />
              </svg>
            </section>
            <section className="knowledge-report-diagnosis">
              <p className="eyebrow">Teach-back diagnosis</p>
              <h3>Misconception detected</h3>
              <blockquote>“Cache is slower because it is smaller.”</blockquote>
              <div className="report-finding"><Search size={15} /><span><strong>Source conflict</strong> Cache is described as faster and closer to the processor.</span></div>
              <div className="report-finding"><CircleCheck size={15} /><span><strong>Covered well</strong> The learner recognised that cache and main memory serve different roles.</span></div>
              <div className="report-next-action"><Sparkles size={16} /><div><span>Next action</span><strong>Socratic tutoring</strong></div><ArrowUpRight size={16} /></div>
            </section>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
