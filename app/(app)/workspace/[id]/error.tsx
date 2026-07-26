'use client';

import { RouteErrorState } from '@/components/shell/route-error-state';

export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <div className="app-page">
      <div className="container-wide">
        <RouteErrorState
          title="Notebook could not be loaded"
          message="The notebook is temporarily unavailable. Retry the request, or return to the dashboard and open it again."
          reset={reset}
        />
      </div>
    </div>
  );
}
