'use client';

import { useState } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { BookOpenCheck, BrainCircuit, GitFork, History, Route, SearchCode } from 'lucide-react';
import { InfoDialog } from '@/components/ui/info-dialog';

const features = [
  {
    id: 'grounding', label: 'Evidence grounding', icon: SearchCode,
    mechanism: 'Every diagnosis keeps source-chunk or concept evidence references.',
    advantage: 'The learner can inspect why a claim was accepted, questioned, or rejected.',
    preview: ['source chunk 04', 'learner claim', 'grounding validator', 'evidence-linked finding'],
  },
  {
    id: 'retrieval', label: 'Hybrid retrieval', icon: BookOpenCheck,
    mechanism: 'Dense and sparse candidates are fused, filtered, reranked, and checked for sufficiency.',
    advantage: 'Exact terminology and conceptual similarity both contribute without mixing workspaces.',
    preview: ['dense candidates', 'sparse candidates', 'rank fusion', 'bounded context'],
  },
  {
    id: 'graph', label: 'Concept graph', icon: GitFork,
    mechanism: 'Evidence-bearing prerequisites, contrasts, and dependencies are traversed within strict bounds.',
    advantage: 'Weak prerequisites become visible instead of appearing as isolated wrong answers.',
    preview: ['active concept', 'prerequisite', 'contrast', 'evidence path'],
  },
  {
    id: 'diagnosis', label: 'Teach-back diagnosis', icon: BrainCircuit,
    mechanism: 'Coverage, omissions, unsupported claims, shallow explanations, and misconceptions remain distinct.',
    advantage: 'The next learning action is based on the type of failure, not a generic score.',
    preview: ['explanation', 'gap classifier', 'mastery evidence', 'next route'],
  },
  {
    id: 'workflow', label: 'Workflow trace', icon: Route,
    mechanism: 'Checkpointed steps record retrieval, tools, validations, retries, and final routing.',
    advantage: 'Failures can be debugged and important decisions can be inspected.',
    preview: ['retrieve', 'validate', 'diagnose', 'persist'],
  },
  {
    id: 'memory', label: 'Review memory', icon: History,
    mechanism: 'Canonical learner records preserve prior evidence, review actions, and tutoring outcomes.',
    advantage: 'Review timing follows demonstrated weakness instead of arbitrary streaks.',
    preview: ['mastery signal', 'review reason', 'tutor outcome', 'next attempt'],
  },
] as const;

export function FeatureExplorer() {
  const [activeId, setActiveId] = useState<(typeof features)[number]['id']>('grounding');
  const active = features.find((feature) => feature.id === activeId) ?? features[0];
  const reduced = useReducedMotion();

  return (
    <div className="feature-explorer">
      <div className="feature-explorer-tabs" role="tablist" aria-label="Tessarion capabilities">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button key={feature.id} type="button" role="tab" aria-selected={active.id === feature.id} onClick={() => setActiveId(feature.id)}>
              <Icon size={17} /><span>{feature.label}</span>
            </button>
          );
        })}
      </div>
      <LazyMotion features={domAnimation} strict>
        <AnimatePresence mode="wait">
          <m.section
            key={active.id}
            className="feature-explorer-panel"
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -10 }}
            transition={{ duration: 0.24 }}
          >
            <div className="feature-explorer-copy">
              <p className="eyebrow">{active.label}</p>
              <h3>{active.mechanism}</h3>
              <p>{active.advantage}</p>
              <InfoDialog
                trigger={<button type="button" className="text-button">How this works</button>}
                title={active.label}
                description="A bounded system responsibility, not a decorative feature."
              >
                <p>{active.mechanism}</p>
                <p><strong>Learner advantage:</strong> {active.advantage}</p>
              </InfoDialog>
            </div>
            <div className="feature-explorer-visual" aria-label={`${active.label} flow`}>
              {active.preview.map((item, index) => (
                <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></div>
              ))}
            </div>
          </m.section>
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}
