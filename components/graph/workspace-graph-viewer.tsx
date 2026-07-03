'use client';

import React, { useState, useEffect } from 'react';
import { ConceptGraph } from './concept-graph';
import { WorkspaceGraph } from '@/lib/services/graph';
import { ConceptExtractionResult } from '@/lib/ai/types';

interface Props {
  workspaceId: string;
}

export function WorkspaceGraphViewer({ workspaceId }: Props) {
  const [graph, setGraph] = useState<WorkspaceGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [lastResult, setLastResult] = useState<ConceptExtractionResult | null>(null);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/graph`);
      if (res.ok) {
        const data = await res.json();
        setGraph(data.graph);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [workspaceId]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <ConceptGraph graph={graph} isLoading={loading || extracting} />
      
      {lastResult && (
        <div className="card text-sm p-4 bg-white">
          <p className="font-bold mb-2 text-gray-800">Latest Extraction Summary</p>
          <ul className="list-disc pl-5 text-gray-600 mb-2 space-y-1">
            <li>Status: {lastResult.status}</li>
            <li>Provider: {lastResult.providerUsed} {lastResult.fallbackUsed && '(Fallback)'}</li>
            <li>Concepts: {lastResult.summary.acceptedConcepts} accepted, {lastResult.summary.rejectedConcepts} rejected, {lastResult.summary.lowConfidenceConcepts} low confidence</li>
            <li>Relationships: {lastResult.summary.acceptedRelationships} accepted, {lastResult.summary.rejectedRelationships} rejected</li>
          </ul>
          {lastResult.warnings.length > 0 && (
            <div className="mt-2 text-orange-600">
              <p className="font-semibold">Warnings:</p>
              <ul className="list-disc pl-5">
                {lastResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
