'use client';
import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import DataTable from '@/components/admin/DataTable';

const STATUSES = ['open', 'answered', 'closed'];

export default function AdminMessagesPage() {
  const [list, setList] = useState(null);

  useEffect(() => {
    api.messages().then((d) => setList(d.messages)).catch(() => setList([]));
  }, []);

  async function changeStatus(id, status) {
    await api.updateMessage(id, { status });
    setList((curr) => curr.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  if (list === null) return <p className="text-ink-500">Chargement…</p>;

  const cols = [
    { key: 'userName', header: 'De', render: (r) => (
      <div>
        <p className="font-semibold text-ink-900">{r.userName}</p>
        <a href={`mailto:${r.userEmail}`} className="text-xs text-ink-500 hover:text-brand-700 inline-flex items-center gap-1">
          <Mail className="h-3 w-3" /> {r.userEmail}
        </a>
      </div>
    )},
    { key: 'propertyId', header: 'Bien', render: (r) => (
      <Link href={`/properties/${r.propertyId}`} className="text-sm font-semibold text-ink-900 hover:text-brand-700">
        {r.propertyId}
      </Link>
    )},
    { key: 'body', header: 'Message', render: (r) => (
      <p className="text-ink-700 max-w-md line-clamp-3">{r.body}</p>
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
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      <div>
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">Messages</h1>
        <p className="text-sm text-ink-500 mt-1">
          {list.length} message{list.length > 1 ? 's' : ''} ·{' '}
          {list.filter((m) => m.status === 'open').length} ouvert{list.filter((m) => m.status === 'open').length > 1 ? 's' : ''}
        </p>
      </div>
      <DataTable
        rows={list}
        columns={cols}
        searchKeys={['userName', 'userEmail', 'body', 'propertyId']}
        empty="Aucun message."
      />
    </div>
  );
}
