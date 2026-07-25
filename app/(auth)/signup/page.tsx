import { Suspense } from 'react';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata = {
  title: 'Sign up | Tessarion',
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--paper)' }}>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
