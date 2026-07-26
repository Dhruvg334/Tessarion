'use client';

import Link from 'next/link';
import { NextAction } from '@/lib/product/next-action';

export function NextActionPanel({ action }: { action: NextAction }) {
  return (
    <article className="next-action-card">
      <div className="next-action-card-head">
        <div><p className="eyebrow">Recommended action</p><h3>{action.title}</h3></div>
        {action.priority === 'critical' ? <span className="next-action-priority">Priority</span> : null}
      </div>
      <p>{action.description}</p>
      <div className="next-action-reason"><strong>Why this route</strong><span>{action.reason}</span></div>
      {action.primaryActionHref ? (
        <Link href={action.primaryActionHref} className="btn">{action.primaryActionLabel}</Link>
      ) : (
        <button className="btn" type="button">{action.primaryActionLabel}</button>
      )}
    </article>
  );
}
