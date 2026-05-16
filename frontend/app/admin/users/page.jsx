'use client';
import { useEffect, useState } from 'react';
import { Mail, MapPin, Shield, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import DataTable from '@/components/admin/DataTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.adminUsers().then((d) => setUsers(d.users)).catch(() => setUsers([]));
  }, []);

  if (users === null) return <p className="text-ink-500">Chargement…</p>;

  const cols = [
    { key: 'user', header: 'Utilisateur', render: (r) => (
      <div className="flex items-center gap-3">
        <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-soft" />
        <div>
          <p className="font-semibold text-ink-900">{r.name}</p>
          <p className="text-xs text-ink-500 flex items-center gap-1">
            <Mail className="h-3 w-3" /> {r.email}
          </p>
        </div>
      </div>
    )},
    { key: 'phone', header: 'Téléphone', render: (r) => <span className="text-sm text-ink-700">{r.phone || '—'}</span> },
    { key: 'location', header: 'Localité', render: (r) => (
      r.location ? <span className="inline-flex items-center gap-1 text-sm text-ink-700"><MapPin className="h-3 w-3" /> {r.location}</span> : '—'
    )},
    { key: 'role', header: 'Rôle', render: (r) => (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        r.role === 'admin'
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-ink-50 text-ink-700 border-ink-200'
      }`}>
        {r.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
        {r.role || 'user'}
      </span>
    )},
    { key: 'createdAt', header: 'Inscrit le', render: (r) => <span className="text-xs text-ink-500">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      <div>
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">Utilisateurs</h1>
        <p className="text-sm text-ink-500 mt-1">{users.length} inscrits sur la plateforme</p>
      </div>
      <DataTable
        rows={users}
        columns={cols}
        searchKeys={['name', 'email', 'location']}
        empty="Aucun utilisateur."
      />
    </div>
  );
}
