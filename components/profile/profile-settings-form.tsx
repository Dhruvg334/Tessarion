'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createClient } from '@/lib/supabase/client';

export function ProfileSettingsForm({ userId, email, initialDisplayName, createdAt }: {
  userId: string;
  email: string;
  initialDisplayName: string;
  createdAt: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = displayName.trim();
    if (value.length > 80) {
      setError('Display name must be 80 characters or fewer.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: value || null })
        .eq('id', userId);
      if (updateError) {
        setError('Profile settings could not be saved.');
        return;
      }
      setMessage('Profile settings saved.');
      router.refresh();
    } catch {
      setError('Profile settings could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-settings-grid">
      <section className="profile-summary-card">
        <span className="profile-large-avatar">{(displayName || email).slice(0, 1).toUpperCase()}</span>
        <div><p className="eyebrow">Signed in as</p><h2>{displayName || 'Tessarion learner'}</h2><p>{email}</p></div>
        <dl><div><dt>Member since</dt><dd>{new Date(createdAt).toLocaleDateString()}</dd></div><div><dt>Account ID</dt><dd>{userId.slice(0, 8)}…</dd></div></dl>
      </section>

      <section id="settings" className="profile-settings-card">
        <div><p className="eyebrow">Settings</p><h2>Profile identity</h2><p>This name appears in your account menu. Your email remains managed by Supabase Auth.</p></div>
        {error ? <p className="notice" role="alert">{error}</p> : null}
        {message ? <p className="notice" role="status">{message}</p> : null}
        <form onSubmit={handleSubmit} className="profile-settings-form">
          <label><span>Display name</span><input className="input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="Your name" /></label>
          <label><span>Email</span><input className="input" value={email} disabled aria-describedby="email-help" /></label>
          <small id="email-help">Email changes require a verified Supabase Auth flow and are not enabled in this release.</small>
          <button type="submit" className="btn" disabled={saving}><Save size={16} />{saving ? 'Saving…' : 'Save settings'}</button>
        </form>
      </section>
    </div>
  );
}
