'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface PanelNavItem {
  id: string;
  label: string;
}

interface ProductPanelNavProps {
  panels: PanelNavItem[];
  defaultPanel: string;
}

export function ProductPanelNav({ panels, defaultPanel }: ProductPanelNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPanel = searchParams.get('panel') || defaultPanel;

  return (
    <nav 
      aria-label="Panel Navigation" 
      style={{ 
        display: 'flex', 
        gap: '2rem', 
        borderBottom: '1px solid var(--line-strong)',
        marginBottom: '2rem',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}
    >
      {panels.map(panel => {
        const isSelected = currentPanel === panel.id;
        
        // Merge with existing search params to not lose anything else
        const params = new URLSearchParams(searchParams.toString());
        params.set('panel', panel.id);
        
        return (
          <Link
            key={panel.id}
            href={`${pathname}?${params.toString()}`}
            aria-current={isSelected ? 'page' : undefined}
            style={{
              padding: '0.75rem 0',
              color: isSelected ? 'var(--ink)' : 'var(--ink-soft)',
              fontWeight: isSelected ? 600 : 400,
              textDecoration: 'none',
              borderBottom: isSelected ? '2px solid var(--ink)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              marginBottom: '-1px' // Overlap the border
            }}
          >
            {panel.label}
          </Link>
        );
      })}
    </nav>
  );
}
