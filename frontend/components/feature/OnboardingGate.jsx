'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function OnboardingGate({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    async function check() {
      if (loading) return;
      if (!user) {
        if (active) setChecking(false);
        return;
      }
      try {
        const data = await api.onboardingMe();
        if (!active) return;
        if (data.incomplete && pathname !== '/onboarding') {
          router.replace('/onboarding');
          return;
        }
      } catch {
        // Let the existing auth guards/pages handle errors.
      } finally {
        if (active) setChecking(false);
      }
    }
    check();
    return () => { active = false; };
  }, [loading, user?.id, pathname, router]);

  if (checking) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm font-semibold text-ink-500">
        Preparation de votre experience OMEGA...
      </div>
    );
  }
  return children;
}
