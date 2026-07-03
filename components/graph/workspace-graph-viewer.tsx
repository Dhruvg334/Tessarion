'use client';

import React from 'react';
import { ConceptGraph } from './concept-graph';
import { WorkspaceGraph } from '@/lib/services/graph';
// unused imports removed

interface Props {
  initialGraph: WorkspaceGraph | null;
}

export function WorkspaceGraphViewer({ initialGraph }: Props) {
  const graph = initialGraph;
  const loading = false;

  return (
    <div className="flex flex-col gap-4 w-full">
      <ConceptGraph graph={graph} isLoading={loading} />
    </div>
  );
}
