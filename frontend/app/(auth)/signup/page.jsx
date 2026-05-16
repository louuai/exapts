'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import { AlertCircle, Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup({ name, email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display font-extrabold text-3xl text-ink-900">
        {t('auth.signup.title')}
      </h1>
      <p className="text-ink-600 mt-2">{t('auth.signup.subtitle')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-ink-800 mb-1.5">
            {t('auth.signup.name')}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-800 mb-1.5">
            {t('auth.login.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-800 mb-1.5">
            {t('auth.login.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none transition"
            />
          </div>
          <p className="text-xs text-ink-500 mt-1">6 caractères minimum</p>
        </div>

        <Button type="submit" loading={loading} className="w-full h-12 mt-2">
          {loading ? t('auth.signup.submitting') : t('auth.signup.submit')}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        {t('auth.signup.haveAccount')}{' '}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          {t('auth.signup.loginLink')}
        </Link>
      </p>
    </div>
  );
}
