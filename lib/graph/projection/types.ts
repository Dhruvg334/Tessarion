import type { ConceptEdge, ConceptNode } from '@/types/database';

export const GRAPH_RELATIONSHIP_TYPES = ['prerequisite', 'related', 'contrasts', 'causal'] as const;
export type GraphRelationshipType = (typeof GRAPH_RELATIONSHIP_TYPES)[number];

export interface GraphProjectionNode {
  id: string;
  workspaceId: string;
  name: string;
  definition?: string;
  sourceChunkIds: string[];
  clusterLabel?: string;
  dependencyDepth?: number;
  updatedAt: string;
}

export interface GraphProjectionEdge {
  id: string;
  workspaceId: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType: GraphRelationshipType;
  strength: number;
  confidence: number;
  sourceChunkIds: string[];
  description?: string;
  createdAt: string;
}

export interface WorkspaceGraphProjection {
  workspaceId: string;
  version: string;
  generatedAt: string;
  nodes: GraphProjectionNode[];
  edges: GraphProjectionEdge[];
}

export type GraphTraversalDirection = 'outgoing' | 'incoming' | 'both';

export interface GraphTraversalQuery {
  workspaceId: string;
  seedConceptIds: string[];
  relationshipTypes?: GraphRelationshipType[];
  direction?: GraphTraversalDirection;
  maxDepth?: number;
  maxNodes?: number;
  minimumConfidence?: number;
}

export interface GraphTraversalPath {
  conceptIds: string[];
  edgeIds: string[];
  relationshipTypes: GraphRelationshipType[];
  depth: number;
  score: number;
  evidenceChunkIds: string[];
}

export interface GraphTraversalResult {
  workspaceId: string;
  seedConceptIds: string[];
  nodes: GraphProjectionNode[];
  edges: GraphProjectionEdge[];
  paths: GraphTraversalPath[];
  truncated: boolean;
  diagnostics: {
    visitedNodes: number;
    visitedEdges: number;
    maxDepth: number;
    maxNodes: number;
    rejectedCrossWorkspaceEdges: number;
    rejectedUngroundedEdges: number;
  };
}

export interface GraphProjectionValidationResult {
  projection: WorkspaceGraphProjection;
  rejectedEdges: Array<{ edgeId: string; reason: string }>;
}

export interface GraphProjectionStore {
  replaceWorkspaceProjection(projection: WorkspaceGraphProjection): Promise<void>;
  traverse(query: GraphTraversalQuery): Promise<GraphTraversalResult>;
  deleteWorkspaceProjection(workspaceId: string): Promise<void>;
}

function relationshipTypeOrNull(value: ConceptEdge['relationship_type']): GraphRelationshipType | null {
  return value && GRAPH_RELATIONSHIP_TYPES.includes(value) ? value : null;
}

export function buildWorkspaceGraphProjection(
  workspaceId: string,
  nodes: ConceptNode[],
  edges: ConceptEdge[],
  version: string,
  now: string = new Date().toISOString(),
): GraphProjectionValidationResult {
  const nodeIds = new Set(nodes.filter((node) => node.workspace_id === workspaceId).map((node) => node.id));
  const rejectedEdges: Array<{ edgeId: string; reason: string }> = [];

  const projectedNodes: GraphProjectionNode[] = nodes
    .filter((node) => node.workspace_id === workspaceId)
    .map((node) => ({
      id: node.id,
      workspaceId,
      name: node.name,
      definition: node.definition ?? undefined,
      sourceChunkIds: [...node.source_chunk_ids],
      clusterLabel: node.cluster_label ?? undefined,
      dependencyDepth: node.dependency_depth ?? undefined,
      updatedAt: node.updated_at,
    }));

  const projectedEdges: GraphProjectionEdge[] = [];
  for (const edge of edges) {
    if (edge.workspace_id !== workspaceId) {
      rejectedEdges.push({ edgeId: edge.id, reason: 'CROSS_WORKSPACE_EDGE' });
      continue;
    }
    if (!nodeIds.has(edge.source_node_id) || !nodeIds.has(edge.target_node_id)) {
      rejectedEdges.push({ edgeId: edge.id, reason: 'MISSING_ENDPOINT' });
      continue;
    }
    if (edge.source_node_id === edge.target_node_id) {
      rejectedEdges.push({ edgeId: edge.id, reason: 'SELF_EDGE' });
      continue;
    }
    const relationshipType = relationshipTypeOrNull(edge.relationship_type);
    if (!relationshipType) {
      rejectedEdges.push({ edgeId: edge.id, reason: 'UNSUPPORTED_RELATIONSHIP' });
      continue;
    }
    if (edge.source_chunk_ids.length === 0) {
      rejectedEdges.push({ edgeId: edge.id, reason: 'UNGROUNDED_EDGE' });
      continue;
    }

    projectedEdges.push({
      id: edge.id,
      workspaceId,
      sourceConceptId: edge.source_node_id,
      targetConceptId: edge.target_node_id,
      relationshipType,
      strength: edge.strength ?? 0.5,
      confidence: edge.confidence_score ?? 0.5,
      sourceChunkIds: [...edge.source_chunk_ids],
      description: edge.description ?? undefined,
      createdAt: edge.created_at,
    });
  }

  return {
    projection: {
      workspaceId,
      version,
      generatedAt: now,
      nodes: projectedNodes,
      edges: projectedEdges,
    },
    rejectedEdges,
  };
}
