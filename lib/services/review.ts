import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { ConceptMastery, MasteryState } from '../mastery/types';
import { ReviewRecommendation } from '../review/types';
import { calculateReviewRecommendation } from '../review/calculate-review';
import { recordOperationalEvent } from '@/lib/services/observability';

export async function scheduleReviewsFromMastery(
  workspaceId: string, 
  userId: string, 
  mastery: ConceptMastery,
  masteryRecordId: string,
  signalIds: string[] = []
): Promise<{ recommendation: ReviewRecommendation; action: 'created' | 'updated' | 'suspended' | 'skippedNotReady' | 'skippedUnderstoodCap' }> {
  const supabase = await createServerSupabaseClient();

  const { data: ws, error: wsError } = await supabase
    .from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (wsError || !ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');
  
  if (mastery.workspaceId !== workspaceId || mastery.userId !== userId) {
    throw new AppError('INVALID_SCOPE', 400, 'Mastery does not belong to workspace or user');
  }

  const { data: cNode, error: cError } = await supabase
    .from('concept_nodes')
    .select('id')
    .eq('id', mastery.conceptId)
    .eq('workspace_id', workspaceId)
    .single();
  if (cError || !cNode) throw new AppError('INVALID_SCOPE', 400, 'Concept node does not belong to workspace');

  const { data: mRecord, error: mError } = await supabase
    .from('mastery_records')
    .select('id')
    .eq('id', masteryRecordId)
    .eq('concept_node_id', mastery.conceptId)
    .single();

  if (mError || !mRecord) throw new AppError('INVALID_SCOPE', 400, 'Mastery record does not exist in scope');

  if (signalIds.length > 0) {
    const { data: validSignals, error: sigError } = await supabase
      .from('mastery_signals')
      .select('id')
      .in('id', signalIds)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('concept_id', mastery.conceptId);
      
    if (sigError || !validSignals || validSignals.length !== signalIds.length) {
      throw new AppError('INVALID_SCOPE', 400, 'One or more source signal IDs are invalid or belong to a different scope');
    }
  }

  const rec = calculateReviewRecommendation(mastery);

  const { data: existingActive, error: searchError } = await supabase
    .from('review_schedules')
    .select('id, status, reason_type')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('concept_node_id', mastery.conceptId)
    .in('status', ['queued', 'due', 'overdue'])
    .maybeSingle();

  if (searchError) throw new AppError('DB_ERROR', 500, searchError.message);

  const isScheduleable = rec.suggestedReviewAt !== null && rec.priority !== null && rec.reasonType !== null;

  if (!isScheduleable) {
    if (existingActive) {
      const { data: updData, error: updError } = await supabase.from('review_schedules')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', existingActive.id)
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .select('id');
      if (updError) throw new AppError('DB_ERROR', 500, updError.message);
      if (!updData || updData.length === 0) throw new AppError('NOT_FOUND', 404, 'Review schedule not found or unauthorized');
      return { recommendation: rec, action: 'suspended' };
    }
    return { recommendation: rec, action: 'skippedNotReady' };
  }

  if (rec.masteryState === 'understood') {
    const builder = supabase.from('review_schedules')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .in('status', ['queued', 'due', 'overdue'])
      .eq('reason_type', 'scheduled_reinforcement');
    const { count, error: countError } = await builder;
    if (countError) throw new AppError('DB_ERROR', 500, countError.message);
    
    const alreadyReinforcement = existingActive && existingActive.reason_type === 'scheduled_reinforcement';
    if (count !== null && count >= 3 && !alreadyReinforcement) {
      return { recommendation: rec, action: 'skippedUnderstoodCap' };
    }
  }

  if (existingActive) {
    const { data: updData, error: updError } = await supabase.from('review_schedules').update({
      mastery_record_id: masteryRecordId,
      priority: rec.priority,
      reason_type: rec.reasonType,
      reason: rec.reason,
      scheduled_for: rec.suggestedReviewAt!.toISOString(),
      source_mastery_signal_ids: signalIds,
      updated_at: new Date().toISOString()
    }).eq('id', existingActive.id)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select('id');
    if (updError) throw new AppError('DB_ERROR', 500, updError.message);
    if (!updData || updData.length === 0) throw new AppError('NOT_FOUND', 404, 'Review schedule not found or unauthorized');
    
    await recordOperationalEvent({
      workspaceId,
      userId,
      eventType: 'review_scheduled',
      safeMessage: `Review schedule updated (Reason: ${rec.reasonType})`,
      entityType: 'review_schedule',
      entityId: existingActive.id,
      metadata: { conceptId: mastery.conceptId, reasonType: rec.reasonType, priority: rec.priority }
    });
    
    return { recommendation: rec, action: 'updated' };
  } else {
    const { data: insData, error: insError } = await supabase.from('review_schedules').insert({
      workspace_id: workspaceId,
      user_id: userId,
      concept_node_id: mastery.conceptId,
      mastery_record_id: masteryRecordId,
      status: 'queued',
      priority: rec.priority,
      reason_type: rec.reasonType,
      reason: rec.reason,
      scheduled_for: rec.suggestedReviewAt!.toISOString(),
      source_mastery_signal_ids: signalIds
    }).select('id').single();
    if (insError || !insData) throw new AppError('DB_ERROR', 500, insError?.message || 'Insert failed');
    
    await recordOperationalEvent({
      workspaceId,
      userId,
      eventType: 'review_scheduled',
      safeMessage: `New review scheduled (Reason: ${rec.reasonType})`,
      entityType: 'review_schedule',
      entityId: insData.id,
      metadata: { conceptId: mastery.conceptId, reasonType: rec.reasonType, priority: rec.priority }
    });
    
    return { recommendation: rec, action: 'created' };
  }
}

export async function getWorkspaceReviewQueue(workspaceId: string, userId: string, now: Date = new Date()) {
  const supabase = await createServerSupabaseClient();
  
  const { data: ws, error: wsError } = await supabase
    .from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (wsError || !ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { data: queue, error } = await supabase
    .from('review_schedules')
    .select(`
      *,
      concept_nodes(name)
    `)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .in('status', ['queued', 'due', 'overdue'])
    .order('scheduled_for', { ascending: true });

  if (error) throw new AppError('DB_ERROR', 500, error.message);

  const nowMs = now.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return queue.map(item => {
    let computedStatus = item.status;
    if (item.status === 'queued') {
      const scheduledFor = new Date(item.scheduled_for).getTime();
      if (scheduledFor <= nowMs - oneDayMs) {
        computedStatus = 'overdue';
      } else if (scheduledFor <= nowMs) {
        computedStatus = 'due';
      }
    }
    
    // Sort priority
    const priorityScore = item.priority === 'critical' ? 4 : item.priority === 'high' ? 3 : item.priority === 'medium' ? 2 : 1;

    return {
      ...item,
      computedStatus,
      priorityScore,
      conceptName: item.concept_nodes?.name || 'Unknown Concept'
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore || new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
}

export async function getGlobalReviewQueue(userId: string, now: Date = new Date()) {
  const supabase = await createServerSupabaseClient();
  
  const { data: queue, error } = await supabase
    .from('review_schedules')
    .select(`
      *,
      concept_nodes(name),
      workspaces(name)
    `)
    .eq('user_id', userId)
    .in('status', ['queued', 'due', 'overdue'])
    .order('scheduled_for', { ascending: true });

  if (error) throw new AppError('DB_ERROR', 500, error.message);

  const nowMs = now.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return queue.map(item => {
    let computedStatus = item.status;
    if (item.status === 'queued') {
      const scheduledFor = new Date(item.scheduled_for).getTime();
      if (scheduledFor <= nowMs - oneDayMs) {
        computedStatus = 'overdue';
      } else if (scheduledFor <= nowMs) {
        computedStatus = 'due';
      }
    }
    
    const priorityScore = item.priority === 'critical' ? 4 : item.priority === 'high' ? 3 : item.priority === 'medium' ? 2 : 1;

    return {
      ...item,
      computedStatus,
      priorityScore,
      conceptName: item.concept_nodes?.name || 'Unknown Concept',
      workspaceName: (item.workspaces as { name?: string } | undefined)?.name || 'Unknown Notebook'
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore || new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
}

export async function markReviewCompleted(workspaceId: string, reviewId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('review_schedules')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error || !data) throw new AppError('Review schedule not found or unauthorized', 404, 'NOT_FOUND');

  await recordOperationalEvent({
    workspaceId,
    userId,
    eventType: 'review_completed',
    safeMessage: 'Review schedule marked as completed',
    entityType: 'review_schedule',
    entityId: reviewId
  });
}

export async function skipReview(workspaceId: string, reviewId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('review_schedules')
    .update({
      status: 'skipped',
      skipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error || !data) throw new AppError('Review schedule not found or unauthorized', 404, 'NOT_FOUND');

  await recordOperationalEvent({
    workspaceId,
    userId,
    eventType: 'review_skipped',
    safeMessage: 'Review schedule marked as skipped',
    entityType: 'review_schedule',
    entityId: reviewId
  });
}

export async function getConceptReviewRecommendation(workspaceId: string, conceptId: string, userId: string): Promise<ReviewRecommendation | null> {
  const supabase = await createServerSupabaseClient();

  const { data: concept, error: conceptError } = await supabase
    .from('concept_nodes')
    .select('id')
    .eq('id', conceptId)
    .eq('workspace_id', workspaceId)
    .single();

  if (conceptError || !concept) return null;

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (workspaceError || !workspace) return null;

  const { data: record, error } = await supabase
    .from('mastery_records')
    .select('mastery_level, evidence_count, attempts_count')
    .eq('concept_node_id', conceptId)
    .maybeSingle();

  if (error || !record) return null;

  const masteryForReview: ConceptMastery = {
    workspaceId,
    userId,
    conceptId,
    state: (record.mastery_level as MasteryState) || 'unassessed',
    score: 0,
    confidenceScore: 0,
    evidenceCount: record.evidence_count,
    attemptsCount: record.attempts_count,
    lastAssessedAt: null,
    strongestGaps: [],
    coveredSignals: [],
    recommendationLabel: '',
    explanation: ''
  };

  return calculateReviewRecommendation(masteryForReview);
}

export async function scheduleReviewsFromWorkspaceMastery(workspaceId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: ws, error: wsError } = await supabase
    .from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (wsError || !ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');

  const { data: concepts, error: conceptsError } = await supabase
    .from('concept_nodes')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (conceptsError) throw new AppError('DB_ERROR', 500, conceptsError.message);

  const conceptIds = (concepts || []).map((concept) => concept.id);
  const { data: records, error: mError } = conceptIds.length > 0
    ? await supabase
        .from('mastery_records')
        .select('*')
        .in('concept_node_id', conceptIds)
    : { data: [], error: null };
    
  if (mError) throw new AppError('DB_ERROR', 500, mError.message);
  
  const summary = {
    created: 0,
    updated: 0,
    suspended: 0,
    skippedNotReady: 0,
    skippedUnderstoodCap: 0,
    processed: 0,
    legacyTraceFallback: 0
  };

  for (const record of records || []) {
    const masteryForReview: ConceptMastery = {
      workspaceId,
      userId,
      conceptId: record.concept_node_id,
      state: (record.mastery_level as MasteryState) || 'unassessed',
      score: 0,
      confidenceScore: 0,
      evidenceCount: record.evidence_count,
      attemptsCount: record.attempts_count,
      lastAssessedAt: null,
      strongestGaps: [],
      coveredSignals: [],
      recommendationLabel: '',
      explanation: ''
    };
    
    const { data: signals, error: sigError } = await supabase
      .from('mastery_signals')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('concept_id', record.concept_node_id)
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (sigError) throw new AppError('DB_ERROR', 500, sigError.message);
      
    const signalIds = signals ? signals.map(s => s.id) : [];

    if (signalIds.length === 0) {
      if (record.evidence_count > 0 || record.attempts_count > 0) {
        summary.legacyTraceFallback++;
      } else {
        summary.skippedNotReady++;
        summary.processed++;
        continue;
      }
    }

    const { action } = await scheduleReviewsFromMastery(workspaceId, userId, masteryForReview, record.id, signalIds);
    if (action === 'created') summary.created++;
    else if (action === 'updated') summary.updated++;
    else if (action === 'suspended') summary.suspended++;
    else if (action === 'skippedNotReady') summary.skippedNotReady++;
    else if (action === 'skippedUnderstoodCap') summary.skippedUnderstoodCap++;
    summary.processed++;
  }
  
  return summary;
}
