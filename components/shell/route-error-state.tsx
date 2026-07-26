'use client';

import Link from 'next/link';

export function RouteErrorState({
  title,
  message,
  reset,
  backHref = '/dashboard',
  backLabel = 'Back to dashboard',
}: {
  title: string;
  message: string;
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <section className="route-error-state" role="alert" aria-live="assertive">
      <p className="eyebrow">Recovery</p>
      <h1>{title}</h1>
      <p>{message}</p>
      <div className="route-error-actions">
        <button type="button" className="btn" onClick={reset}>Try again</button>
        <Link href={backHref} className="btn btn-secondary">{backLabel}</Link>
      </div>
    </section>
  );
}
