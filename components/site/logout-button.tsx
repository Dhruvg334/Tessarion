"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={loading}
      style={{ 
        color: 'var(--muted)', 
        fontWeight: 500, 
        fontSize: '0.875rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0
      }}
    >
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  );
}
