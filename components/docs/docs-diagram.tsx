'use client';

import { useEffect, useId, useRef } from 'react';

export type DocsDiagramNode = {
  id: string;
  label: string;
  group?: 'primary' | 'derived' | 'workflow' | 'evidence';
};

export type DocsDiagramEdge = {
  source: string;
  target: string;
  label?: string;
};

export type DocsDiagramSpec = {
  title: string;
  description: string;
  nodes: DocsDiagramNode[];
  edges: DocsDiagramEdge[];
};

export function DocsDiagram({ spec }: { spec: DocsDiagramSpec }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;

    async function renderDiagram() {
      if (!containerRef.current) return;
      const cytoscape = (await import('cytoscape')).default;
      if (disposed || !containerRef.current) return;

      const instance = cytoscape({
        container: containerRef.current,
        elements: [
          ...spec.nodes.map((node) => ({ data: { id: node.id, label: node.label, group: node.group ?? 'primary' } })),
          ...spec.edges.map((edge, index) => ({ data: { id: `${instanceId}-edge-${index}`, source: edge.source, target: edge.target, label: edge.label ?? '' } })),
        ],
        layout: { name: 'breadthfirst', directed: true, padding: 28, spacingFactor: 1.15 },
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#fbf4dc',
              'border-color': '#8b816b',
              'border-width': '1px',
              color: '#2b2924',
              label: 'data(label)',
              'font-family': 'system-ui, sans-serif',
              'font-size': '11px',
              'font-weight': 650,
              'text-wrap': 'wrap',
              'text-max-width': '110px',
              'text-valign': 'center',
              'text-halign': 'center',
              shape: 'round-rectangle',
              width: '132px',
              height: '48px',
            },
          },
          { selector: 'node[group = "derived"]', style: { 'background-color': '#f1e8ca', 'border-style': 'dashed' } },
          { selector: 'node[group = "workflow"]', style: { 'background-color': '#e9dfbf', 'border-width': '2px' } },
          { selector: 'node[group = "evidence"]', style: { 'background-color': '#fffaf0' } },
          {
            selector: 'edge',
            style: {
              width: '1.2px',
              'line-color': '#9e937a',
              'target-arrow-color': '#9e937a',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              label: 'data(label)',
              color: '#6f685c',
              'font-size': '9px',
              'text-background-color': '#fbf7e8',
              'text-background-opacity': 0.94,
              'text-background-padding': '3px',
            },
          },
        ],
        minZoom: 0.65,
        maxZoom: 1.6,
        wheelSensitivity: 0.18,
        userPanningEnabled: true,
        userZoomingEnabled: true,
        boxSelectionEnabled: false,
      });

      destroy = () => instance.destroy();
    }

    void renderDiagram();
    return () => {
      disposed = true;
      destroy?.();
    };
  }, [instanceId, spec]);

  return (
    <figure className="docs-diagram">
      <figcaption>
        <strong>{spec.title}</strong>
        <span>{spec.description}</span>
      </figcaption>
      <div ref={containerRef} className="docs-diagram-canvas" role="img" aria-label={`${spec.title}. ${spec.description}`} />
    </figure>
  );
}
