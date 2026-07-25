import { describe, expect, it } from 'vitest';
import { runConceptIntelligence } from './graph';
const chunk = { id:'11111111-1111-4111-8111-111111111111', source_document_id:'22222222-2222-4222-8222-222222222222', workspace_id:'33333333-3333-4333-8333-333333333333', content:'Binary Search is an algorithm that repeatedly halves a sorted search interval.', chunk_index:0, token_count:12, embedding:null, metadata:{}, created_at:'2026-01-01T00:00:00.000Z' } as never;
describe('concept intelligence workflow',()=>{
 it('publishes a grounded projection',async()=>{ const r=await runConceptIntelligence({runId:'44444444-4444-4444-8444-444444444444',traceId:'55555555-5555-4555-8555-555555555555',workspaceId:'33333333-3333-4333-8333-333333333333',documentId:'22222222-2222-4222-8222-222222222222',chunks:[chunk],minConfidence:.5}); expect(r.status).toBe('completed'); expect(r.projectionReady).toBe(true); expect(r.concepts.length).toBeGreaterThan(0); });
});
