'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

interface ProfileMenuProps {
  email: string;
  displayName?: string | null;
}

export function ProfileMenu({ email, displayName }: ProfileMenuProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const label = displayName?.trim() || email.split('@')[0] || 'Profile';

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.replace('/');
      router.refresh();
      setLoggingOut(false);
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="profile-menu-trigger" aria-label="Open profile menu">
          <span className="profile-menu-avatar" aria-hidden="true">{label.slice(0, 1).toUpperCase()}</span>
          <span className="profile-menu-trigger-copy"><strong>{label}</strong><small>Account</small></span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="profile-menu-content" align="end" sideOffset={10}>
          <div className="profile-menu-identity">
            <strong>{displayName?.trim() || 'Tessarion learner'}</strong>
            <span>{email}</span>
          </div>
          <DropdownMenu.Separator className="profile-menu-separator" />
          <DropdownMenu.Item asChild><Link href="/dashboard" className="profile-menu-item"><LayoutDashboard size={16} />Dashboard</Link></DropdownMenu.Item>
          <DropdownMenu.Item asChild><Link href="/profile" className="profile-menu-item"><UserRound size={16} />Profile</Link></DropdownMenu.Item>
          <DropdownMenu.Item asChild><Link href="/profile#settings" className="profile-menu-item"><Settings size={16} />Settings</Link></DropdownMenu.Item>
          <DropdownMenu.Separator className="profile-menu-separator" />
          <DropdownMenu.Item asChild>
            <button type="button" className="profile-menu-item profile-menu-logout" onClick={handleLogout} disabled={loggingOut}>
              <LogOut size={16} />{loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
