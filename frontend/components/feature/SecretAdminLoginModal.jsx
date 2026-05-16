'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, Mail, Lock, LogIn } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';

/**
 * Hidden admin door — opens when the user clicks the OMEGA logo 5 times in
 * quick succession. If the user is already signed in as admin we redirect
 * straight away. Otherwise we ask for admin credentials.
 */
export default function SecretAdminLoginModal({ open, onClose }) {
  const { login, isAdmin, user } = useAuth();
  const [email, setEmail] = useState('admin@omega.mu');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Already an admin? Just open the admin panel.
  useEffect(() => {
    if (open && user && isAdmin) {
      onClose();
      window.location.assign('/admin');
    }
  }, [open, user, isAdmin, onClose]);

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const u = await login(email, password);
      if (u.role !== 'admin') {
        setError('Ce compte n\'a pas les droits administrateur.');
        return;
      }
      onClose();
      // Use a hard navigation here so we cleanly leave the marketing layout
      // and pick up the /admin layout + AdminGuard without any client-side
      // routing race conditions with the modal close animation.
      window.location.assign('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Accès administrateur"
      subtitle="Cette zone est réservée aux administrateurs OMEGA."
      maxWidth="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-ink-900 text-white px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500 grid place-items-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-bold">Porte cachée détectée</p>
            <p className="text-white/70 text-xs">5 clics sur le logo · entrée OWNER</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-ink-800 mb-1.5">Email administrateur</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-800 mb-1.5">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              autoComplete="current-password"
            />
          </div>
        </div>

        <Button type="submit" loading={loading} variant="dark" className="w-full h-11 rounded-xl">
          <LogIn className="h-4 w-4" />
          {loading ? 'Connexion…' : 'Entrer dans le panel admin'}
        </Button>

        <p className="text-[11px] text-ink-500 text-center">
          Démo : <code className="bg-ink-100 px-1.5 py-0.5 rounded">admin@omega.mu / admin1234</code>
        </p>
      </form>
    </Modal>
  );
}
