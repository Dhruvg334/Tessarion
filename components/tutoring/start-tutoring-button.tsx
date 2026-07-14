'use client';

import { useState } from 'react';
import { TutoringFocusType } from '@/lib/tutoring/types';
import { useRouter } from 'next/navigation';

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

export function StartTutoringButton({
  workspaceId,
  conceptId,
  teachBackSessionId,
  reviewScheduleId,
  focusType,
  focusSummary,
  className,
  onSessionStarted
}: StartTutoringButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tutoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId,
          teachBackSessionId,
          reviewScheduleId,
          focusType,
          focusSummary
        })
      });
      
      if (!res.ok) throw new Error('Failed to start tutoring session');
      
      const { session } = await res.json();
      
      if (onSessionStarted) {
        onSessionStarted(session.id);
      } else {
        router.push(`/workspace/${workspaceId}?tutoring=${session.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleStart} 
      disabled={isLoading}
      className={className || 'btn'}
    >
      {isLoading ? 'Starting...' : 'Start guided tutoring'}
    </button>
  );
}
