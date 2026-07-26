import { redirect } from 'next/navigation';

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/workspace/${id}?panel=activity`);
}
