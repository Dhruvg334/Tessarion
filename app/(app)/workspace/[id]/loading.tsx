import { LoadingState } from '@/components/shell/loading-state';

export default function WorkspaceLoading() {
  return (
    <div className="app-page">
      <div className="container-wide">
        <LoadingState type="page" message="Loading notebook…" />
      </div>
    </div>
  );
}
