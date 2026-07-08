import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { ConceptMastery, MasterySignalData, MasteryState } from '../mastery/types';

const VALID_MASTERY_STATES: MasteryState[] = [
  'unassessed', 'insufficient_evidence', 'emerging', 'partial',
  'understood', 'weak_connection', 'misconception', 'needs_review'
];

function mapRecordToMastery(record: Record<string, unknown>, workspaceId: string, userId: string): ConceptMastery {
  const rawLevel = record.mastery_level as string;
  const state: MasteryState = VALID_MASTERY_STATES.includes(rawLevel as MasteryState)
    ? (rawLevel as MasteryState)
    : 'unassessed';

  return {
    conceptId: record.concept_node_id as string,
    workspaceId,
    userId,
    state,
    score: (record.mastery_score as number) || 0,
    confidenceScore: (record.confidence_score as number) || 0,
    evidenceCount: (record.evidence_count as number) || 0,
    attemptsCount: (record.attempts_count as number) || 0,
    lastAssessedAt: (record.last_assessed_at as string) || null,
    strongestGaps: (record.strongest_gaps as string[]) || [],
    coveredSignals: [],
    recommendationLabel: (record.recommendation_label as string) || '',
    explanation: (record.explanation as string) || '',
  };
}

export async function getConceptMastery(workspaceId: string, conceptId: string, userId: string): Promise<ConceptMastery | null> {
  const supabase = await createServerSupabaseClient();

  // Verify workspace ownership
  const { data: ws, error: wsError } = await supabase
    .from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (wsError || !ws) return null;

  // Verify concept belongs to workspace
  const { data: concept, error: conceptError } = await supabase
    .from('concept_nodes').select('id').eq('id', conceptId).eq('workspace_id', workspaceId).single();
  if (conceptError || !concept) return null;

  const { data: record, error } = await supabase
    .from('mastery_records')
    .select('*')
    .eq('concept_node_id', conceptId)
    .single();

  if (error || !record) return null;

  return mapRecordToMastery(record, workspaceId, userId);
}

export async function listWorkspaceMastery(workspaceId: string, userId: string): Promise<ConceptMastery[]> {
  const supabase = await createServerSupabaseClient();

  const { data: ws, error: wsError } = await supabase
    .from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (wsError || !ws) return [];

  const { data: concepts } = await supabase.from('concept_nodes').select('id').eq('workspace_id', workspaceId);
  if (!concepts || concepts.length === 0) return [];

  const conceptIds = concepts.map(c => c.id);

  const { data: records, error } = await supabase
    .from('mastery_records')
    .select('*')
    .in('concept_node_id', conceptIds);

  if (error || !records) return [];

  return records.map(record => mapRecordToMastery(record, workspaceId, userId));
}

export async function persistMasteryUpdate(newMastery: ConceptMastery, newSignals: MasterySignalData[]): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // Verify workspace ownership before writing
  const { data: ws, error: wsError } = await supabase
    .from('workspaces').select('id').eq('id', newMastery.workspaceId).eq('user_id', newMastery.userId).single();
  if (wsError || !ws) {
    throw new AppError('Workspace ownership verification failed for mastery update', 403, 'UNAUTHORIZED');
  }

  // Insert historical signals with strict error checking
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

    const { error: signalError } = await supabase.from('mastery_signals').upsert(signalsToInsert, {
      onConflict: 'workspace_id, concept_id, source_session_id, source_explanation_id, signal_type',
      ignoreDuplicates: true
    });

    if (signalError) {
      throw new AppError('Failed to persist mastery signals', 500, 'DB_ERROR');
    }
  }

  // Upsert mastery record with strict error checking
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

  const { data: existing, error: existingError } = await supabase
    .from('mastery_records').select('id').eq('concept_node_id', newMastery.conceptId).single();

  if (existingError && existingError.code !== 'PGRST116') {
    // PGRST116 = "not found" which is expected for first record
    throw new AppError('Failed to check existing mastery record', 500, 'DB_ERROR');
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('mastery_records').update(recordToUpsert).eq('id', existing.id);
    if (updateError) {
      throw new AppError('Failed to update mastery record', 500, 'DB_ERROR');
    }
  } else {
    const { error: insertError } = await supabase
      .from('mastery_records').insert([recordToUpsert]);
    if (insertError) {
      throw new AppError('Failed to insert mastery record', 500, 'DB_ERROR');
    }
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
    const level = m.mastery_level as string;
    if (level !== 'unassessed' && level !== 'insufficient_evidence') {
      assessedCount++;
    }
    if (level === 'understood') understoodCount++;
    if (level === 'misconception') misconceptionCount++;
    if (level === 'needs_review') needsReviewCount++;
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
