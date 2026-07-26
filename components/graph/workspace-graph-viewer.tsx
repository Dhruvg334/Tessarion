'use client';

import { useState } from 'react';
import { ConceptGraph } from './concept-graph';
import type { GraphNode, WorkspaceGraph } from '@/lib/services/graph';
import { TeachBackPanel } from '@/components/teach-back/teach-back-panel';

interface Props {
  initialGraph: WorkspaceGraph | null;
  workspaceId: string;
  compact?: boolean;
}

function evidenceLabel(node: GraphNode) {
  const count = node.source_chunk_ids?.length || 0;
  return count === 1 ? '1 evidence chunk' : `${count} evidence chunks`;
}

export function WorkspaceGraphViewer({ initialGraph, workspaceId, compact = false }: Props) {
  const [selectedConcept, setSelectedConcept] = useState<GraphNode | null>(null);
  const [teachBackOpen, setTeachBackOpen] = useState(false);

  return (
    <div className={`workspace-graph-explorer ${selectedConcept ? 'has-selection' : ''} ${compact ? 'is-compact' : ''}`}>
      <ConceptGraph
        graph={initialGraph}
        selectedConceptId={selectedConcept?.id}
        onNodeClick={compact ? undefined : (node) => {
          setSelectedConcept(node);
          setTeachBackOpen(false);
        }}
      />

      {selectedConcept && !compact ? (
        <aside className="concept-inspector" aria-label={`Details for ${selectedConcept.name}`}>
          <div className="concept-inspector-head">
            <div><p className="eyebrow">Selected concept</p><h3>{selectedConcept.name}</h3></div>
            <button type="button" onClick={() => setSelectedConcept(null)} aria-label="Close concept details">×</button>
          </div>
          <p className="concept-inspector-definition">{selectedConcept.definition || 'No definition has been stored for this concept yet.'}</p>
          <dl className="concept-inspector-facts">
            <div><dt>Learning state</dt><dd>{(selectedConcept.mastery?.mastery_level || 'unassessed').replaceAll('_', ' ')}</dd></div>
            <div><dt>Evidence</dt><dd>{evidenceLabel(selectedConcept)}</dd></div>
            <div><dt>Teach-backs</dt><dd>{selectedConcept.teach_back_count || 0}</dd></div>
            <div><dt>Recorded gaps</dt><dd>{selectedConcept.gap_count || 0}</dd></div>
          </dl>
          <div className="concept-inspector-actions">
            <button type="button" className="btn" onClick={() => setTeachBackOpen(true)}>Teach this concept</button>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedConcept(null)}>Return to graph</button>
          </div>
        </aside>
      ) : null}

      {teachBackOpen && selectedConcept && !compact ? (
        <TeachBackPanel
          workspaceId={workspaceId}
          conceptId={selectedConcept.id}
          conceptName={selectedConcept.name}
          conceptDefinition={selectedConcept.definition || undefined}
          onClose={() => setTeachBackOpen(false)}
        />
      ) : null}
    </div>
  );
}
