'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface PanelNavItem { id: string; label: string; }

export function ProductPanelNav({ panels, defaultPanel }: { panels: PanelNavItem[]; defaultPanel: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPanel = searchParams.get('panel') || defaultPanel;

  return (
    <nav className="product-panel-nav" aria-label="Notebook sections">
      {panels.map((panel) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('panel', panel.id);
        const selected = currentPanel === panel.id;
        return <Link key={panel.id} href={`${pathname}?${params.toString()}`} aria-current={selected ? 'page' : undefined}>{panel.label}</Link>;
      })}
    </nav>
  );
}
