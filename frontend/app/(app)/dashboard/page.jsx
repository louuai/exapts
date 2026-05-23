'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, FileCheck2, MessageCircle, Plane, Search } from 'lucide-react';
import HeroBanner from '@/components/feature/HeroBanner';
import GuideCard from '@/components/feature/GuideCard';
import PostCard from '@/components/feature/PostCard';
import PropertyCard from '@/components/feature/PropertyCard';
import { PropertyCardSkeleton, PostSkeleton } from '@/components/ui/Skeleton';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { mockGuides, mockPosts, mockProperties } from '@/lib/mock-fallback';

export default function DashboardPage() {
  const { t } = useI18n();
  const [guides, setGuides] = useState(null);
  const [posts, setPosts] = useState(null);
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    api.guides().then((d) => setGuides(d.guides)).catch(() => setGuides(mockGuides));
    api.posts().then((d) => setPosts(d.posts)).catch(() => setPosts(mockPosts));
    api.properties({ featured: true }).then((d) => setProperties(d.properties))
      .catch(() => setProperties(mockProperties));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn">
      <HeroBanner />

      <SocialRail />

      {/* Guides */}
      <section>
        <SectionHeader
          title={t('home.featured.guides')}
          subtitle={t('home.featured.guides.sub')}
          href="/guides"
          linkLabel={t('home.viewAll')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(guides || mockGuides).slice(0, 6).map((g) => <GuideCard key={g.id} guide={g} />)}
        </div>
      </section>

      {/* Properties */}
      <section>
        <SectionHeader
          title={t('home.featured.properties')}
          subtitle={t('home.featured.properties.sub')}
          href="/properties"
          linkLabel={t('home.viewAll')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties === null
            ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : properties.slice(0, 3).map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </section>

      {/* Community */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SectionHeader
            title={t('home.featured.community')}
            subtitle={t('home.featured.community.sub')}
            href="/community"
            linkLabel={t('home.viewAll')}
          />
          <div className="space-y-4">
            {posts === null
              ? Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)
              : posts.slice(0, 3).map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white border border-ink-100 p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wider font-semibold text-brand-700">À ne pas manquer</p>
            <h3 className="font-display font-bold text-lg mt-1.5 text-ink-900 leading-snug">
              Webinaire : optimiser sa fiscalité à Maurice en 2026
            </h3>
            <p className="text-sm text-ink-600 mt-2">
              Animé par un fiscaliste agréé MRA · 27 mai · 18h GMT+4
            </p>
            <Link
              href="#"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:gap-2 transition-all"
            >
              S&apos;inscrire <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
            <p className="text-xs uppercase tracking-wider font-semibold text-brand-100">Conciergerie</p>
            <h3 className="font-display font-bold text-lg mt-1.5 leading-snug">
              Besoin d'aide pour vos démarches ?
            </h3>
            <p className="text-sm text-brand-50/90 mt-2">
              Notre équipe locale peut prendre en charge visa, comptes bancaires, école, location.
            </p>
            <button className="mt-4 bg-white text-ink-900 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-brand-50 transition">
              Contacter
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SocialRail() {
  const items = [
    { label: 'Visa', Icon: FileCheck2, href: '/guides', tone: 'bg-brand-50 text-brand-700 border-brand-100' },
    { label: 'Logement', Icon: Building2, href: '/properties', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Communaute', Icon: MessageCircle, href: '/community', tone: 'bg-rose-50 text-rose-700 border-rose-100' },
    { label: 'Services', Icon: Search, href: '/services', tone: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Arrivee', Icon: Plane, href: '/guides', tone: 'bg-sky-50 text-sky-700 border-sky-100' },
  ];

  return (
    <section className="overflow-x-auto rounded-2xl border border-ink-100 bg-white/86 p-3 shadow-soft">
      <div className="flex min-w-max items-center gap-3">
        {items.map(({ label, Icon, href, tone }) => (
          <Link
            key={label}
            href={href}
            className="group flex w-28 flex-col items-center gap-2 rounded-xl px-3 py-3 text-center transition hover:bg-ink-50"
          >
            <span className={`grid h-14 w-14 place-items-center rounded-2xl border ${tone} transition group-hover:scale-[1.03]`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold text-ink-800">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, href, linkLabel }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="font-display font-bold text-2xl tracking-tight text-ink-900">
          {title}
        </h2>
        <p className="text-sm text-ink-600 mt-0.5">{subtitle}</p>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:gap-2 transition-all"
        >
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
