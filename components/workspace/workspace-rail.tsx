'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const primaryItems = [
  { id: 'study', label: 'Study board' },
  { id: 'sources', label: 'Sources' },
  { id: 'graph', label: 'Knowledge graph' },
  { id: 'teach-back', label: 'Teach-back' },
  { id: 'tutor', label: 'Tutor' },
  { id: 'review', label: 'Reviews' },
  { id: 'activity', label: 'Activity' },
] as const;

export function WorkspaceRail({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPanel = searchParams.get('panel') || 'study';
  const onWorkspaceRoot = pathname === `/workspace/${workspaceId}`;

  return (
    <nav className="workspace-rail workspace-panel-nav" aria-label={`${workspaceName} sections`}>
      {primaryItems.map((item) => {
        const selected = onWorkspaceRoot && currentPanel === item.id;
        return (
          <Link
            key={item.id}
            href={`/workspace/${workspaceId}?panel=${item.id}`}
            aria-current={selected ? 'page' : undefined}
            className={selected ? 'is-active' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
