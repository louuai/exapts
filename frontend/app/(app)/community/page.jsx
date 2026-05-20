'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, TrendingUp } from 'lucide-react';
import PostCard from '@/components/feature/PostCard';
import PostComposer from '@/components/feature/PostComposer';
import UserSearchInput from '@/components/feature/UserSearchInput';
import { PostSkeleton } from '@/components/ui/Skeleton';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { mockPosts } from '@/lib/mock-fallback';

export default function CommunityPage() {
  const { t } = useI18n();
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    api.posts().then((d) => setPosts(d.posts)).catch(() => setPosts(mockPosts));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <Users className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">OMEGA Community</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
          {t('community.title')}
        </h1>
        <p className="text-ink-600 max-w-2xl">{t('community.subtitle')}</p>
      </div>

      {/* Search bar — find any member of the community */}
      <div className="rounded-2xl bg-white border border-ink-100 shadow-soft p-3">
        <UserSearchInput placeholder="Rechercher un membre par nom, localité…" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <PostComposer
            onPosted={(p) => setPosts((curr) => [p, ...(curr || [])])}
          />

          {posts === null
            ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            : posts.map((p) => (
                <PostCard
                  key={p.feedKey || p.id}
                  post={p}
                  onDeleted={(id) => setPosts((curr) => curr.filter((x) => x.id !== id))}
                  onUpdated={(u) => setPosts((curr) => curr.map((x) => (x.id === u.id ? { ...x, ...u } : x)))}
                />
              ))}
        </div>

        <aside className="space-y-4 hidden xl:block">
          <div className="rounded-2xl bg-white border border-ink-100 p-5 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600" /> Sujets du moment
            </h3>
            <ul className="space-y-3">
              {[
                { tag: 'Premium Visa', count: 124 },
                { tag: 'Écoles internationales', count: 89 },
                { tag: 'Achat immobilier PDS', count: 73 },
                { tag: 'Conduite à gauche', count: 41 },
                { tag: 'MCB vs SBM', count: 38 },
              ].map((it) => (
                <li key={it.tag} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-800">#{it.tag}</span>
                  <span className="text-xs text-ink-500">{it.count} posts</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white border border-ink-100 p-5 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink-900 mb-3">Membres actifs</h3>
            <ul className="space-y-2">
              {[
                ['Claire Vidal',  'u-claire', 'Tamarin',       '1438761681033-6461ffad8d80'],
                ['Marc Dupont',   'u-marc',   'Grand Baie',    '1507003211169-0a1dd7228f2d'],
                ['Sophie Martin', 'u-sophie', 'Flic-en-Flac',  '1544005313-94ddf0286df2'],
              ].map(([name, uid, loc, id]) => (
                <li key={uid}>
                  <Link
                    href={`/users/${uid}`}
                    className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-ink-50 transition"
                  >
                    <img src={`https://images.unsplash.com/photo-${id}?w=96&q=80`} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900 leading-tight">{name}</p>
                      <p className="text-xs text-ink-500">{loc}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
