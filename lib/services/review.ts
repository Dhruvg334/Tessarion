import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/app-error';
import { ConceptMastery, MasterySignalData, MasteryState } from '../mastery/types';
import { ReviewRecommendation } from '../review/types';
import { calculateReviewRecommendation } from '../review/calculate-review';

export async function scheduleReviewsFromMastery(
  workspaceId: string, 
  userId: string, 
  mastery: ConceptMastery,
  masteryRecordId: string
): Promise<ReviewRecommendation> {
  const supabase = await createServerSupabaseClient();

  // Scope validation
  const { data: ws, error: wsError } = await supabase
    .from('workspaces').select('id').eq('id', workspaceId).eq('user_id', userId).single();
  if (wsError || !ws) throw new AppError('UNAUTHORIZED', 403, 'Unauthorized');
  
  if (mastery.workspaceId !== workspaceId) throw new AppError('INVALID_SCOPE', 400, 'Mastery does not belong to workspace');

  const rec = calculateReviewRecommendation(mastery);

  // Find existing active review for this concept
  const { data: existingActive, error: searchError } = await supabase
    .from('review_schedules')
    .select('id, status')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('concept_node_id', mastery.conceptId)
    .in('status', ['queued', 'due', 'overdue'])
    .maybeSingle();

  if (searchError) throw new AppError('DB_ERROR', 500, searchError.message);

  const isScheduleable = rec.suggestedReviewAt !== null && rec.priority !== null && rec.reasonType !== null;

  if (!isScheduleable) {
    // If not scheduleable (e.g. unassessed, insufficient_evidence) and there is an active review, suspend it
    if (existingActive) {
      await supabase.from('review_schedules').update({ status: 'suspended' }).eq('id', existingActive.id);
    }
    return rec;
  }

  // Handle Understood cap
  if (rec.masteryState === 'understood') {
    const { count, error: countError } = await supabase.from('review_schedules')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .in('status', ['queued', 'due', 'overdue'])
      .eq('reason_type', 'scheduled_reinforcement');
      
    if (countError) throw new AppError('DB_ERROR', 500, countError.message);
    if (count !== null && count >= 3 && (!existingActive || existingActive.status === 'suspended' || existingActive.status === 'completed' || existingActive.status === 'skipped')) {
      // Do not schedule if cap is reached and this is a new schedule
      // (If existingActive exists, we will just update it below, which doesn't increase the count)
      return rec;
    }
  }


  if (existingActive) {
    // Update existing active
    await supabase.from('review_schedules').update({
      mastery_record_id: masteryRecordId,
      priority: rec.priority,
      reason_type: rec.reasonType,
      reason: rec.reason,
      scheduled_for: rec.suggestedReviewAt!.toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', existingActive.id);
  } else {
    // Insert new
    await supabase.from('review_schedules').insert({
      workspace_id: workspaceId,
      user_id: userId,
      concept_node_id: mastery.conceptId,
      mastery_record_id: masteryRecordId,
      status: 'queued',
      priority: rec.priority,
      reason_type: rec.reasonType,
      reason: rec.reason,
      scheduled_for: rec.suggestedReviewAt!.toISOString(),
      source_mastery_signal_ids: [] // We don't have the exact mastery signal IDs here since they might have just been inserted, but we link the mastery_record_id
    });
  }

  return rec;
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
    .order('priority', { ascending: false }) // Postgres sorts strings, wait we need custom sort
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
  
  const { data: item, error: findError } = await supabase
    .from('review_schedules')
    .select('id')
    .eq('id', reviewId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (findError || !item) throw new AppError('NOT_FOUND', 404, 'Review schedule not found or unauthorized');

  const { error } = await supabase
    .from('review_schedules')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId);

  if (error) throw new AppError('DB_ERROR', 500, error.message);
}

export async function skipReview(workspaceId: string, reviewId: string, userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: item, error: findError } = await supabase
    .from('review_schedules')
    .select('id')
    .eq('id', reviewId)
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (findError || !item) throw new AppError('NOT_FOUND', 404, 'Review schedule not found or unauthorized');

  const { error } = await supabase
    .from('review_schedules')
    .update({
      status: 'skipped',
      skipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId);

  if (error) throw new AppError('DB_ERROR', 500, error.message);
}

export async function getConceptReviewRecommendation(workspaceId: string, conceptId: string, userId: string): Promise<ReviewRecommendation | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data: record, error } = await supabase
    .from('mastery_records')
    .select('mastery_level, evidence_count, attempts_count')
    .eq('concept_node_id', conceptId)
    .maybeSingle();

  if (error || !record) return null;

  // We can construct a mock ConceptMastery to pass into calculateReviewRecommendation
  const mockMastery: ConceptMastery = {
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

  return calculateReviewRecommendation(mockMastery);
}
