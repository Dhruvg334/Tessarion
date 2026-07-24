'use client';

import Link from 'next/link';
import { NextAction } from '@/lib/product/next-action';

interface NextActionPanelProps {
  action: NextAction;
}

export function NextActionPanel({ action }: NextActionPanelProps) {
  return (
    <div className="card card-ruled" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)' }}>Next Action: {action.title}</h2>
        {action.priority === 'critical' && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', padding: '0.2rem 0.5rem', border: '2px solid var(--ink)', borderRadius: '2px' }}>
            Critical
          </span>
        )}
      </div>
      <p className="muted" style={{ marginBottom: '1rem' }}>{action.description}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {action.primaryActionHref ? (
          <Link href={action.primaryActionHref} className="btn" style={{ display: 'block', textAlign: 'center' }}>
            {action.primaryActionLabel}
          </Link>
        ) : (
          <button className="btn" style={{ display: 'block', width: '100%' }}>
            {action.primaryActionLabel}
          </button>
        )}
      </div>
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
        <strong>Why?</strong> {action.reason}
      </div>
    </div>
  );
}
