'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CalendarDays,
  HeartHandshake,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  TrendingUp,
  Users,
} from 'lucide-react';
import PostCard from '@/components/feature/PostCard';
import PostComposer from '@/components/feature/PostComposer';
import UserSearchInput from '@/components/feature/UserSearchInput';
import { PostSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { mockPosts } from '@/lib/mock-fallback';

const trending = [
  ['Premium Visa', '124 posts', 'bg-sky-100 text-sky-700'],
  ['Ecoles internationales', '89 posts', 'bg-emerald-100 text-emerald-700'],
  ['Achat immobilier PDS', '73 posts', 'bg-amber-100 text-amber-700'],
  ['Conduite a gauche', '41 posts', 'bg-violet-100 text-violet-700'],
  ['MCB vs SBM', '38 posts', 'bg-rose-100 text-rose-700'],
];

const activeMembers = [
  ['Claire Vidal', 'u-claire', 'Tamarin', '1438761681033-6461ffad8d80'],
  ['Marc Dupont', 'u-marc', 'Grand Baie', '1507003211169-0a1dd7228f2d'],
  ['Sophie Martin', 'u-sophie', 'Flic-en-Flac', '1544005313-94ddf0286df2'],
  ['Alexandre Noel', 'u-alex', 'Moka', '1500648767791-00dcc994a43e'],
  ['Nadia Perrin', 'u-nadia', 'Curepipe', '1494790108377-be9c29b29330'],
];

export default function CommunityPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    api.posts().then((d) => setPosts(d.posts)).catch(() => setPosts(mockPosts));
  }, []);

  return (
    <div className="mx-auto max-w-7xl animate-fadeIn">
      <div className="overflow-hidden rounded-[2rem] border border-ink-100 bg-[#f4f7fb] shadow-soft">
        <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <Link href="/community" className="flex shrink-0 items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-700 text-white shadow-soft">
                <Users className="h-5 w-5" />
              </span>
              <span className="hidden font-display text-xl font-extrabold text-ink-950 sm:inline">
                Community.
              </span>
            </Link>

            <UserSearchInput
              placeholder="Rechercher amis, groupes, sujets"
              className="mx-auto hidden w-full max-w-xl md:block"
            />

            <div className="ml-auto flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-ink-50 text-ink-700 transition hover:bg-ink-100" aria-label="Messages">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-ink-50 text-ink-700 transition hover:bg-ink-100" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </button>
              {user?.avatar && (
                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-soft" />
              )}
            </div>
          </div>
          <UserSearchInput
            placeholder="Rechercher amis, groupes, sujets"
            className="mt-3 md:hidden"
          />
        </header>

        <div className="grid gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-6">
          <main className="min-w-0 space-y-4">
            <section className="rounded-3xl border border-white bg-white/95 p-5 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold uppercase text-brand-700">
                    <HeartHandshake className="h-3.5 w-3.5" />
                    OMEGA Community
                  </div>
                  <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-950 lg:text-4xl">
                    {t('community.title')}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">
                    {t('community.subtitle')}
                  </p>
                </div>
              </div>
            </section>

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
          </main>

          <aside className="hidden space-y-4 lg:block">
            <div className="rounded-3xl border border-white bg-white/95 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-extrabold text-ink-950">Evenements</h3>
                  <p className="mt-1 text-xs leading-5 text-ink-500">
                    Claire et 3 autres membres ont un evenement cette semaine.
                  </p>
                </div>
                <button className="grid h-7 w-7 place-items-center rounded-full text-ink-400 hover:bg-ink-50" aria-label="Options">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white bg-white/95 p-4 shadow-soft">
              <h3 className="mb-3 flex items-center gap-2 font-display text-base font-extrabold text-ink-950">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                Derniere activite
              </h3>
              <ul className="space-y-3">
                {trending.map(([tag, count, tone]) => (
                  <li key={tag} className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${tone}`}>
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-800">#{tag}</p>
                      <p className="text-xs text-ink-500">{count}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white bg-white/95 p-4 shadow-soft">
              <h3 className="mb-3 font-display text-base font-extrabold text-ink-950">Membres actifs</h3>
              <ul className="space-y-2.5">
                {activeMembers.map(([name, uid, loc, id]) => (
                  <li key={uid}>
                    <Link href={`/users/${uid}`} className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-ink-50">
                      <span className="relative shrink-0">
                        <img src={`https://images.unsplash.com/photo-${id}?w=96&q=80`} alt="" className="h-9 w-9 rounded-full object-cover" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink-900">{name}</p>
                        <p className="flex items-center gap-1 text-xs text-ink-500">
                          <MapPin className="h-3 w-3" />
                          {loc}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white bg-gradient-to-br from-brand-700 to-sky-600 p-4 text-white shadow-soft">
              <CalendarDays className="h-5 w-5" />
              <h3 className="mt-3 font-display text-lg font-extrabold">Meetup expats</h3>
              <p className="mt-1 text-sm text-white/80">
                Vendredi a Grand Baie. Rencontres, questions pratiques et reseau local.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
