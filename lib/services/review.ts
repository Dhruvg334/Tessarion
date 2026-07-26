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
  if (wsError || !ws) throw new AppError('Unauthorized.', 403, 'UNAUTHORIZED');
  
  if (mastery.workspaceId !== workspaceId || mastery.userId !== userId) {
    throw new AppError('Mastery does not belong to this notebook or learner.', 400, 'INVALID_SCOPE');
  }

  const { data: cNode, error: cError } = await supabase
    .from('concept_nodes')
    .select('id')
    .eq('id', mastery.conceptId)
    .eq('workspace_id', workspaceId)
    .single();
  if (cError || !cNode) throw new AppError('Concept does not belong to this notebook.', 400, 'INVALID_SCOPE');

  const { data: mRecord, error: mError } = await supabase
    .from('mastery_records')
    .select('id')
    .eq('id', masteryRecordId)
    .eq('concept_node_id', mastery.conceptId)
    .single();

  if (mError || !mRecord) throw new AppError('Mastery record is outside the requested scope.', 400, 'INVALID_SCOPE');

  if (signalIds.length > 0) {
    const { data: validSignals, error: sigError } = await supabase
      .from('mastery_signals')
      .select('id')
      .in('id', signalIds)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('concept_id', mastery.conceptId);
      
    if (sigError || !validSignals || validSignals.length !== signalIds.length) {
      throw new AppError('One or more mastery signals are outside the requested scope.', 400, 'INVALID_SCOPE');
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

  if (searchError) throw new AppError('The active review schedule could not be checked.', 500, 'DB_ERROR', searchError.message);

  const isScheduleable = rec.suggestedReviewAt !== null && rec.priority !== null && rec.reasonType !== null;

  if (!isScheduleable) {
    if (existingActive) {
      const { data: updData, error: updError } = await supabase.from('review_schedules')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', existingActive.id)
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .select('id');
      if (updError) throw new AppError('The review schedule could not be updated.', 500, 'DB_ERROR', updError.message);
      if (!updData || updData.length === 0) throw new AppError('Review schedule not found or unauthorized.', 404, 'NOT_FOUND');
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
    if (countError) throw new AppError('Review schedule limits could not be checked.', 500, 'DB_ERROR', countError.message);
    
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
    if (updError) throw new AppError('The review schedule could not be updated.', 500, 'DB_ERROR', updError.message);
    if (!updData || updData.length === 0) throw new AppError('Review schedule not found or unauthorized.', 404, 'NOT_FOUND');
    
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
    if (insError || !insData) throw new AppError('The review schedule could not be created.', 500, 'DB_ERROR', insError?.message);
    
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

type ReviewScheduleRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  concept_node_id: string;
  status: string;
  priority: string;
  reason_type: string;
  reason: string;
  scheduled_for: string | null;
  [key: string]: unknown;
};

function computeReviewQueueItem(
  item: ReviewScheduleRow,
  conceptName: string,
  now: Date,
  workspaceName?: string
) {
  const nowMs = now.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  let computedStatus = item.status;

  if (item.status === 'queued' && item.scheduled_for) {
    const scheduledFor = new Date(item.scheduled_for).getTime();
    if (Number.isFinite(scheduledFor)) {
      if (scheduledFor <= nowMs - oneDayMs) computedStatus = 'overdue';
      else if (scheduledFor <= nowMs) computedStatus = 'due';
    }
  }

  const priorityScore = item.priority === 'critical' ? 4 : item.priority === 'high' ? 3 : item.priority === 'medium' ? 2 : 1;

  return {
    ...item,
    computedStatus,
    priorityScore,
    conceptName,
    ...(workspaceName ? { workspaceName } : {}),
  };
}

function reviewDateValue(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
}

export async function getWorkspaceReviewQueue(workspaceId: string, userId: string, now: Date = new Date()) {
  const supabase = await createServerSupabaseClient();

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (workspaceError || !workspace) {
    throw new AppError('You do not have access to this notebook.', 403, 'UNAUTHORIZED');
  }

  // Avoid embedded PostgREST joins here. Hosted schema caches can lag immediately
  // after migrations; separate scoped reads are portable and keep queue access usable.
  const { data: queueData, error: queueError } = await supabase
    .from('review_schedules')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .in('status', ['queued', 'due', 'overdue'])
    .order('scheduled_for', { ascending: true });

  if (queueError) {
    throw new AppError('The review queue could not be loaded.', 500, 'DB_ERROR', queueError.message);
  }

  const queue = (queueData ?? []) as ReviewScheduleRow[];
  const conceptIds = [...new Set(queue.map((item) => item.concept_node_id))];
  const conceptNames = new Map<string, string>();

  if (conceptIds.length > 0) {
    const { data: concepts, error: conceptError } = await supabase
      .from('concept_nodes')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .in('id', conceptIds);

    if (conceptError) {
      throw new AppError('Review concepts could not be loaded.', 500, 'DB_ERROR', conceptError.message);
    }

    for (const concept of concepts ?? []) conceptNames.set(concept.id, concept.name);
  }

  return queue
    .map((item) => computeReviewQueueItem(item, conceptNames.get(item.concept_node_id) ?? 'Concept unavailable', now))
    .sort((left, right) => right.priorityScore - left.priorityScore || reviewDateValue(left.scheduled_for) - reviewDateValue(right.scheduled_for));
}

export async function getGlobalReviewQueue(userId: string, now: Date = new Date()) {
  const supabase = await createServerSupabaseClient();

  const { data: queueData, error: queueError } = await supabase
    .from('review_schedules')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['queued', 'due', 'overdue'])
    .order('scheduled_for', { ascending: true });

  if (queueError) {
    throw new AppError('The review queue could not be loaded.', 500, 'DB_ERROR', queueError.message);
  }

  const queue = (queueData ?? []) as ReviewScheduleRow[];
  const conceptIds = [...new Set(queue.map((item) => item.concept_node_id))];
  const workspaceIds = [...new Set(queue.map((item) => item.workspace_id))];
  const conceptNames = new Map<string, string>();
  const workspaceNames = new Map<string, string>();

  if (conceptIds.length > 0) {
    const { data: concepts, error: conceptError } = await supabase
      .from('concept_nodes')
      .select('id, name')
      .in('id', conceptIds);
    if (conceptError) throw new AppError('Review concepts could not be loaded.', 500, 'DB_ERROR', conceptError.message);
    for (const concept of concepts ?? []) conceptNames.set(concept.id, concept.name);
  }

  if (workspaceIds.length > 0) {
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id, name')
      .eq('user_id', userId)
      .in('id', workspaceIds);
    if (workspacesError) throw new AppError('Review notebooks could not be loaded.', 500, 'DB_ERROR', workspacesError.message);
    for (const workspace of workspaces ?? []) workspaceNames.set(workspace.id, workspace.name);
  }

  return queue
    .map((item) => computeReviewQueueItem(
      item,
      conceptNames.get(item.concept_node_id) ?? 'Concept unavailable',
      now,
      workspaceNames.get(item.workspace_id) ?? 'Notebook unavailable'
    ))
    .sort((left, right) => right.priorityScore - left.priorityScore || reviewDateValue(left.scheduled_for) - reviewDateValue(right.scheduled_for));
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
  if (wsError || !ws) throw new AppError('Unauthorized.', 403, 'UNAUTHORIZED');

  const { data: concepts, error: conceptsError } = await supabase
    .from('concept_nodes')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (conceptsError) throw new AppError('Notebook concepts could not be loaded for review scheduling.', 500, 'DB_ERROR', conceptsError.message);

  const conceptIds = (concepts || []).map((concept) => concept.id);
  const { data: records, error: mError } = conceptIds.length > 0
    ? await supabase
        .from('mastery_records')
        .select('*')
        .in('concept_node_id', conceptIds)
    : { data: [], error: null };
    
  if (mError) throw new AppError('Mastery records could not be loaded for review scheduling.', 500, 'DB_ERROR', mError.message);
  
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
      
    if (sigError) throw new AppError('Mastery signals could not be loaded for review scheduling.', 500, 'DB_ERROR', sigError.message);
      
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
