import type {
  GraphProjectionStore,
  GraphRelationshipType,
  GraphTraversalQuery,
  GraphTraversalResult,
  WorkspaceGraphProjection,
} from '@/lib/graph/projection/types';
import type { Neo4jQueryExecutor } from './types';

const ALLOWED_RELATIONSHIP_LABELS: Record<GraphRelationshipType, string> = {
  prerequisite: 'PREREQUISITE_OF',
  related: 'RELATED_TO',
  contrasts: 'CONTRASTS_WITH',
  causal: 'EXPLAINS',
};

export class Neo4jGraphProjectionStore implements GraphProjectionStore {
  constructor(private readonly client: Neo4jQueryExecutor) {}

  async replaceWorkspaceProjection(projection: WorkspaceGraphProjection): Promise<void> {
    await this.deleteWorkspaceProjection(projection.workspaceId);
    if (projection.nodes.length > 0) {
      await this.client.execute(
        `UNWIND $nodes AS node
         MERGE (concept:Concept {workspaceId: $workspaceId, canonicalId: node.id})
         SET concept.name = node.name,
             concept.definition = node.definition,
             concept.sourceChunkIds = node.sourceChunkIds,
             concept.clusterLabel = node.clusterLabel,
             concept.dependencyDepth = node.dependencyDepth,
             concept.projectionVersion = $version,
             concept.updatedAt = node.updatedAt`,
        { workspaceId: projection.workspaceId, version: projection.version, nodes: projection.nodes },
      );
    }

    for (const relationshipType of Object.keys(ALLOWED_RELATIONSHIP_LABELS) as GraphRelationshipType[]) {
      const edges = projection.edges.filter((edge) => edge.relationshipType === relationshipType);
      if (edges.length === 0) continue;
      const label = ALLOWED_RELATIONSHIP_LABELS[relationshipType];
      await this.client.execute(
        `UNWIND $edges AS edge
         MATCH (source:Concept {workspaceId: $workspaceId, canonicalId: edge.sourceConceptId})
         MATCH (target:Concept {workspaceId: $workspaceId, canonicalId: edge.targetConceptId})
         MERGE (source)-[rel:${label} {workspaceId: $workspaceId, canonicalId: edge.id}]->(target)
         SET rel.strength = edge.strength,
             rel.confidence = edge.confidence,
             rel.sourceChunkIds = edge.sourceChunkIds,
             rel.description = edge.description,
             rel.projectionVersion = $version,
             rel.createdAt = edge.createdAt`,
        { workspaceId: projection.workspaceId, version: projection.version, edges },
      );
    }
  }

  async deleteWorkspaceProjection(workspaceId: string): Promise<void> {
    await this.client.execute(
      'MATCH (concept:Concept {workspaceId: $workspaceId}) DETACH DELETE concept',
      { workspaceId },
    );
  }

  async traverse(query: GraphTraversalQuery): Promise<GraphTraversalResult> {
    const maxDepth = Math.min(Math.max(query.maxDepth ?? 2, 0), 3);
    const maxNodes = Math.min(Math.max(query.maxNodes ?? 25, 1), 50);
    const minimumConfidence = Math.max(0, Math.min(query.minimumConfidence ?? 0.65, 1));
    const relationshipTypes = query.relationshipTypes ?? ['prerequisite', 'related', 'contrasts', 'causal'];
    const labels = relationshipTypes.map((type) => ALLOWED_RELATIONSHIP_LABELS[type]).join('|');
    const directionPattern = query.direction === 'incoming'
      ? `<-[relationships:${labels}*1..${maxDepth}]-`
      : query.direction === 'outgoing'
        ? `-[relationships:${labels}*1..${maxDepth}]->`
        : `-[relationships:${labels}*1..${maxDepth}]-`;

    const statement = `
      MATCH (seed:Concept {workspaceId: $workspaceId})
      WHERE seed.canonicalId IN $seedConceptIds
      MATCH path=(seed)${directionPattern}(related:Concept {workspaceId: $workspaceId})
      WHERE ALL(rel IN relationships(path) WHERE rel.workspaceId = $workspaceId AND rel.confidence >= $minimumConfidence AND size(rel.sourceChunkIds) > 0)
      WITH path, related
      ORDER BY length(path) ASC
      LIMIT $maxNodes
      RETURN
        [node IN nodes(path) | {id: node.canonicalId, workspaceId: node.workspaceId, name: node.name, definition: node.definition, sourceChunkIds: node.sourceChunkIds, clusterLabel: node.clusterLabel, dependencyDepth: node.dependencyDepth, updatedAt: node.updatedAt}] AS nodes,
        [rel IN relationships(path) | {id: rel.canonicalId, workspaceId: rel.workspaceId, sourceConceptId: startNode(rel).canonicalId, targetConceptId: endNode(rel).canonicalId, relationshipType: type(rel), strength: rel.strength, confidence: rel.confidence, sourceChunkIds: rel.sourceChunkIds, description: rel.description, createdAt: rel.createdAt}] AS edges,
        [node IN nodes(path) | node.canonicalId] AS conceptIds,
        [rel IN relationships(path) | rel.canonicalId] AS edgeIds,
        [rel IN relationships(path) | type(rel)] AS relationshipTypes,
        reduce(score = 1.0, rel IN relationships(path) | score * ((coalesce(rel.confidence, 0.5) * 0.7) + (coalesce(rel.strength, 0.5) * 0.3))) AS score,
        reduce(chunks = [], rel IN relationships(path) | chunks + rel.sourceChunkIds) AS evidenceChunkIds
    `;

    interface Row {
      nodes: GraphTraversalResult['nodes'];
      edges: Array<Omit<GraphTraversalResult['edges'][number], 'relationshipType'> & { relationshipType: string }>;
      conceptIds: string[];
      edgeIds: string[];
      relationshipTypes: string[];
      score: number;
      evidenceChunkIds: string[];
    }

    const response = await this.client.execute<Row>(statement, {
      workspaceId: query.workspaceId,
      seedConceptIds: query.seedConceptIds,
      minimumConfidence,
      maxNodes,
    });

    const nodeMap = new Map<string, GraphTraversalResult['nodes'][number]>();
    const edgeMap = new Map<string, GraphTraversalResult['edges'][number]>();
    const paths = response.data.map((row) => {
      row.nodes.forEach((node) => nodeMap.set(node.id, node));
      row.edges.forEach((edge) => {
        const normalized = normalizeEdgeType(edge.relationshipType);
        if (normalized) edgeMap.set(edge.id, { ...edge, relationshipType: normalized });
      });
      return {
        conceptIds: row.conceptIds,
        edgeIds: row.edgeIds,
        relationshipTypes: row.relationshipTypes.map(normalizeEdgeType).filter(isRelationshipType),
        depth: row.edgeIds.length,
        score: row.score,
        evidenceChunkIds: [...new Set(row.evidenceChunkIds)],
      };
    });

    return {
      workspaceId: query.workspaceId,
      seedConceptIds: query.seedConceptIds,
      nodes: [...nodeMap.values()],
      edges: [...edgeMap.values()],
      paths,
      truncated: response.data.length >= maxNodes,
      diagnostics: {
        visitedNodes: nodeMap.size,
        visitedEdges: edgeMap.size,
        maxDepth,
        maxNodes,
        rejectedCrossWorkspaceEdges: 0,
        rejectedUngroundedEdges: 0,
      },
    };
  }
}

function normalizeEdgeType(type: string): GraphRelationshipType | null {
  const entry = (Object.entries(ALLOWED_RELATIONSHIP_LABELS) as Array<[GraphRelationshipType, string]>)
    .find(([, label]) => label === type);
  return entry?.[0] ?? null;
}

function isRelationshipType(value: GraphRelationshipType | null): value is GraphRelationshipType {
  return value !== null;
}
