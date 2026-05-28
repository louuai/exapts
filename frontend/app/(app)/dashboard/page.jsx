'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Building2, FileCheck2, Mail, MapPin, MessageCircle, Phone, Plane, Search, Star } from 'lucide-react';
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
  const [services, setServices] = useState(null);
  const [matching, setMatching] = useState(null);
  const [serviceChats, setServiceChats] = useState(null);

  useEffect(() => {
    api.guides().then((d) => setGuides(d.guides)).catch(() => setGuides(mockGuides));
    api.posts().then((d) => setPosts(d.posts)).catch(() => setPosts(mockPosts));
    api.properties({ featured: true }).then((d) => setProperties(d.properties))
      .catch(() => setProperties(mockProperties));
    api.services().then((d) => setServices(d.services || [])).catch(() => setServices([]));
    api.matchingMe().then((d) => setMatching(d)).catch(() => setMatching(null));
    api.myLeadChats().then((d) => setServiceChats(d.chats || [])).catch(() => setServiceChats([]));
  }, []);

  const recommendedProperties = matching?.properties?.length ? matching.properties : properties;
  const recommendedServices = matching?.services?.length ? matching.services : services;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn">
      <HeroBanner />

      {matching?.score && (
        <section className="rounded-3xl border border-brand-100 bg-white/90 p-5 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Experience personnalisee</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink-950">
                Profil {matching.score.segment} · score {matching.score.totalScore}
              </h2>
              <p className="mt-1 text-sm text-ink-600">Vos biens, services et guides sont maintenant classes selon votre projet.</p>
            </div>
            <Link href="/onboarding" className="inline-flex h-10 items-center justify-center rounded-xl border border-ink-200 px-3 text-sm font-bold text-ink-700 hover:bg-ink-50">
              Ajuster mon profil
            </Link>
          </div>
        </section>
      )}

      <SocialRail />

      {/* Services */}
      <section>
        <SectionHeader
          title="Services recommandes"
          subtitle="Prestataires utiles pour votre installation a Maurice."
          href="/services"
          linkLabel={t('home.viewAll')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {recommendedServices === null
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)
            : recommendedServices?.slice(0, 3).map((service) => <DashboardServiceCard key={service.id} service={service} />)}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Messages services"
          subtitle="Vos conversations de travail avec les prestataires."
          href="/services"
          linkLabel="Nouveau devis"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {serviceChats === null && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          {serviceChats?.length === 0 && (
            <div className="rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500 shadow-soft lg:col-span-3">
              Aucun message service. Demandez un devis pour ouvrir un espace de discussion avec un partenaire.
            </div>
          )}
          {serviceChats?.slice(0, 3).map((chat) => (
            <Link key={chat.id} href={`/lead-chat/${chat.id}?email=${encodeURIComponent(chat.email)}`} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{chat.service?.category || 'Service'}</p>
              <h3 className="mt-1 font-display text-lg font-bold text-ink-950">{chat.service?.name || 'Conversation service'}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-ink-600">{chat.lastMessage?.body || chat.message || 'Ouvrir la conversation'}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-ink-500">
                <MessageCircle className="h-3.5 w-3.5" /> {(chat.messages || []).length} message{(chat.messages || []).length > 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </section>

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
            : recommendedProperties?.slice(0, 3).map((p) => <PropertyCard key={p.id} property={p} />)}
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

function DashboardServiceCard({ service }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article
      onClick={() => setExpanded((value) => !value)}
      className={`cursor-pointer overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition hover:shadow-card ${expanded ? 'md:col-span-2 xl:col-span-2' : ''}`}
    >
      <div className="relative h-40 bg-ink-100">
        {service.image ? (
          <img src={service.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-ink-300"><Briefcase className="h-8 w-8" /></div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-800">
          {service.category}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold leading-tight text-ink-950">{service.name}</h3>
            {service.location && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                <MapPin className="h-3 w-3" /> {service.location}
              </p>
            )}
          </div>
          {service.rating > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {service.rating}
            </span>
          )}
        </div>
        <p className={`mt-3 text-sm leading-6 text-ink-600 ${expanded ? '' : 'line-clamp-3'}`}>
          {service.description || 'Description a venir.'}
        </p>
        {expanded && (
          <div className="mt-4 grid gap-2 rounded-2xl bg-ink-50 p-4 text-sm text-ink-700 sm:grid-cols-2">
            <p><strong>Categorie:</strong> {service.category}</p>
            <p><strong>Avis:</strong> {service.reviews || 0}</p>
            {service.contact?.phone && <a onClick={(e) => e.stopPropagation()} href={`tel:${service.contact.phone}`} className="inline-flex items-center gap-1 font-semibold text-brand-700"><Phone className="h-4 w-4" /> {service.contact.phone}</a>}
            {service.contact?.email && <a onClick={(e) => e.stopPropagation()} href={`mailto:${service.contact.email}`} className="inline-flex items-center gap-1 font-semibold text-brand-700"><Mail className="h-4 w-4" /> Email</a>}
          </div>
        )}
      </div>
    </article>
  );
}
