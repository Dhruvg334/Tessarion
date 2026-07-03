'use client';

import React from 'react';
import { WorkspaceGraph } from '@/lib/services/graph';

interface ConceptGraphProps {
  graph: WorkspaceGraph | null;
  isLoading?: boolean;
  selectedConceptId?: string | null;
  onNodeClick?: (node: { id: string; name: string; definition?: string | null }) => void;
}

export function ConceptGraph({ graph, isLoading, onNodeClick }: ConceptGraphProps) {
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center border border-dashed border-gray-300 rounded bg-[#fcfbf9]">
        <p className="text-gray-500 font-handwritten text-xl animate-pulse">Mapping concepts...</p>
      </div>
    );
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded bg-[#fcfbf9]">
        <p className="text-gray-500 font-handwritten text-xl mb-4">The graph is empty.</p>
        <p className="text-gray-400 text-sm max-w-sm text-center">
          Upload source materials and extract concepts to begin generating your knowledge graph.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] border border-gray-200 rounded overflow-hidden bg-[#fcfbf9] shadow-inner">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>
        {graph.edges.map(edge => {
          const source = graph.nodes.find(n => n.id === edge.source_node_id);
          const target = graph.nodes.find(n => n.id === edge.target_node_id);
          if (!source || !target) return null;

          const isDirected = edge.relationship_type === 'prerequisite' || edge.relationship_type === 'causal';

          return (
            <line
              key={edge.id}
              x1={source.position_x || 0}
              y1={source.position_y || 0}
              x2={target.position_x || 0}
              y2={target.position_y || 0}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray={edge.relationship_type === 'related' ? '4 4' : 'none'}
              markerEnd={isDirected ? "url(#arrowhead)" : ""}
            />
          );
        })}
      </svg>
      
      {graph.nodes.map(node => {
        const isLowConfidence = (node.confidence_score || 0) < 0.7;
        
        return (
          <div
            key={node.id}
            className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-105`}
            style={{ left: node.position_x || 0, top: node.position_y || 0 }}
            title={node.definition || node.name}
            onClick={() => onNodeClick?.(node)}
          >
            <div className={`
              px-4 py-2 rounded-full shadow-sm text-sm font-medium border
              ${isLowConfidence ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-white border-gray-300 text-gray-800'}
            `}>
              {node.name}
            </div>
            {isLowConfidence && <span className="text-[10px] text-orange-600 mt-1">Review Needed</span>}
          </div>
        );
      })}

      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-4 rounded border border-gray-200 shadow-sm text-xs text-gray-600 font-mono">
        <p className="font-bold text-gray-800 mb-1">Graph Metrics</p>
        <p>Nodes: {graph.metrics.nodeCount}</p>
        <p>Edges: {graph.metrics.edgeCount}</p>
        <p>Grounding: {(graph.metrics.sourceGroundingRate * 100).toFixed(0)}%</p>
        <p>Avg Conf: {(graph.metrics.averageConceptConfidence * 100).toFixed(0)}%</p>
        {graph.metrics.isolatedNodeCount > 0 && <p className="text-amber-600">Isolated: {graph.metrics.isolatedNodeCount}</p>}
      </div>
    </div>
  );
}
