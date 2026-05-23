'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

export default function PartnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.partnerLogin({ email, password });
      window.localStorage.setItem('omega.partnerToken', data.token);
      router.push('/partner/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_42%,#ecfeff_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950 text-brand-300 shadow-soft">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h1 className="mt-7 max-w-2xl font-display text-5xl font-extrabold leading-tight text-ink-950">
            Portail partenaire OMEGA
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-ink-600">
            Gere ton profil professionnel, suis les demandes client et transforme les leads de l'annuaire en conversations directes.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Partner access</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-950">Connexion partenaire</h2>
            <p className="mt-1 text-sm text-ink-500">Compte cree uniquement par l'administration.</p>
          </div>
          {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-800">Email</span>
              <span className="relative block">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-800">Mot de passe</span>
              <span className="relative block">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
              </span>
            </label>
            <Button type="submit" loading={loading} className="h-12 w-full">Ouvrir mon espace</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
