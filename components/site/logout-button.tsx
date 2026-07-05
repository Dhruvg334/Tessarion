"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button onClick={handleLogout} disabled={loading} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  );
}
