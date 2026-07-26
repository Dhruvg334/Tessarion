'use client';

import { useMemo, useState } from 'react';
import type { GraphNode, WorkspaceGraph } from '@/lib/services/graph';

interface ConceptGraphProps {
  graph: WorkspaceGraph | null;
  isLoading?: boolean;
  selectedConceptId?: string | null;
  onNodeClick?: (node: GraphNode) => void;
}

type GraphFilter = 'all' | 'unassessed' | 'review' | 'understood';

function masteryLabel(node: GraphNode) {
  return node.mastery?.mastery_level?.replaceAll('_', ' ') || 'unassessed';
}

function matchesFilter(node: GraphNode, filter: GraphFilter) {
  const state = node.mastery?.mastery_level || 'unassessed';
  if (filter === 'all') return true;
  if (filter === 'unassessed') return state === 'unassessed' || state === 'insufficient_evidence';
  if (filter === 'understood') return state === 'understood';
  return ['misconception', 'needs_review', 'weak_connection', 'partial', 'emerging'].includes(state);
}

export function ConceptGraph({ graph, isLoading, selectedConceptId, onNodeClick }: ConceptGraphProps) {
  const [filter, setFilter] = useState<GraphFilter>('all');
  const visibleNodeIds = useMemo(
    () => new Set((graph?.nodes || []).filter((node) => matchesFilter(node, filter)).map((node) => node.id)),
    [filter, graph],
  );

  if (isLoading) {
    return <div className="concept-graph-empty"><strong>Mapping concepts…</strong><span>Preparing the evidence-linked graph.</span></div>;
  }

  if (!graph || graph.nodes.length === 0) {
    return <div className="concept-graph-empty"><strong>No graph yet</strong><span>Add source material and build concepts to create the first structure.</span></div>;
  }

  return (
    <section className="concept-graph-shell" aria-label="Knowledge graph">
      <header className="concept-graph-toolbar">
        <div>
          <p className="eyebrow">Graph controls</p>
          <h3>{graph.nodes.length} concepts · {graph.edges.length} relationships</h3>
        </div>
        <div className="concept-graph-filters" aria-label="Filter concepts">
          {(['all', 'unassessed', 'review', 'understood'] as GraphFilter[]).map((value) => (
            <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>
              {value === 'all' ? 'All' : value === 'review' ? 'Needs attention' : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="concept-graph-canvas">
        <svg className="concept-graph-edges" aria-hidden="true">
          <defs>
            <marker id="tessarion-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <path d="M0,0 L9,3.5 L0,7 Z" fill="var(--pencil)" />
            </marker>
          </defs>
          {graph.edges.map((edge) => {
            if (!visibleNodeIds.has(edge.source_node_id) || !visibleNodeIds.has(edge.target_node_id)) return null;
            const source = graph.nodes.find((node) => node.id === edge.source_node_id);
            const target = graph.nodes.find((node) => node.id === edge.target_node_id);
            if (!source || !target) return null;
            const directed = edge.relationship_type === 'prerequisite' || edge.relationship_type === 'causal';
            return (
              <line
                key={edge.id}
                x1={source.position_x || 0}
                y1={source.position_y || 0}
                x2={target.position_x || 0}
                y2={target.position_y || 0}
                className={`concept-edge concept-edge-${edge.relationship_type || 'related'}`}
                markerEnd={directed ? 'url(#tessarion-arrow)' : undefined}
              />
            );
          })}
        </svg>

        {graph.nodes.map((node) => {
          if (!visibleNodeIds.has(node.id)) return null;
          const selected = selectedConceptId === node.id;
          const state = node.mastery?.mastery_level || 'unassessed';
          return (
            <button
              type="button"
              key={node.id}
              className={`concept-node concept-node-${state} ${selected ? 'is-selected' : ''}`}
              style={{ left: node.position_x || 0, top: node.position_y || 0 }}
              onClick={() => onNodeClick?.(node)}
              aria-pressed={selected}
              title={node.definition || node.name}
            >
              <strong>{node.name}</strong>
              <span>{masteryLabel(node)}</span>
            </button>
          );
        })}

        {visibleNodeIds.size === 0 ? (
          <div className="concept-graph-filter-empty">No concepts match this filter.</div>
        ) : null}
      </div>

      <footer className="concept-graph-legend">
        <span><i className="legend-solid" /> understood</span>
        <span><i className="legend-dashed" /> needs attention</span>
        <span><i className="legend-dotted" /> unassessed</span>
        <span><i className="legend-line" /> evidence-linked relationship</span>
      </footer>
    </section>
  );
}
