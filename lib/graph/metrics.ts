import { ConceptNode, ConceptEdge } from '@/types/database';

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  isolatedNodeCount: number;
  weaklyConnectedCount: number;
  averageConceptConfidence: number;
  averageRelationshipConfidence: number;
  sourceGroundingRate: number;
  relationshipDistribution: Record<string, number>;
}

export function calculateGraphMetrics(nodes: ConceptNode[], edges: ConceptEdge[]): GraphMetrics {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  
  // Density: E / (V * (V - 1)) for directed graph
  const maxEdges = nodeCount > 1 ? nodeCount * (nodeCount - 1) : 1;
  const density = nodeCount > 1 ? edgeCount / maxEdges : 0;

  const connectedNodes = new Set<string>();
  const relationshipDistribution: Record<string, number> = {
    prerequisite: 0,
    related: 0,
    contrasts: 0,
    causal: 0,
  };

  let totalRelConf = 0;
  for (const edge of edges) {
    connectedNodes.add(edge.source_node_id);
    connectedNodes.add(edge.target_node_id);
    if (edge.relationship_type) {
      relationshipDistribution[edge.relationship_type] = (relationshipDistribution[edge.relationship_type] || 0) + 1;
    }
    totalRelConf += edge.confidence_score || 0;
  }

  const isolatedNodeCount = nodeCount - connectedNodes.size;

  // For this simplified version, "weakly connected" will just mean degree = 1
  const degreeMap = new Map<string, number>();
  for (const edge of edges) {
    degreeMap.set(edge.source_node_id, (degreeMap.get(edge.source_node_id) || 0) + 1);
    degreeMap.set(edge.target_node_id, (degreeMap.get(edge.target_node_id) || 0) + 1);
  }
  let weaklyConnectedCount = 0;
  for (const degree of degreeMap.values()) {
    if (degree === 1) weaklyConnectedCount++;
  }

  let totalNodeConf = 0;
  let groundedNodeCount = 0;
  for (const node of nodes) {
    totalNodeConf += node.confidence_score || 0;
    if (node.source_chunk_ids && node.source_chunk_ids.length > 0) {
      groundedNodeCount++;
    }
  }

  const averageConceptConfidence = nodeCount > 0 ? totalNodeConf / nodeCount : 0;
  const averageRelationshipConfidence = edgeCount > 0 ? totalRelConf / edgeCount : 0;
  const sourceGroundingRate = nodeCount > 0 ? groundedNodeCount / nodeCount : 0;

  return {
    nodeCount,
    edgeCount,
    density,
    isolatedNodeCount,
    weaklyConnectedCount,
    averageConceptConfidence,
    averageRelationshipConfidence,
    sourceGroundingRate,
    relationshipDistribution,
  };
}
