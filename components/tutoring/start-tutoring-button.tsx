'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TutoringFocusType } from '@/lib/tutoring/types';

interface StartTutoringButtonProps {
  workspaceId: string;
  conceptId: string;
  teachBackSessionId?: string;
  reviewScheduleId?: string;
  focusType?: TutoringFocusType;
  focusSummary?: string;
  className?: string;
  onSessionStarted?: (sessionId: string) => void;
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error || data.message || 'Could not start guided tutoring.';
  } catch {
    return 'Could not start guided tutoring.';
  }
}

export function StartTutoringButton({
  workspaceId,
  conceptId,
  teachBackSessionId,
  reviewScheduleId,
  focusType,
  focusSummary,
  className,
  onSessionStarted,
}: StartTutoringButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStart = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tutoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId, teachBackSessionId, reviewScheduleId, focusType, focusSummary }),
      });
      if (!response.ok) throw new Error(await readError(response));

      const payload = (await response.json()) as { session?: { id?: string } };
      if (!payload.session?.id) throw new Error('Tutor session started without a valid identifier.');

      if (onSessionStarted) onSessionStarted(payload.session.id);
      else router.push(`/workspace/${workspaceId}?tutoring=${payload.session.id}`);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not start guided tutoring.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tutoring-start-control">
      <button type="button" onClick={handleStart} disabled={isLoading} className={className || 'btn'}>
        {isLoading ? 'Starting tutor…' : 'Start guided tutoring'}
      </button>
      {error ? <span role="alert">{error}</span> : null}
    </div>
  );
}
