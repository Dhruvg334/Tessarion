'use client';

import { useEffect, useRef } from 'react';
import type { Core } from 'cytoscape';
import { Minus, Plus, RotateCcw } from 'lucide-react';

import { demoNotebook } from '@/lib/demo/notebook';

export function DemoKnowledgeGraph({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Core | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let disposed = false;

    async function mountGraph() {
      if (!containerRef.current) return;
      const cytoscape = (await import('cytoscape')).default;
      if (disposed || !containerRef.current) return;

      const instance = cytoscape({
        container: containerRef.current,
        elements: [
          ...demoNotebook.concepts.map((concept) => ({ data: { id: concept.id, label: concept.label, level: concept.level } })),
          ...demoNotebook.edges.map(([source, target, relation], index) => ({ data: { id: `demo-edge-${index}`, source, target, label: relation } })),
        ],
        layout: { name: 'breadthfirst', directed: true, padding: 56, spacingFactor: 1.65 },
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)', color: '#292824', 'font-size': '10px', 'font-weight': 'bold',
              'text-wrap': 'wrap', 'text-max-width': '100px', 'text-valign': 'center', 'text-halign': 'center',
              shape: 'round-rectangle', width: '118px', height: '44px', 'background-color': '#fffaf0',
              'border-color': '#8c7b68', 'border-width': '1px',
            },
          },
          { selector: 'node:selected', style: { 'background-color': '#e7d7ad', 'border-color': '#40362c', 'border-width': '3px' } },
          {
            selector: 'edge',
            style: {
              width: 1, 'line-color': '#9a8a72', 'target-arrow-color': '#9a8a72',
              'target-arrow-shape': 'triangle', 'curve-style': 'bezier', label: 'data(label)', color: '#4f453b',
              'font-size': '8px', 'font-weight': 'bold', 'text-rotation': 'autorotate', 'text-margin-y': -9,
              'text-background-color': '#fbf7e8', 'text-background-opacity': 1, 'text-background-padding': '4px',
              'text-background-shape': 'roundrectangle', 'text-border-color': '#d8cfb3', 'text-border-width': 1,
              'text-border-opacity': 1,
            },
          },
        ],
        minZoom: 0.35,
        maxZoom: 2.5,
        boxSelectionEnabled: false,
      });

      instance.on('tap', 'node', (event) => onSelectRef.current(event.target.id()));
      instanceRef.current = instance;
      instance.fit(undefined, 44);
    }

    void mountGraph();
    return () => { disposed = true; instanceRef.current?.destroy(); instanceRef.current = null; };
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    instance.nodes().unselect();
    const selected = instance.$id(selectedId);
    if (selected.empty()) return;
    selected.select();
    instance.animate({ center: { eles: selected }, zoom: Math.max(instance.zoom(), 0.8) }, { duration: 260 });
  }, [selectedId]);

  return (
    <div className="demo-graph-framework">
      <div className="demo-graph-toolbar" aria-label="Knowledge graph controls">
        <button type="button" onClick={() => instanceRef.current?.zoom(Math.min((instanceRef.current?.zoom() ?? 1) + 0.2, 2.5))} aria-label="Zoom in"><Plus size={16} /></button>
        <button type="button" onClick={() => instanceRef.current?.zoom(Math.max((instanceRef.current?.zoom() ?? 1) - 0.2, 0.35))} aria-label="Zoom out"><Minus size={16} /></button>
        <button type="button" onClick={() => instanceRef.current?.fit(undefined, 44)} aria-label="Fit graph"><RotateCcw size={16} /></button>
      </div>
      <div ref={containerRef} className="demo-graph-framework-canvas" role="img" aria-label="Interactive computer architecture concept graph" />
    </div>
  );
}
