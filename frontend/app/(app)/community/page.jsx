'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, MessageCircle, TrendingUp, Users } from 'lucide-react';
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
      <div className="rounded-3xl border border-ink-100 bg-white/90 p-5 shadow-soft lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-700">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">OMEGA Community</span>
            </div>
            <h1 className="mt-3 font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
              {t('community.title')}
            </h1>
            <p className="mt-2 text-ink-600 max-w-2xl">{t('community.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SocialMetric label="Membres" value="2.4k" />
            <SocialMetric label="Posts" value="18k" />
            <SocialMetric label="Actifs" value="312" />
          </div>
        </div>
      </div>

      <StoryRail />

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

function SocialMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/70 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold text-ink-950">{value}</p>
    </div>
  );
}

function StoryRail() {
  const stories = [
    ['Visa', 'Premium', 'from-brand-400 to-sky-500'],
    ['Ecoles', 'Famille', 'from-emerald-400 to-teal-600'],
    ['Maison', 'Achat', 'from-amber-400 to-orange-500'],
    ['Business', 'Reseau', 'from-rose-400 to-pink-600'],
    ['Weekend', 'Local', 'from-violet-400 to-indigo-600'],
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white/90 p-3 shadow-soft">
      <div className="flex min-w-max gap-3">
        {stories.map(([title, sub, tone]) => (
          <button key={title} className="group w-24 text-center">
            <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${tone} p-0.5 transition group-hover:scale-105`}>
              <span className="grid h-full w-full place-items-center rounded-full border-2 border-white bg-white/15 text-white backdrop-blur">
                {title === 'Business' ? <MessageCircle className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
              </span>
            </span>
            <span className="mt-2 block text-xs font-bold text-ink-900">{title}</span>
            <span className="block text-[10px] text-ink-500">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
