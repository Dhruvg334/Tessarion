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
      <div className="w-full h-96 flex items-center justify-center rounded" style={{ border: '1px dashed var(--line)', backgroundColor: 'var(--paper)' }}>
        <p className="font-handwritten text-xl animate-pulse" style={{ color: 'var(--muted)' }}>Mapping concepts...</p>
      </div>
    );
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center rounded" style={{ border: '1px dashed var(--line-strong)', backgroundColor: 'var(--paper)' }}>
        <p className="font-handwritten text-xl mb-4" style={{ color: 'var(--muted)' }}>The graph is empty.</p>
        <p className="text-sm max-w-sm text-center" style={{ color: 'var(--muted)' }}>
          Upload source materials and extract concepts to begin generating your knowledge graph.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded overflow-hidden shadow-inner" style={{ border: '1px solid var(--line)', backgroundColor: 'var(--paper)' }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--muted)" />
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
              stroke="var(--line-strong)"
              strokeWidth="2"
              strokeDasharray={edge.relationship_type === 'related' ? '4 4' : 'none'}
              markerEnd={isDirected ? "url(#arrowhead)" : ""}
            />
          );
        })}
      </svg>
      
      {graph.nodes.map(node => {
        const isLowConfidence = (node.confidence_score || 0) < 0.7;
        const masteryLevel = (node as any).mastery?.mastery_level || 'unassessed';
        
        let bgColor = 'var(--white)';
        let borderColor = 'var(--line)';
        let borderStyle = 'solid';
        let borderWidth = '1px';
        let textColor = 'var(--ink)';
        let fontWeight = '500';

        if (masteryLevel === 'understood') {
          borderWidth = '2px';
          borderColor = 'var(--ink)';
          fontWeight = '700';
        } else if (masteryLevel === 'misconception') {
          bgColor = 'var(--ink)';
          textColor = 'var(--cream)';
          borderColor = 'var(--ink)';
        } else if (masteryLevel === 'needs_review' || masteryLevel === 'weak_connection') {
          borderStyle = 'dashed';
          borderColor = 'var(--ink)';
          borderWidth = '2px';
        } else if (masteryLevel === 'unassessed' || masteryLevel === 'insufficient_evidence') {
          borderStyle = 'dotted';
        }

        if (isLowConfidence && masteryLevel === 'unassessed') {
          bgColor = 'var(--cream)';
          borderStyle = 'dashed';
          borderColor = 'var(--line-strong)';
        }
        
        return (
          <div
            key={node.id}
            className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-105`}
            style={{ left: node.position_x || 0, top: node.position_y || 0 }}
            title={`${node.name}\nMastery: ${masteryLevel.replace('_', ' ')}\n${node.definition || ''}`}
            onClick={() => onNodeClick?.(node)}
          >
            <div 
              className="px-4 py-2 rounded-full shadow-sm text-sm"
              style={{
                backgroundColor: bgColor,
                border: `${borderWidth} ${borderStyle} ${borderColor}`,
                color: textColor,
                fontWeight: fontWeight
              }}
            >
              {node.name}
            </div>
            {isLowConfidence && <span className="text-[10px] mt-1 font-bold" style={{ color: 'var(--ink)' }}>REVIEW NEEDED</span>}
            {masteryLevel !== 'unassessed' && masteryLevel !== 'insufficient_evidence' && (
              <span className="text-[10px] mt-1 uppercase" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>
                {masteryLevel.replace('_', ' ')}
              </span>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-4 right-4 p-4 rounded shadow-sm text-xs font-mono" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
        <p className="font-bold mb-1" style={{ color: 'var(--ink)' }}>Graph Metrics</p>
        <p>Nodes: {graph.metrics.nodeCount}</p>
        <p>Edges: {graph.metrics.edgeCount}</p>
        <p>Grounding: {(graph.metrics.sourceGroundingRate * 100).toFixed(0)}%</p>
        <p>Avg Conf: {(graph.metrics.averageConceptConfidence * 100).toFixed(0)}%</p>
        {graph.metrics.isolatedNodeCount > 0 && <p style={{ fontWeight: 600, color: 'var(--ink)' }}>Isolated: {graph.metrics.isolatedNodeCount}</p>}
      </div>
    </div>
  );
}
