'use client';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AlertCircle, LockKeyhole, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Wraps admin pages. Redirects non-admins to /login and shows a friendly
 * loading/forbidden state while auth resolves.
 */
export default function AdminGuard({ children }) {
  const {
    user,
    isAdmin,
    loading,
    adminSessionReady,
    startAdminSession,
    restoreAdminSession,
  } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (!isAdmin) {
      router.replace('/dashboard');
    }
    if (isAdmin) restoreAdminSession();
  }, [user, isAdmin, loading, router, restoreAdminSession]);

  async function onSubmit(e) {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      await startAdminSession(password);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }

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

  if (!adminSessionReady) {
    return (
      <div className="min-h-screen bg-ink-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
          <div className="grid w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-2xl lg:grid-cols-[1fr_420px]">
            <div className="relative hidden bg-ink-950 p-10 text-white lg:block">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400 text-ink-950 shadow-glow">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h1 className="mt-8 font-display text-4xl font-extrabold leading-tight">
                    Controle admin renforce
                  </h1>
                  <p className="mt-4 max-w-md text-sm leading-6 text-ink-300">
                    Les actions sensibles demandent une confirmation recente du mot de passe. La session privilegiee expire automatiquement.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs text-ink-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Role verifie cote serveur</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Token admin court</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Audit des mutations</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 text-ink-900 sm:p-8 lg:p-10">
              <div className="mb-8">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-extrabold">Confirmer l'acces admin</h2>
                <p className="mt-2 text-sm text-ink-500">
                  Entrez votre mot de passe pour ouvrir le panel d'administration.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-800">Mot de passe</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                    autoComplete="current-password"
                  />
                </label>
                <Button type="submit" loading={verifying} className="h-12 w-full">
                  Ouvrir le panel
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
