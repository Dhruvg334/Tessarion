import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ConceptMastery, MasterySignalData } from '../mastery/types';

export async function getConceptMastery(workspaceId: string, conceptId: string, userId: string): Promise<ConceptMastery | null> {
  const supabase = await createServerSupabaseClient();
  
  // Verify workspace ownership
  const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (!ws) return null;

  const { data: record, error } = await supabase
    .from('mastery_records')
    .select('*')
    .eq('concept_node_id', conceptId)
    .single();

  if (error || !record) return null;

  return {
    conceptId: record.concept_node_id,
    workspaceId,
    userId,
    state: record.mastery_level as any,
    score: record.mastery_score,
    confidenceScore: record.confidence_score || 0,
    evidenceCount: record.evidence_count || 0,
    attemptsCount: record.attempts_count || 0,
    lastAssessedAt: record.last_assessed_at,
    strongestGaps: record.strongest_gaps || [],
    coveredSignals: [], // Typically pulled from signals table if needed
    recommendationLabel: record.recommendation_label || '',
    explanation: record.explanation || '',
  };
}

export async function listWorkspaceMastery(workspaceId: string, userId: string): Promise<ConceptMastery[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (!ws) return [];

  const { data: concepts } = await supabase.from('concept_nodes').select('id').eq('workspace_id', workspaceId);
  if (!concepts || concepts.length === 0) return [];
  
  const conceptIds = concepts.map(c => c.id);

  const { data: records, error } = await supabase
    .from('mastery_records')
    .select('*')
    .in('concept_node_id', conceptIds);

  if (error || !records) return [];

  return records.map(record => ({
    conceptId: record.concept_node_id,
    workspaceId,
    userId,
    state: record.mastery_level as any,
    score: record.mastery_score,
    confidenceScore: record.confidence_score || 0,
    evidenceCount: record.evidence_count || 0,
    attemptsCount: record.attempts_count || 0,
    lastAssessedAt: record.last_assessed_at,
    strongestGaps: record.strongest_gaps || [],
    coveredSignals: [], 
    recommendationLabel: record.recommendation_label || '',
    explanation: record.explanation || '',
  }));
}

export async function persistMasteryUpdate(newMastery: ConceptMastery, newSignals: MasterySignalData[]): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // Insert historical signals
  if (newSignals.length > 0) {
    const signalsToInsert = newSignals.map(sig => ({
      workspace_id: sig.workspaceId,
      concept_id: sig.conceptId,
      user_id: sig.userId,
      source_session_id: sig.sourceSessionId,
      source_explanation_id: sig.sourceExplanationId,
      signal_type: sig.signalType,
      strength: sig.strength,
      confidence_score: sig.confidenceScore,
      evidence: sig.evidence,
      source_chunk_ids: sig.sourceChunkIds,
      gap_finding_ids: sig.gapFindingIds,
    }));

    await supabase.from('mastery_signals').upsert(signalsToInsert, {
      onConflict: 'workspace_id, concept_id, source_session_id, source_explanation_id, signal_type',
      ignoreDuplicates: true
    });
  }

  // Upsert mastery record
  const recordToUpsert = {
    concept_node_id: newMastery.conceptId,
    mastery_score: newMastery.score || 0,
    mastery_level: newMastery.state,
    confidence_score: newMastery.confidenceScore,
    evidence_count: newMastery.evidenceCount,
    attempts_count: newMastery.attemptsCount,
    last_assessed_at: newMastery.lastAssessedAt,
    strongest_gaps: newMastery.strongestGaps,
    recommendation_label: newMastery.recommendationLabel,
    explanation: newMastery.explanation,
    recorded_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('mastery_records').select('id').eq('concept_node_id', newMastery.conceptId).single();

  if (existing) {
    await supabase.from('mastery_records').update(recordToUpsert).eq('id', existing.id);
  } else {
    await supabase.from('mastery_records').insert([recordToUpsert]);
  }
}

export async function getMasterySummary(workspaceId: string, userId: string) {
  const list = await listWorkspaceMastery(workspaceId, userId);
  
  let assessedCount = 0;
  let understoodCount = 0;
  let misconceptionCount = 0;
  let needsReviewCount = 0;

  for (const m of list) {
    if (m.state !== 'unassessed' && m.state !== 'insufficient_evidence') {
      assessedCount++;
    }
    if (m.state === 'understood') understoodCount++;
    if (m.state === 'misconception') misconceptionCount++;
    if (m.state === 'needs_review') needsReviewCount++;
  }

  return {
    totalConcepts: list.length,
    assessedCount,
    understoodCount,
    misconceptionCount,
    needsReviewCount,
    list
  };
}

export async function getGlobalMasterySummary(userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: workspaces } = await supabase.from('workspaces').select('id').eq('user_id', userId);
  if (!workspaces || workspaces.length === 0) {
    return { totalConcepts: 0, assessedCount: 0, understoodCount: 0, misconceptionCount: 0, needsReviewCount: 0, list: [] };
  }

  const { data: concepts } = await supabase.from('concept_nodes').select('id').in('workspace_id', workspaces.map(w => w.id));
  if (!concepts || concepts.length === 0) {
    return { totalConcepts: 0, assessedCount: 0, understoodCount: 0, misconceptionCount: 0, needsReviewCount: 0, list: [] };
  }
  
  const conceptIds = concepts.map(c => c.id);

  const { data: records, error } = await supabase
    .from('mastery_records')
    .select('*')
    .in('concept_node_id', conceptIds);

  if (error || !records) {
    return { totalConcepts: 0, assessedCount: 0, understoodCount: 0, misconceptionCount: 0, needsReviewCount: 0, list: [] };
  }

  let assessedCount = 0;
  let understoodCount = 0;
  let misconceptionCount = 0;
  let needsReviewCount = 0;

  for (const m of records) {
    if (m.mastery_level !== 'unassessed' && m.mastery_level !== 'insufficient_evidence') {
      assessedCount++;
    }
    if (m.mastery_level === 'understood') understoodCount++;
    if (m.mastery_level === 'misconception') misconceptionCount++;
    if (m.mastery_level === 'needs_review') needsReviewCount++;
  }

  return {
    totalConcepts: records.length,
    assessedCount,
    understoodCount,
    misconceptionCount,
    needsReviewCount,
    list: records
  };
}
