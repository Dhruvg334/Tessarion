import type { ReactNode } from 'react';
import { WorkspaceRail } from './workspace-rail';

export function WorkspaceShell({
  workspaceId,
  workspaceName,
  children,
  context,
}: {
  workspaceId: string;
  workspaceName: string;
  children: ReactNode;
  context?: ReactNode;
}) {
  return (
    <div className={`workspace-shell${context ? ' has-context' : ''}`}>
      <WorkspaceRail workspaceId={workspaceId} workspaceName={workspaceName} />
      <div className="workspace-shell-main">{children}</div>
      {context ? <aside className="workspace-context-rail" aria-label="Notebook context">{context}</aside> : null}
    </div>
  );
}
