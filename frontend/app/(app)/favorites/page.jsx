'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import PropertyCard from '@/components/feature/PropertyCard';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function FavoritesPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.favorites()
      .then((d) => setFavorites(d.favorites))
      .catch(() => setFavorites([]));
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Heart className="h-10 w-10 mx-auto text-ink-300" />
        <h1 className="font-display font-bold text-2xl mt-4">Connexion requise</h1>
        <p className="text-ink-600 mt-2">Connectez-vous pour retrouver vos biens favoris.</p>
        <Link href="/login" className="inline-flex mt-4 h-11 px-5 items-center bg-ink-900 text-white rounded-xl font-semibold hover:bg-ink-800 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <Heart className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">OMEGA Favorites</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
          {t('favorites.title')}
        </h1>
        <p className="text-ink-600 max-w-2xl">{t('favorites.subtitle')}</p>
      </div>

      {favorites === null && (
        <p className="text-ink-500">{t('common.loading')}</p>
      )}

      {favorites && favorites.length === 0 && (
        <div className="rounded-2xl bg-white border border-ink-100 p-12 text-center text-ink-500">
          {t('favorites.empty')}
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((p) => <PropertyCard key={p.id} property={p} isFavorite />)}
        </div>
      )}
    </div>
  );
}
