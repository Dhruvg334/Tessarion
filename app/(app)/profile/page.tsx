import { redirect } from 'next/navigation';

import { ProfileSettingsForm } from '@/components/profile/profile-settings-form';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata = { title: 'Profile | Tessarion' };

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login?next=/profile');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, created_at')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="app-page profile-page">
      <div className="container profile-container">
        <header className="profile-page-header">
          <p className="eyebrow">Account</p>
          <h1>Your profile</h1>
          <p>Keep the account identity used across notebooks, reviews, tutoring sessions, and traces.</p>
        </header>
        <ProfileSettingsForm
          userId={user.id}
          email={user.email}
          initialDisplayName={profile?.display_name ?? ''}
          createdAt={profile?.created_at ?? user.created_at}
        />
      </div>
    </div>
  );
}
