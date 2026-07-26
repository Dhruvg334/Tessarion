import Link from 'next/link';
import { SiteShell } from '@/components/site/site-shell';
import { DemoNotebook } from '@/components/demo/demo-notebook';

export const metadata = {
  title: 'Public Demo Notebook | Tessarion',
  description: 'Explore a complete evidence-linked learning workflow without creating an account.',
};

export default function PublicDemoNotebookPage() {
  return (
    <SiteShell>
      <main className="demo-public-page">
        <div className="container-wide">
          <div className="demo-public-breadcrumb"><Link href="/demo">Demo</Link><span>/</span><span>Computer Memory Hierarchy</span></div>
          <DemoNotebook />
        </div>
      </main>
    </SiteShell>
  );
}
