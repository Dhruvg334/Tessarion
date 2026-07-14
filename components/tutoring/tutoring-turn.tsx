import { TutoringTurn } from '@/lib/tutoring/types';

interface TutoringTurnProps {
  turn: TutoringTurn;
}

export function TutoringTurnItem({ turn }: TutoringTurnProps) {
  const isStudent = turn.role === 'student';
  const isSystem = turn.role === 'system';

  return (
    <div className={`py-3 ${isStudent ? 'text-right' : (!isStudent && !isSystem) ? 'text-left' : 'text-center text-sm text-neutral-500 italic'}`}>
      {!isSystem && (
        <div className={`inline-block px-4 py-2 rounded-sm border max-w-[85%] ${isStudent ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-white border-neutral-300 text-neutral-800'}`}>
          {turn.content}
          
          {/* Subtle grounding indicators */}
          {turn.role === 'tutor' && turn.sourceChunkIds?.length > 0 && (
            <div className="mt-2 text-xs text-neutral-400 font-mono">
              [Ref: {turn.sourceChunkIds.length} source chunk{turn.sourceChunkIds.length > 1 ? 's' : ''}]
            </div>
          )}
        </div>
      )}
      {isSystem && (
        <div>{turn.content}</div>
      )}
    </div>
  );
}
