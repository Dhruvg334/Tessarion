import type {
  GraphProjectionEdge,
  GraphProjectionStore,
  GraphRelationshipType,
  GraphTraversalPath,
  GraphTraversalQuery,
  GraphTraversalResult,
  WorkspaceGraphProjection,
} from './types';

const DEFAULT_MAX_DEPTH = 2;
const HARD_MAX_DEPTH = 3;
const DEFAULT_MAX_NODES = 25;
const HARD_MAX_NODES = 50;

interface QueueItem {
  nodeId: string;
  pathConceptIds: string[];
  pathEdgeIds: string[];
  relationshipTypes: GraphRelationshipType[];
  evidenceChunkIds: string[];
  score: number;
  depth: number;
}

export class LocalGraphProjectionStore implements GraphProjectionStore {
  private readonly projections = new Map<string, WorkspaceGraphProjection>();

  async replaceWorkspaceProjection(projection: WorkspaceGraphProjection): Promise<void> {
    this.projections.set(projection.workspaceId, structuredClone(projection));
  }

  async deleteWorkspaceProjection(workspaceId: string): Promise<void> {
    this.projections.delete(workspaceId);
  }

  async traverse(query: GraphTraversalQuery): Promise<GraphTraversalResult> {
    const projection = this.projections.get(query.workspaceId);
    const maxDepth = Math.min(Math.max(query.maxDepth ?? DEFAULT_MAX_DEPTH, 0), HARD_MAX_DEPTH);
    const maxNodes = Math.min(Math.max(query.maxNodes ?? DEFAULT_MAX_NODES, 1), HARD_MAX_NODES);
    const minimumConfidence = Math.max(0, Math.min(query.minimumConfidence ?? 0.65, 1));
    const direction = query.direction ?? 'both';
    const allowedRelationships = new Set<GraphRelationshipType>(
      query.relationshipTypes ?? ['prerequisite', 'related', 'contrasts', 'causal'],
    );

    if (!projection) {
      return emptyResult(query, maxDepth, maxNodes);
    }

    const nodeById = new Map(projection.nodes.map((node) => [node.id, node]));
    const validSeeds = [...new Set(query.seedConceptIds)].filter((id) => nodeById.has(id));
    const adjacency = createAdjacency(projection.edges, direction, allowedRelationships, minimumConfidence);
    const visited = new Set<string>();
    const selectedEdges = new Map<string, GraphProjectionEdge>();
    const paths: GraphTraversalPath[] = [];
    const queue: QueueItem[] = validSeeds.map((seed) => ({
      nodeId: seed,
      pathConceptIds: [seed],
      pathEdgeIds: [],
      relationshipTypes: [],
      evidenceChunkIds: [],
      score: 1,
      depth: 0,
    }));
    let truncated = false;

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      if (visited.has(current.nodeId)) continue;
      if (visited.size >= maxNodes) {
        truncated = true;
        break;
      }

      visited.add(current.nodeId);
      if (current.depth > 0) {
        paths.push({
          conceptIds: current.pathConceptIds,
          edgeIds: current.pathEdgeIds,
          relationshipTypes: current.relationshipTypes,
          depth: current.depth,
          score: current.score,
          evidenceChunkIds: [...new Set(current.evidenceChunkIds)],
        });
      }
      if (current.depth >= maxDepth) continue;

      for (const neighbor of adjacency.get(current.nodeId) ?? []) {
        if (current.pathConceptIds.includes(neighbor.nodeId)) continue;
        selectedEdges.set(neighbor.edge.id, neighbor.edge);
        queue.push({
          nodeId: neighbor.nodeId,
          pathConceptIds: [...current.pathConceptIds, neighbor.nodeId],
          pathEdgeIds: [...current.pathEdgeIds, neighbor.edge.id],
          relationshipTypes: [...current.relationshipTypes, neighbor.edge.relationshipType],
          evidenceChunkIds: [...current.evidenceChunkIds, ...neighbor.edge.sourceChunkIds],
          score: current.score * edgeScore(neighbor.edge),
          depth: current.depth + 1,
        });
      }
    }

    const nodes = [...visited].map((id) => nodeById.get(id)).filter(isDefined);
    return {
      workspaceId: query.workspaceId,
      seedConceptIds: validSeeds,
      nodes,
      edges: [...selectedEdges.values()].filter((edge) => visited.has(edge.sourceConceptId) && visited.has(edge.targetConceptId)),
      paths: paths.sort((a, b) => b.score - a.score || a.depth - b.depth),
      truncated,
      diagnostics: {
        visitedNodes: nodes.length,
        visitedEdges: selectedEdges.size,
        maxDepth,
        maxNodes,
        rejectedCrossWorkspaceEdges: 0,
        rejectedUngroundedEdges: 0,
      },
    };
  }
}

interface AdjacentEdge {
  nodeId: string;
  edge: GraphProjectionEdge;
}

function createAdjacency(
  edges: GraphProjectionEdge[],
  direction: GraphTraversalQuery['direction'],
  allowedRelationships: Set<GraphRelationshipType>,
  minimumConfidence: number,
): Map<string, AdjacentEdge[]> {
  const adjacency = new Map<string, AdjacentEdge[]>();
  const add = (from: string, to: string, edge: GraphProjectionEdge) => {
    const neighbors = adjacency.get(from) ?? [];
    neighbors.push({ nodeId: to, edge });
    adjacency.set(from, neighbors);
  };

  for (const edge of edges) {
    if (!allowedRelationships.has(edge.relationshipType) || edge.confidence < minimumConfidence) continue;
    if (direction === 'outgoing' || direction === 'both') add(edge.sourceConceptId, edge.targetConceptId, edge);
    if (direction === 'incoming' || direction === 'both') add(edge.targetConceptId, edge.sourceConceptId, edge);
  }

  return adjacency;
}

function edgeScore(edge: GraphProjectionEdge): number {
  return Math.max(0.01, Math.min(1, (edge.confidence * 0.7) + (edge.strength * 0.3)));
}

function emptyResult(query: GraphTraversalQuery, maxDepth: number, maxNodes: number): GraphTraversalResult {
  return {
    workspaceId: query.workspaceId,
    seedConceptIds: [],
    nodes: [],
    edges: [],
    paths: [],
    truncated: false,
    diagnostics: {
      visitedNodes: 0,
      visitedEdges: 0,
      maxDepth,
      maxNodes,
      rejectedCrossWorkspaceEdges: 0,
      rejectedUngroundedEdges: 0,
    },
  };
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
