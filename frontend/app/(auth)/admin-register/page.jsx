'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { setUser, clearAdminSession } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const data = await api.adminRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      window.localStorage.setItem('omega.token', data.token);
      clearAdminSession?.();
      setUser?.(data.user);
      setSuccess(true);
      setTimeout(() => router.push('/admin'), 700);
    } catch (err) {
      setError(err.message || 'Impossible de creer le compte admin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <h1 className="mt-5 font-display text-3xl font-extrabold text-ink-900">
        Creer le compte admin
      </h1>
      <p className="mt-2 text-sm leading-6 text-ink-600">
        Cette page appelle <span className="font-semibold text-ink-800">POST /api/admin/register</span>.
        Elle fonctionne seulement tant qu'aucun compte admin n'existe.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Compte admin cree. Redirection vers le dashboard...</span>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-800">
            Nom
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
              placeholder="Admin OMEGA"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-800">
            Email admin
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
              placeholder="admin@example.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-800">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
              placeholder="6 caracteres minimum"
            />
          </div>
          <p className="mt-1 text-xs text-ink-500">6 caracteres minimum</p>
        </div>

        <Button type="submit" loading={loading} className="mt-2 h-12 w-full">
          {loading ? 'Creation...' : 'Creer mon compte admin'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        Compte deja cree ?{' '}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
