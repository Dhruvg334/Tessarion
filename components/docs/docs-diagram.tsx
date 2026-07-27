'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Core } from 'cytoscape';
import { Maximize2, Minus, Plus, RotateCcw, Tags } from 'lucide-react';
import { InfoDialog } from '@/components/ui/info-dialog';

export type DocsDiagramNode = { id: string; label: string; group?: 'primary' | 'derived' | 'workflow' | 'evidence' };
export type DocsDiagramEdge = { source: string; target: string; label?: string };
export type DocsDiagramSpec = { title: string; description: string; nodes: DocsDiagramNode[]; edges: DocsDiagramEdge[] };

export function DocsDiagram({ spec }: { spec: DocsDiagramSpec }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Core | null>(null);
  const instanceId = useId();
  const [loading, setLoading] = useState(true);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let disposed = false;

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
        layout: { name: 'breadthfirst', directed: true, padding: 52, spacingFactor: 1.45 },
        style: [
          { selector: 'node', style: { 'background-color': '#fbf4dc', 'border-color': '#8b816b', 'border-width': '1px', color: '#2b2924', label: 'data(label)', 'font-family': 'system-ui, sans-serif', 'font-size': '12px', 'font-weight': 'bold', 'text-wrap': 'wrap', 'text-max-width': '126px', 'text-valign': 'center', 'text-halign': 'center', shape: 'round-rectangle', width: '150px', height: '56px' } },
          { selector: 'node[group = "derived"]', style: { 'background-color': '#efe3bd', 'border-style': 'dashed' } },
          { selector: 'node[group = "workflow"]', style: { 'background-color': '#e3d3a6', 'border-width': '2px' } },
          { selector: 'node[group = "evidence"]', style: { 'background-color': '#fffaf0' } },
          { selector: 'edge', style: { width: '1.4px', 'line-color': '#8f826a', 'target-arrow-color': '#8f826a', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', label: 'data(label)', color: '#655b4d', 'font-size': '9px', 'font-weight': 'bold', 'text-rotation': 'autorotate', 'text-margin-y': '-9px', 'text-background-color': '#fbf7e8', 'text-background-opacity': 1, 'text-background-padding': '4px', 'text-background-shape': 'roundrectangle', 'text-border-color': '#d8cfb3', 'text-border-width': '1px', 'text-border-opacity': 1 } },
        ],
        minZoom: 0.45,
        maxZoom: 2.3,
        userPanningEnabled: true,
        userZoomingEnabled: true,
        boxSelectionEnabled: false,
      });

      instanceRef.current = instance;
      instance.fit(undefined, 52);
      setLoading(false);
    }

    void renderDiagram();
    return () => { disposed = true; instanceRef.current?.destroy(); instanceRef.current = null; };
  }, [instanceId, spec]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    instance.style().selector('edge').style('label', labelsVisible ? 'data(label)' : '').update();
  }, [labelsVisible]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    requestAnimationFrame(() => { instance.resize(); instance.fit(undefined, fullscreen ? 72 : 52); });
  }, [fullscreen]);

  const controls = (
    <div className="docs-diagram-controls" aria-label="Diagram controls">
      <button type="button" onClick={() => instanceRef.current?.zoom({ level: Math.min((instanceRef.current?.zoom() ?? 1) + 0.2, 2.3), renderedPosition: { x: 220, y: 170 } })} aria-label="Zoom in"><Plus size={16} /></button>
      <button type="button" onClick={() => instanceRef.current?.zoom({ level: Math.max((instanceRef.current?.zoom() ?? 1) - 0.2, 0.45), renderedPosition: { x: 220, y: 170 } })} aria-label="Zoom out"><Minus size={16} /></button>
      <button type="button" onClick={() => instanceRef.current?.fit(undefined, 52)} aria-label="Fit diagram"><RotateCcw size={16} /></button>
      <button type="button" onClick={() => setLabelsVisible((value) => !value)} aria-pressed={labelsVisible} aria-label="Toggle edge labels"><Tags size={16} /></button>
      <button type="button" onClick={() => setFullscreen((value) => !value)} aria-pressed={fullscreen} aria-label="Toggle full screen"><Maximize2 size={16} /></button>
    </div>
  );

  return (
    <figure className={`docs-diagram ${fullscreen ? 'is-fullscreen' : ''}`}>
      <figcaption>
        <div><strong>{spec.title}</strong><span>{spec.description}</span></div>
        <InfoDialog trigger={<button type="button" className="text-button">Read figure</button>} title={spec.title} description={spec.description}>
          <p>This interactive diagram can be panned, zoomed, fitted, and viewed without edge labels. Node colour indicates canonical, derived, workflow, or evidence responsibility.</p>
        </InfoDialog>
      </figcaption>
      {controls}
      <div className="docs-diagram-stage">
        {loading ? <div className="diagram-skeleton" aria-label="Loading diagram"><span /><span /><span /></div> : null}
        <div ref={containerRef} className="docs-diagram-canvas" role="img" aria-label={`${spec.title}. ${spec.description}`} />
      </div>
    </figure>
  );
}
