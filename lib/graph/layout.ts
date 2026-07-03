import { ConceptNode } from '@/types/database';

export function calculateDeterministicLayout(nodes: ConceptNode[]): ConceptNode[] {
  // Simple circular layout
  const radius = Math.max(200, nodes.length * 30);
  const centerX = radius + 50;
  const centerY = radius + 50;
  
  // Sort nodes alphabetically to ensure deterministic positioning
  const sortedNodes = [...nodes].sort((a, b) => a.name.localeCompare(b.name));

  return sortedNodes.map((node, index) => {
    const angle = (index / sortedNodes.length) * 2 * Math.PI;
    return {
      ...node,
      position_x: Math.round(centerX + radius * Math.cos(angle)),
      position_y: Math.round(centerY + radius * Math.sin(angle)),
    };
  });
}
