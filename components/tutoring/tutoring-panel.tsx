'use client';

import { useState, useRef, useEffect } from 'react';
import { TutoringSession, TutoringTurn } from '@/lib/tutoring/types';
import { TutoringTurnItem } from './tutoring-turn';

interface TutoringPanelProps {
  workspaceId: string;
  session: TutoringSession;
  initialTurns: TutoringTurn[];
  onComplete?: () => void;
}

export function TutoringPanel({ workspaceId, session: initialSession, initialTurns, onComplete }: TutoringPanelProps) {
  const [session, setSession] = useState<TutoringSession>(initialSession);
  const [turns, setTurns] = useState<TutoringTurn[]>(initialTurns);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || session.status !== 'active') return;

    const studentText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tutoring/${session.id}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentResponse: studentText }),
      });

      if (!res.ok) throw new Error('Failed to send response');

      const data = await res.json();
      setSession(data.session);
      setTurns(prev => [...prev, ...data.newTurns]);
    } catch (error) {
      console.error(error);
      // A robust UI would show a toast here. For now, we restore the input.
      setInput(studentText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'complete' | 'abandon') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tutoring/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error(`Failed to ${action} session`);

      const data = await res.json();
      setSession(data);
      if (onComplete) onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEnded = session.status !== 'active';

  return (
    <div className="flex flex-col h-[500px] border border-neutral-200 bg-white shadow-sm">
      <div className="flex-none p-3 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-neutral-900">Guided Tutoring</h3>
          <p className="text-xs text-neutral-500">Focus: {session.focusSummary}</p>
        </div>
        <div className="text-xs font-mono text-neutral-400">
          Turn {session.currentTurnCount} / {session.maxTurns}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {turns.map(turn => (
          <TutoringTurnItem key={turn.id} turn={turn} />
        ))}
        {isLoading && (
          <div className="text-left py-3">
            <div className="inline-block px-4 py-2 rounded-sm border bg-white border-neutral-300 text-neutral-400 text-sm italic">
              Saving your response...
            </div>
          </div>
        )}
        {isEnded && (
          <div className="text-center py-4 text-sm text-neutral-500 italic">
            This session has ended. ({session.status})
          </div>
        )}
      </div>

      <div className="flex-none p-3 border-t border-neutral-200 bg-neutral-50">
        {!isEnded ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea 
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="resize-none h-20 text-sm bg-white border-neutral-300 p-2 border rounded-sm"
              disabled={isLoading}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={() => handleAction('abandon')}
                disabled={isLoading}
                className="btn btn-secondary text-neutral-500"
              >
                End Session
              </button>
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="btn bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Reply
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-end">
             <button 
                type="button" 
                onClick={() => { if (onComplete) onComplete(); }}
                className="btn bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Return to Workspace
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
