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

      {/* Leads breakdown + recent leads (the business heart of OMEGA) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <LeadsBreakdown stats={s} />
        <RecentLeadsWidget leads={data?.recentLeads} />
      </section>

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

function LeadsBreakdown({ stats }) {
  const total    = stats?.leads || 0;
  const property = stats?.leadsProperty || 0;
  const service  = stats?.leadsService  || 0;
  const general  = stats?.leadsGeneral  || 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <Link
      href="/admin/leads"
      className="rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-card transition-all p-5 lg:p-6 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Leads par type</p>
          <p className="font-display font-extrabold text-3xl text-ink-900 mt-1">{stats?.leads ?? '…'}</p>
          <p className="text-xs text-ink-500 mt-0.5">
            {stats ? `${stats.leads24h} dans les 24h · ${stats.leads7d} cette semaine` : '…'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:gap-2 transition-all">
          Voir tout <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <BreakdownRow label="Immobilier"  value={property} pct={pct(property)} tone="brand"   />
        <BreakdownRow label="Services"    value={service}  pct={pct(service)}  tone="amber"   />
        <BreakdownRow label="Général"     value={general}  pct={pct(general)}  tone="ink"     />
      </div>

      <div className="mt-5 pt-4 border-t border-ink-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-ink-500">Nouveaux</p>
          <p className="font-display font-extrabold text-lg text-ink-900">{stats?.newLeads ?? '…'}</p>
        </div>
        <div>
          <p className="text-ink-500">Convertis</p>
          <p className="font-display font-extrabold text-lg text-emerald-700">{stats?.convertedLeads ?? '…'}</p>
        </div>
      </div>
    </Link>
  );
}

function BreakdownRow({ label, value, pct, tone }) {
  const tones = {
    brand:  'bg-brand-500',
    amber:  'bg-amber-500',
    ink:    'bg-ink-400',
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink-700">{label}</span>
        <span className="font-bold text-ink-900">{value} <span className="text-ink-400 font-normal">· {pct}%</span></span>
      </div>
      <div className="h-1.5 mt-1 rounded-full bg-ink-100 overflow-hidden">
        <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RecentLeadsWidget({ leads }) {
  return (
    <div className="lg:col-span-2 rounded-2xl bg-white border border-ink-100 shadow-soft overflow-hidden">
      <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-ink-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Derniers leads</p>
          <p className="font-display font-bold text-lg text-ink-900">À contacter en priorité</p>
        </div>
        <Link href="/admin/leads" className="text-xs font-semibold text-brand-700 hover:underline inline-flex items-center gap-1">
          Voir tout <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {leads === undefined && (
        <ul>
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="px-5 lg:px-6 py-3 border-b border-ink-50 last:border-0 flex items-center gap-3">
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      )}
      {leads?.length === 0 && (
        <p className="p-10 text-center text-ink-500 text-sm">Aucun lead reçu pour le moment.</p>
      )}
      {leads && leads.length > 0 && (
        <ul>
          {leads.map((l) => (
            <li key={l.id}>
              <Link href="/admin/leads" className="flex items-center gap-3 px-5 lg:px-6 py-3 border-b border-ink-50 last:border-0 hover:bg-ink-50/60 transition">
                <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 text-[10px] font-bold uppercase tracking-wider ${
                  l.type === 'property' ? 'bg-brand-50 text-brand-700' :
                  l.type === 'service'  ? 'bg-amber-50 text-amber-700' :
                                          'bg-ink-100   text-ink-700'
                }`}>
                  {l.type?.slice(0, 4) || 'gnl'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink-900 truncate">{l.name}</p>
                    <span className="text-[11px] text-ink-400 shrink-0">{new Date(l.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-0.5">
                    <p className="text-xs text-ink-500 truncate">{l.email}</p>
                    {(l.property || l.service) && (
                      <span className="text-[11px] text-ink-500 truncate max-w-[40%]">
                        → {l.property?.title || l.service?.name}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  l.status === 'new'       ? 'bg-brand-50 text-brand-700 border-brand-200' :
                  l.status === 'contacted' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  l.status === 'converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                             'bg-ink-100   text-ink-700   border-ink-200'
                }`}>
                  {l.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
