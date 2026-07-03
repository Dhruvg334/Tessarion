'use client';

import React from 'react';
import { ConceptGraph } from './concept-graph';
import { WorkspaceGraph } from '@/lib/services/graph';
import { TeachBackPanel } from '../teach-back/teach-back-panel';

interface Props {
  initialGraph: WorkspaceGraph | null;
}

export function WorkspaceGraphViewer({ initialGraph, workspaceId }: Props & { workspaceId: string }) {
  const graph = initialGraph;
  const loading = false;
  const [selectedConcept, setSelectedConcept] = React.useState<{ id: string, name: string, definition?: string } | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full relative">
      <ConceptGraph 
        graph={graph} 
        isLoading={loading} 
        onNodeClick={(node) => setSelectedConcept({ id: node.id, name: node.name, definition: node.definition || undefined })}
      />
      
      {selectedConcept && (
        <TeachBackPanel
          workspaceId={workspaceId}
          conceptId={selectedConcept.id}
          conceptName={selectedConcept.name}
          conceptDefinition={selectedConcept.definition}
          onClose={() => setSelectedConcept(null)}
        />
      )}
    </div>
  );
}
