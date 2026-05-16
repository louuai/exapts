'use client';
import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { timeAgo, formatDate } from '@/lib/utils';
import DataTable from '@/components/admin/DataTable';

const STATUSES = ['pending', 'confirmed', 'done', 'cancelled'];

export default function AdminVisitsPage() {
  const [list, setList] = useState(null);

  useEffect(() => {
    api.visitRequests().then((d) => setList(d.visitRequests)).catch(() => setList([]));
  }, []);

  async function changeStatus(id, status) {
    await api.updateVisitRequest(id, { status });
    setList((curr) => curr.map((v) => (v.id === id ? { ...v, status } : v)));
  }

  if (list === null) return <p className="text-ink-500">Chargement…</p>;

  const cols = [
    { key: 'userName', header: 'Demandeur', render: (r) => (
      <div>
        <p className="font-semibold text-ink-900">{r.userName}</p>
        <div className="flex items-center gap-3 text-xs text-ink-500 mt-0.5">
          <a href={`mailto:${r.userEmail}`} className="inline-flex items-center gap-1 hover:text-brand-700"><Mail className="h-3 w-3" /> {r.userEmail}</a>
          {r.userPhone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {r.userPhone}</span>}
        </div>
      </div>
    )},
    { key: 'propertyId', header: 'Bien', render: (r) => (
      <Link href={`/properties/${r.propertyId}`} className="text-sm font-semibold text-ink-900 hover:text-brand-700">
        {r.propertyId}
      </Link>
    )},
    { key: 'preferredDate', header: 'Date souhaitée', render: (r) => (
      <span className="text-sm text-ink-700">{r.preferredDate ? formatDate(r.preferredDate) : '—'}</span>
    )},
    { key: 'message', header: 'Message', render: (r) => (
      <p className="text-ink-700 max-w-sm line-clamp-2">{r.message || <span className="text-ink-400">—</span>}</p>
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
    { key: 'createdAt', header: 'Reçue', render: (r) => <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      <div>
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">Demandes de visite</h1>
        <p className="text-sm text-ink-500 mt-1">
          {list.length} demande{list.length > 1 ? 's' : ''} ·{' '}
          {list.filter((v) => v.status === 'pending').length} en attente
        </p>
      </div>
      <DataTable
        rows={list}
        columns={cols}
        searchKeys={['userName', 'userEmail', 'propertyId', 'message']}
        empty="Aucune demande de visite."
      />
    </div>
  );
}
