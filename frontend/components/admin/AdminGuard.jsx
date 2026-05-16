'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Shield } from 'lucide-react';

/**
 * Wraps admin pages. Redirects non-admins to /login and shows a friendly
 * loading/forbidden state while auth resolves.
 */
export default function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-ink-500">
        <p>Chargement…</p>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center text-center p-6">
        <div>
          <Shield className="h-10 w-10 mx-auto text-rose-400" />
          <p className="font-display font-bold text-xl text-ink-900 mt-4">Accès refusé</p>
          <p className="text-ink-500 mt-1">Cette zone est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return children;
}
