'use client';
import { useEffect, useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import GuideCard from '@/components/feature/GuideCard';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { mockGuides } from '@/lib/mock-fallback';
import { cn } from '@/lib/utils';

export default function GuidesPage() {
  const { t } = useI18n();
  const [guides, setGuides] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.guides().then((d) => setGuides(d.guides)).catch(() => setGuides(mockGuides));
  }, []);

  const categories = useMemo(() => {
    const list = guides || mockGuides;
    return ['', ...new Set(list.map((g) => g.category))];
  }, [guides]);

  const filtered = useMemo(() => {
    const list = guides || mockGuides;
    return list.filter((g) => {
      if (category && g.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        return g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [guides, query, category]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <BookOpen className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">OMEGA Guides</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
          {t('guides.title')}
        </h1>
        <p className="text-ink-600 max-w-2xl">{t('guides.subtitle')}</p>
      </div>

      <div className="rounded-2xl bg-white border border-ink-100 shadow-soft p-3 lg:p-4 flex flex-col lg:flex-row gap-3">
        <input
          type="search"
          placeholder="Rechercher un guide…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 px-4 flex-1 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c || 'all'}
              onClick={() => setCategory(c)}
              className={cn(
                'h-10 px-3 rounded-xl text-sm font-semibold transition',
                category === c
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              )}
            >
              {c || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((g) => <GuideCard key={g.id} guide={g} />)}
      </div>
    </div>
  );
}
