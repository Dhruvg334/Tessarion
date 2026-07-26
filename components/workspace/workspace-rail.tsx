'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const primaryItems = [
  { id: 'study', label: 'Study board' },
  { id: 'sources', label: 'Sources' },
  { id: 'graph', label: 'Knowledge graph' },
  { id: 'teach-back', label: 'Teach-back' },
  { id: 'review', label: 'Reviews' },
  { id: 'activity', label: 'Activity' },
] as const;

export function WorkspaceRail({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPanel = searchParams.get('panel') || 'study';
  const onWorkspaceRoot = pathname === `/workspace/${workspaceId}`;

  return (
    <aside className="workspace-rail" aria-label={`${workspaceName} navigation`}>
      <div className="workspace-rail-heading">
        <span className="workspace-rail-kicker">Notebook</span>
        <strong title={workspaceName}>{workspaceName}</strong>
      </div>

      <nav className="workspace-rail-nav" aria-label="Learning areas">
        {primaryItems.map((item, index) => {
          const selected = onWorkspaceRoot && currentPanel === item.id;
          return (
            <Link
              key={item.id}
              href={`/workspace/${workspaceId}?panel=${item.id}`}
              aria-current={selected ? 'page' : undefined}
              className={selected ? 'is-active' : undefined}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <em>{item.label}</em>
            </Link>
          );
        })}
      </nav>

      <div className="workspace-rail-secondary" aria-label="Notebook tools">
        <Link className={pathname.endsWith('/upload') ? 'is-active' : undefined} href={`/workspace/${workspaceId}/upload`}>Add source</Link>
        <Link className={pathname.endsWith('/settings') ? 'is-active' : undefined} href={`/workspace/${workspaceId}/settings`}>Settings</Link>
      </div>
    </aside>
  );
}
