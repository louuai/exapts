'use client';
import { useEffect, useState } from 'react';
import { Mail, Phone, Trash2, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

const STATUSES = ['new', 'contacted', 'closed'];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState(null);

  async function load() {
    try { const d = await api.leads(); setLeads(d.leads); }
    catch { setLeads([]); }
  }
  useEffect(() => { load(); }, []);

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
    const headers = ['id', 'name', 'email', 'phone', 'source', 'interest', 'status', 'createdAt', 'message'];
    const csv = [
      headers.join(','),
      ...leads.map((l) =>
        headers.map((h) => `"${String(l[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `omega-leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (leads === null) return <p className="text-ink-500">Chargement…</p>;

  const cols = [
    { key: 'name',  header: 'Lead', render: (r) => (
      <div>
        <p className="font-semibold text-ink-900">{r.name}</p>
        <p className="text-xs text-ink-500">{r.source}</p>
      </div>
    )},
    { key: 'contact', header: 'Contact', render: (r) => (
      <div className="space-y-0.5">
        <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 text-ink-700 hover:text-brand-700">
          <Mail className="h-3 w-3" /> {r.email}
        </a>
        {r.phone && (
          <a href={`tel:${r.phone}`} className="block inline-flex items-center gap-1 text-ink-500">
            <Phone className="h-3 w-3" /> {r.phone}
          </a>
        )}
      </div>
    )},
    { key: 'interest', header: 'Intérêt', render: (r) => (
      <span className="inline-flex items-center rounded-full bg-ink-100 text-ink-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        {r.interest}
      </span>
    )},
    { key: 'message', header: 'Message', render: (r) => (
      <p className="text-ink-700 max-w-md line-clamp-2">{r.message || <span className="text-ink-400">—</span>}</p>
    )},
    { key: 'status', header: 'Statut', render: (r) => (
      <select
        value={r.status}
        onChange={(e) => changeStatus(r.id, e.target.value)}
        className="rounded-lg border border-ink-200 bg-white text-xs font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
    { key: 'createdAt', header: 'Reçu', render: (r) => <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span> },
    { key: 'actions', header: '', className: 'text-right', render: (r) => (
      <button onClick={() => remove(r.id)} className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg">
        <Trash2 className="h-4 w-4" />
      </button>
    )},
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      <Header
        title="Leads"
        sub={`${leads.length} leads · ${leads.filter((l) => l.status === 'new').length} non contactés`}
      />
      <DataTable
        rows={leads}
        columns={cols}
        searchKeys={['name', 'email', 'message', 'interest']}
        searchPlaceholder="Rechercher par nom, email, mot-clé…"
        toolbar={
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
        empty="Aucun lead pour le moment."
      />
    </div>
  );
}

function Header({ title, sub }) {
  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">{title}</h1>
      <p className="text-sm text-ink-500 mt-1">{sub}</p>
    </div>
  );
}
