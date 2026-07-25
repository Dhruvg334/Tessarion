import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Log in | Tessarion',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--paper)' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
