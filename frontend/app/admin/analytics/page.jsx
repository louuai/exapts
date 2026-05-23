'use client';
import { useEffect, useState } from 'react';
import { Activity, Building2, Briefcase, Inbox, Users, MessageSquare, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.adminStats().then(setData).catch(() => setData({ stats: null, analytics: null }));
  }, []);

  if (!data) return <p className="text-ink-500">Chargement...</p>;

  const analytics = data.analytics || {};
  const stats = data.stats || {};

  const cards = [
    { label: 'Utilisateurs', value: analytics.users?.total ?? stats.users ?? 0, sub: `${analytics.users?.roles?.find((r) => r.role === 'admin')?.count || 0} admins`, Icon: Users, tone: 'sky' },
    { label: 'Leads', value: analytics.leads?.total ?? stats.leads ?? 0, sub: `${analytics.business?.conversionRate || 0}% convertis`, Icon: Inbox, tone: 'emerald' },
    { label: 'Contenu social', value: analytics.content?.posts ?? stats.posts ?? 0, sub: `${analytics.content?.comments || 0} commentaires`, Icon: Activity, tone: 'brand' },
    { label: 'Messages', value: analytics.content?.chatMessages ?? 0, sub: `${analytics.content?.conversations || 0} conversations`, Icon: MessageSquare, tone: 'violet' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900 lg:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-ink-500">Vue consolidee des utilisateurs, leads, inventaires, contenu et actions admin.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <KpiCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Croissance utilisateurs (30j)" icon={Users}>
          <MiniBars rows={analytics.users?.growth30d || []} color="bg-sky-500" />
        </Panel>
        <Panel title="Croissance leads (30j)" icon={Inbox}>
          <MiniBars rows={analytics.leads?.growth30d || []} color="bg-emerald-500" />
        </Panel>
        <Panel title="Publications (30j)" icon={Activity}>
          <MiniBars rows={analytics.publishing?.growth30d || []} color="bg-brand-500" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Repartition des utilisateurs" icon={Users}>
          <ShareList rows={analytics.users?.roles || []} keyField="role" labelField="role" />
        </Panel>
        <Panel title="Statuts des leads" icon={Inbox}>
          <ShareList rows={analytics.leads?.statuses || []} keyField="status" labelField="status" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Biens par region" icon={Building2}>
          <ShareList rows={analytics.inventory?.propertiesByRegion || []} keyField="region" labelField="region" />
        </Panel>
        <Panel title="Services par categorie" icon={Briefcase}>
          <ShareList rows={analytics.inventory?.servicesByCategory || []} keyField="category" labelField="category" />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Origines des leads" icon={Inbox}>
          <ShareList rows={analytics.leads?.sources || []} keyField="source" labelField="source" />
        </Panel>
        <Panel title="Charge business" icon={MessageSquare}>
          <div className="grid grid-cols-2 gap-3">
            <MetricTile label="Demandes a traiter" value={analytics.business?.responseLoad || 0} />
            <MetricTile label="Taux d'engagement/post" value={analytics.publishing?.engagementRate || 0} />
            <MetricTile label="Notifications stockees" value={analytics.content?.notifications || 0} />
            <MetricTile label="Messages ouverts" value={stats.openMessages || 0} />
          </div>
        </Panel>
      </div>

      <Panel title="Dernieres actions admin" icon={ShieldCheck}>
        <div className="space-y-3">
          {(analytics.adminLogs || []).length === 0 && <p className="text-sm text-ink-500">Aucune action journalisee.</p>}
          {(analytics.adminLogs || []).map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{log.action}</p>
                <p className="truncate text-xs text-ink-500">{log.actorEmail} · {log.targetType || 'systeme'} · {log.targetId || 'n/a'}</p>
              </div>
              <span className="shrink-0 text-[11px] text-ink-400">{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function KpiCard({ label, value, sub, Icon, tone }) {
  const tones = {
    brand: 'from-brand-500 to-brand-700',
    sky: 'from-sky-500 to-sky-700',
    emerald: 'from-emerald-500 to-emerald-700',
    violet: 'from-violet-500 to-violet-700',
  };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-soft`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{sub}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MiniBars({ rows, color }) {
  const max = Math.max(1, ...rows.map((row) => row.value || 0));
  if (!rows.length) return <p className="text-sm text-ink-500">Pas encore de donnees.</p>;
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key} className="grid grid-cols-[52px_1fr_32px] items-center gap-3">
          <span className="text-[11px] text-ink-500">{row.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max((row.value / max) * 100, row.value ? 6 : 0)}%` }} />
          </div>
          <span className="text-right text-[11px] font-semibold text-ink-700">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function ShareList({ rows, keyField, labelField }) {
  const total = rows.reduce((acc, row) => acc + (row.count || 0), 0);
  if (!rows.length) return <p className="text-sm text-ink-500">Pas encore de donnees.</p>;
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const percent = total ? Math.round(((row.count || 0) / total) * 100) : 0;
        return (
          <div key={row[keyField]} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-ink-800">{row[labelField]}</span>
              <span className="shrink-0 text-xs text-ink-500">{row.count} · {percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-ink-900" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricTile({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{value}</p>
    </div>
  );
}
