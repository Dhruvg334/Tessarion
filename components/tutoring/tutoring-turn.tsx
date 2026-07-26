import { TutoringTurn } from '@/lib/tutoring/types';

interface TutoringTurnProps {
  turn: TutoringTurn;
}

const turnLabels: Record<TutoringTurn['turnType'], string> = {
  student_response: 'Your response',
  socratic_question: 'Guiding question',
  hint: 'Small hint',
  correction_prompt: 'Correction prompt',
  source_prompt: 'Source check',
  reflection_prompt: 'Reflection',
  summary: 'Progress summary',
  completion_check: 'Completion check',
};

export function TutoringTurnItem({ turn }: TutoringTurnProps) {
  const isStudent = turn.role === 'student';
  const isSystem = turn.role === 'system';

  if (isSystem) {
    return <div className="tutor-system-turn">{turn.content}</div>;
  }

  return (
    <article className={`tutor-turn ${isStudent ? 'is-student' : 'is-tutor'}`}>
      <div className="tutor-turn-label">
        <span>{turnLabels[turn.turnType]}</span>
        {turn.tutorMove ? <em>{turn.tutorMove.replaceAll('_', ' ')}</em> : null}
      </div>
      <div className="tutor-turn-content">{turn.content}</div>
      {!isStudent && (turn.sourceChunkIds.length > 0 || turn.gapFindingIds.length > 0) ? (
        <div className="tutor-turn-evidence" aria-label="Evidence references">
          {turn.sourceChunkIds.length > 0 ? <span>{turn.sourceChunkIds.length} source reference{turn.sourceChunkIds.length === 1 ? '' : 's'}</span> : null}
          {turn.gapFindingIds.length > 0 ? <span>{turn.gapFindingIds.length} diagnosed gap{turn.gapFindingIds.length === 1 ? '' : 's'}</span> : null}
        </div>
      ) : null}
    </article>
  );
}
