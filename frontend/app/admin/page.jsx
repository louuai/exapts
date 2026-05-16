'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, Building2, Inbox, CalendarCheck, MessageSquare, Briefcase,
  TrendingUp, ArrowRight, Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';

const TYPE_META = {
  lead:    { label: 'Lead capturé',     tone: 'bg-brand-50 text-brand-700',     href: '/admin/leads',    Icon: Inbox },
  visit:   { label: 'Demande de visite', tone: 'bg-amber-50 text-amber-700',    href: '/admin/visits',   Icon: CalendarCheck },
  message: { label: 'Message',          tone: 'bg-emerald-50 text-emerald-700', href: '/admin/messages', Icon: MessageSquare },
};

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.adminStats().then(setData).catch(() => setData({ stats: null, recentActivity: [] }));
  }, []);

  const s = data?.stats;

  const cards = [
    { label: 'Utilisateurs',      value: s?.users,         icon: Users,        tone: 'sky',     href: '/admin/users' },
    { label: 'Biens immobiliers', value: s?.properties,    icon: Building2,    tone: 'brand',   href: '/admin/properties', sub: s ? `${s.propertiesSale} achat · ${s.propertiesRent} location` : '' },
    { label: 'Services annuaire', value: s?.services,      icon: Briefcase,    tone: 'amber',   href: '/admin/services' },
    { label: 'Leads',             value: s?.leads,         icon: Inbox,        tone: 'emerald', href: '/admin/leads',    sub: s ? `${s.newLeads} nouveaux` : '' },
    { label: 'Demandes visite',   value: s?.visits,        icon: CalendarCheck, tone: 'rose',   href: '/admin/visits',   sub: s ? `${s.pendingVisits} en attente` : '' },
    { label: 'Messages',          value: s?.messages,      icon: MessageSquare, tone: 'violet', href: '/admin/messages', sub: s ? `${s.openMessages} ouverts` : '' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="rounded-3xl bg-gradient-to-br from-ink-900 via-brand-900 to-ink-900 p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay pointer-events-none" />
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(closest-side, #22d3ee, transparent)' }}
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-brand-100 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Admin OMEGA
          </span>
          <h2 className="mt-3 font-display font-extrabold text-2xl lg:text-3xl">
            Bienvenue dans votre tableau de bord business
          </h2>
          <p className="text-white/70 mt-2">
            Gérez les biens, services, leads et utilisateurs depuis un seul endroit.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <KpiCard key={c.label} {...c} index={i} />
        ))}
      </div>

      {/* Recent activity */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-ink-900">Activité récente</h2>
            <p className="text-sm text-ink-500">Les 10 derniers événements business sur la plateforme.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-ink-100 shadow-soft overflow-hidden">
          {data?.recentActivity?.length === 0 && (
            <p className="p-10 text-center text-ink-500">Aucune activité pour le moment.</p>
          )}
          {!data && (
            <ul>
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-4 border-b border-ink-50 last:border-0">
                  <div className="skeleton h-9 w-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-3 w-1/4" />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {data && data.recentActivity?.length > 0 && (
            <ul>
              {data.recentActivity.map((a) => {
                const meta = TYPE_META[a.type] || { label: a.type, tone: 'bg-ink-50 text-ink-700', href: '#', Icon: Inbox };
                const Icon = meta.Icon;
                return (
                  <li key={`${a.type}-${a.id}`}>
                    <Link href={meta.href} className="flex items-center gap-3 px-5 py-3.5 border-b border-ink-50 last:border-0 hover:bg-ink-50/60 transition">
                      <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${meta.tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">
                          <span className="text-ink-500 font-normal">{meta.label} · </span>
                          {a.label}
                        </p>
                        <p className="text-xs text-ink-500 truncate">{a.sub}</p>
                      </div>
                      <p className="text-xs text-ink-400 shrink-0 hidden sm:block">{timeAgo(a.at)}</p>
                      <ArrowRight className="h-4 w-4 text-ink-300 shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, tone, href, sub, index }) {
  const tones = {
    brand:   'from-brand-500 to-brand-700',
    sky:     'from-sky-500 to-sky-700',
    amber:   'from-amber-500 to-amber-700',
    emerald: 'from-emerald-500 to-emerald-700',
    rose:    'from-rose-500 to-rose-700',
    violet:  'from-violet-500 to-violet-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link
        href={href}
        className="block rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-card transition-all p-4 lg:p-5 h-full"
      >
        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${tones[tone]} grid place-items-center text-white shadow-soft`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500 mt-3">{label}</p>
        <p className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900 mt-1">
          {value ?? '…'}
        </p>
        {sub && <p className="text-[11px] text-ink-500 mt-0.5">{sub}</p>}
      </Link>
    </motion.div>
  );
}
