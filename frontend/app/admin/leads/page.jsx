'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Trash2, Download, Home, Briefcase, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo, formatDate } from '@/lib/utils';
import DataTable from '@/components/admin/DataTable';

const STATUSES = [
  { v: 'new',       label: 'Nouveau' },
  { v: 'contacted', label: 'Contacté' },
  { v: 'converted', label: 'Converti' },
  { v: 'closed',    label: 'Fermé' },
];

const TYPE_META = {
  property: { label: 'Immobilier', icon: Home,      tone: 'bg-brand-50 text-brand-700 border-brand-200' },
  service:  { label: 'Service',    icon: Briefcase, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  general:  { label: 'Général',    icon: Sparkles,  tone: 'bg-ink-50   text-ink-700   border-ink-200'   },
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo]     = useState('');

  async function load() {
    try {
      const params = {};
      if (typeFilter)   params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (from)         params.from = from;
      if (to)           params.to = to;
      const d = await api.adminLeads(params);
      setLeads(d.leads);
    } catch { setLeads([]); }
  }
  useEffect(() => { load(); }, [typeFilter, statusFilter, from, to]);

  async function changeStatus(id, status) {
    await api.updateLead(id, { status });
    setLeads((curr) => curr.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function remove(id) {
    if (!confirm('Supprimer définitivement ce lead ?')) return;
    await api.deleteLead(id);
    setLeads((curr) => curr.filter((l) => l.id !== id));
  }

  function exportCsv() {
    if (!leads?.length) return;
    const headers = ['id', 'type', 'name', 'email', 'phone', 'related', 'source', 'interest', 'status', 'createdAt', 'message'];
    const rows = leads.map((l) => ({
      ...l,
      related: l.property ? `${l.property.title} (${l.property.reference || l.property.id})` :
               l.service  ? `${l.service.name} (${l.service.category})` : '',
    }));
    const csv = [
      headers.join(','),
      ...rows.map((l) => headers.map((h) => `"${String(l[h] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `omega-leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (leads === null) return <p className="text-ink-500">Chargement…</p>;

  const cols = [
    { key: 'name', header: 'Lead', render: (r) => (
      <div>
        <p className="font-semibold text-ink-900">{r.name}</p>
        <p className="text-xs text-ink-500">{r.source}</p>
      </div>
    )},
    { key: 'contact', header: 'Contact', render: (r) => (
      <div className="space-y-0.5 text-xs">
        <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 text-ink-700 hover:text-brand-700">
          <Mail className="h-3 w-3" /> {r.email}
        </a>
        {r.phone && (
          <a href={`tel:${r.phone}`} className="block text-ink-500 mt-0.5">
            <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {r.phone}</span>
          </a>
        )}
      </div>
    )},
    { key: 'type', header: 'Type', render: (r) => {
      const meta = TYPE_META[r.type] || TYPE_META.general;
      const Icon = meta.icon;
      return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      );
    }},
    { key: 'related', header: 'Lié à', render: (r) => {
      if (r.property) return (
        <Link href={`/properties/${r.property.id}`} target="_blank" className="text-sm font-semibold text-ink-800 hover:text-brand-700 line-clamp-1">
          {r.property.reference && <span className="text-[10px] text-ink-400 mr-1">{r.property.reference}</span>}
          {r.property.title}
        </Link>
      );
      if (r.service) return (
        <span className="text-sm font-semibold text-ink-800">
          {r.service.name}
          <span className="text-[10px] text-ink-400 ml-1">({r.service.category})</span>
        </span>
      );
      return <span className="text-xs text-ink-400">—</span>;
    }},
    { key: 'message', header: 'Message', render: (r) => (
      <p className="text-sm text-ink-700 max-w-md line-clamp-2">
        {r.message || <span className="text-ink-400">—</span>}
      </p>
    )},
    { key: 'status', header: 'Statut', render: (r) => (
      <select
        value={r.status}
        onChange={(e) => changeStatus(r.id, e.target.value)}
        className="rounded-lg border border-ink-200 bg-white text-xs font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
      </select>
    )},
    { key: 'createdAt', header: 'Reçu', render: (r) => (
      <div className="text-xs">
        <p className="text-ink-700">{formatDate(r.createdAt)}</p>
        <p className="text-ink-400">{timeAgo(r.createdAt)}</p>
      </div>
    )},
    { key: 'actions', header: '', className: 'text-right', render: (r) => (
      <button onClick={() => remove(r.id)} className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg" title="Supprimer">
        <Trash2 className="h-4 w-4" />
      </button>
    )},
  ];

  const newCount       = leads.filter((l) => l.status === 'new').length;
  const convertedCount = leads.filter((l) => l.status === 'converted').length;

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      <div>
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">Gestion des leads</h1>
        <p className="text-sm text-ink-500 mt-1">
          {leads.length} leads · {newCount} non contactés · {convertedCount} convertis
        </p>
      </div>

      {/* Quick filters */}
      <div className="rounded-2xl bg-white border border-ink-100 shadow-soft p-3 lg:p-4 flex flex-wrap gap-3 items-center">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="">Tous types</option>
          <option value="property">Immobilier</option>
          <option value="service">Service</option>
          <option value="general">Général</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="">Tous statuts</option>
          {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>Du</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="h-10 px-2 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
          <span>au</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="h-10 px-2 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-200" />
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }} className="text-[11px] text-ink-500 hover:text-ink-800 underline">reset</button>
          )}
        </div>
        <button
          onClick={exportCsv}
          className="ml-auto inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <DataTable
        rows={leads}
        columns={cols}
        searchKeys={['name', 'email', 'message', 'interest']}
        searchPlaceholder="Rechercher par nom, email, mot-clé…"
        empty="Aucun lead pour le moment."
      />
    </div>
  );
}
