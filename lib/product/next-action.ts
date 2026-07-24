export type NextActionType =
  | 'create_workspace'
  | 'add_source'
  | 'extract_concepts'
  | 'inspect_graph'
  | 'start_teach_back'
  | 'review_feedback'
  | 'start_review'
  | 'start_tutoring'
  | 'continue_tutoring'
  | 'retry_teach_back'
  | 'light_reinforcement'
  | 'continue_learning';

export interface NextAction {
  type: NextActionType;
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryActionHref?: string;
  action?: string; // used for frontend triggers if href is not applicable
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NextActionContext {
  workspaceId: string;
  sourceDocumentCount: number;
  conceptCount: number;
  teachBackSessionCount: number;
  activeTutoringSessions: { id: string; status: string }[];
  completedTutoringSessionsThisSession: { id: string; status: string }[]; // Or derive from tutoring status
  reviewQueue: { status?: string; computedStatus?: string; priority: string; reason_type: string }[]; // queued or due
  masterySummary: { state: string; conceptId: string }[];
}

export function resolveNextAction(ctx: NextActionContext): NextAction {
  // 1. No source -> add_source
  if (ctx.sourceDocumentCount === 0) {
    return {
      type: 'add_source',
      title: 'Add Source Material',
      description: 'Start by uploading a document or pasting text to build your knowledge base.',
      primaryActionLabel: 'Add Source',
      primaryActionHref: `/workspace/${ctx.workspaceId}/upload`,
      reason: 'No source material found.',
      priority: 'high',
    };
  }

  // 2. Source exists but no concepts -> extract_concepts
  if (ctx.conceptCount === 0) {
    return {
      type: 'extract_concepts',
      title: 'Extract Concepts',
      description: 'We need to process your sources into a concept graph before you can learn.',
      primaryActionLabel: 'Extract Concepts',
      primaryActionHref: `/workspace/${ctx.workspaceId}/upload`, // or a specific extract route
      reason: 'Source exists but concept graph is empty.',
      priority: 'high',
    };
  }

  // 3. Concepts exist but no teach-back -> start_teach_back
  if (ctx.teachBackSessionCount === 0) {
    return {
      type: 'start_teach_back',
      title: 'Start Teach-Back',
      description: 'The best way to learn is to teach. Try explaining a concept to see where you stand.',
      primaryActionLabel: 'Start First Teach-Back',
      primaryActionHref: `/workspace/${ctx.workspaceId}?panel=teach-back`,
      reason: 'No teach-back sessions started yet.',
      priority: 'high',
    };
  }

  // 4. Active tutoring session -> continue_tutoring
  if (ctx.activeTutoringSessions && ctx.activeTutoringSessions.length > 0) {
    const activeSession = ctx.activeTutoringSessions[0];
    return {
      type: 'continue_tutoring',
      title: 'Continue Tutoring',
      description: 'You have an active Socratic tutoring session waiting for your response.',
      primaryActionLabel: 'Continue Session',
      primaryActionHref: `/workspace/${ctx.workspaceId}?panel=tutoring&tutoring=${activeSession.id}`,
      reason: 'User is in the middle of a tutoring loop.',
      priority: 'critical',
    };
  }

  // 5. Tutoring completed -> retry_teach_back
  if (ctx.completedTutoringSessionsThisSession && ctx.completedTutoringSessionsThisSession.length > 0) {
    return {
      type: 'retry_teach_back',
      title: 'Try Teach-Back Again',
      description: 'You just completed a tutoring session. See if you can explain the concept better now.',
      primaryActionLabel: 'Retry Teach-Back',
      primaryActionHref: `/workspace/${ctx.workspaceId}?panel=teach-back`,
      reason: 'Tutoring recently finished without updating mastery directly.',
      priority: 'high',
    };
  }

  // 6. Severe misconception or critical review -> start_tutoring or start_review
  if (ctx.reviewQueue && ctx.reviewQueue.length > 0) {
    // Check for critical priority or misconception
    const criticalReview = ctx.reviewQueue.find(r => r.priority === 'critical' || r.reason_type === 'misconception' || r.reason_type === 'missing_prerequisite');
    if (criticalReview) {
      return {
        type: 'start_tutoring',
        title: 'Address Misconception',
        description: 'You have a critical gap in your understanding that needs addressing.',
        primaryActionLabel: 'Start Tutoring',
        primaryActionHref: `/workspace/${ctx.workspaceId}?panel=review`,
        reason: 'Critical review item detected.',
        priority: 'critical',
      };
    }
  }

  // Standard due reviews
  if (ctx.reviewQueue && ctx.reviewQueue.some(r => r.status === 'due' || r.status === 'overdue')) {
    return {
      type: 'start_review',
      title: 'Review Due Items',
      description: 'You have concepts due for review. Let\'s make sure they stay fresh.',
      primaryActionLabel: 'Start Review',
      primaryActionHref: `/workspace/${ctx.workspaceId}?panel=review`,
      reason: 'Items are due in the review queue.',
      priority: 'medium',
    };
  }

  // 7. Understood concepts with low-priority review -> light_reinforcement
  if (ctx.reviewQueue && ctx.reviewQueue.length > 0) {
    return {
      type: 'light_reinforcement',
      title: 'Light Reinforcement',
      description: 'You have some low-priority concepts you could review if you have time.',
      primaryActionLabel: 'Review Concepts',
      primaryActionHref: `/workspace/${ctx.workspaceId}?panel=review`,
      reason: 'Low priority items in review queue.',
      priority: 'low',
    };
  }

  // 8. Otherwise -> continue_learning
  return {
    type: 'continue_learning',
    title: 'Continue Learning',
    description: 'You are all caught up! Pick a new concept to teach back.',
    primaryActionLabel: 'Explore Concepts',
    primaryActionHref: `/workspace/${ctx.workspaceId}?panel=graph`,
    reason: 'All queues clear.',
    priority: 'low',
  };
}
