'use client';
import { useEffect, useState } from 'react';
import {
  Mail, MapPin, Shield, User as UserIcon, Pencil, Trash2, Plus, MessageSquareMore, BellDot,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import DataTable from '@/components/admin/DataTable';
import AdminUserFormModal from '@/components/admin/AdminUserFormModal';
import Button from '@/components/ui/Button';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.adminUsers().then((d) => setUsers(d.users)).catch(() => setUsers([]));
  }, []);

  async function handleSave(payload) {
    if (editing) {
      const d = await api.adminUpdateUser(editing.id, payload);
      setUsers((curr) => curr.map((row) => row.id === editing.id ? d.user : row));
      return;
    }
    const d = await api.adminCreateUser(payload);
    setUsers((curr) => [d.user, ...curr]);
  }

  async function handleDelete(user) {
    if (!confirm(`Supprimer le compte de ${user.name} ?`)) return;
    await api.adminDeleteUser(user.id);
    setUsers((curr) => curr.filter((row) => row.id !== user.id));
  }

  if (users === null) return <p className="text-ink-500">Chargement...</p>;

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const activeLast30d = users.filter(
    (u) => u.lastLoginAt && (Date.now() - new Date(u.lastLoginAt).getTime()) < 30 * 24 * 60 * 60 * 1000
  ).length;

  const cols = [
    { key: 'user', header: 'Utilisateur', render: (r) => (
      <div className="flex items-center gap-3">
        <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-soft" />
        <div>
          <p className="font-semibold text-ink-900">{r.name}</p>
          <p className="flex items-center gap-1 text-xs text-ink-500">
            <Mail className="h-3 w-3" /> {r.email}
          </p>
        </div>
      </div>
    )},
    { key: 'phone', header: 'Telephone', render: (r) => <span className="text-sm text-ink-700">{r.phone || '-'}</span> },
    { key: 'location', header: 'Localite', render: (r) => (
      r.location ? <span className="inline-flex items-center gap-1 text-sm text-ink-700"><MapPin className="h-3 w-3" /> {r.location}</span> : '-'
    )},
    { key: 'role', header: 'Role', render: (r) => (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        r.role === 'admin'
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-ink-50 text-ink-700'
      }`}>
        {r.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
        {r.role || 'user'}
      </span>
    )},
    { key: 'activity', header: 'Activite', render: (r) => (
      <div className="space-y-1 text-xs text-ink-600">
        <p>{r._count?.posts || 0} posts · {r._count?.followers || 0} followers</p>
        <p className="flex items-center gap-2 text-ink-500">
          <span className="inline-flex items-center gap-1"><MessageSquareMore className="h-3 w-3" /> {r.conversationsCount || 0}</span>
          <span className="inline-flex items-center gap-1"><BellDot className="h-3 w-3" /> {r._count?.notifications || 0}</span>
        </p>
      </div>
    )},
    { key: 'lastLoginAt', header: 'Derniere connexion', render: (r) => (
      <span className="text-xs text-ink-500">{r.lastLoginAt ? formatDate(r.lastLoginAt) : 'Jamais'}</span>
    )},
    { key: 'createdAt', header: 'Inscrit le', render: (r) => <span className="text-xs text-ink-500">{formatDate(r.createdAt)}</span> },
    { key: 'actions', header: '', className: 'text-right', render: (r) => (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => { setEditing(r); setOpen(true); }}
          className="rounded-lg p-1.5 text-ink-700 hover:bg-brand-50 hover:text-brand-700"
          title="Modifier"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleDelete(r)}
          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 lg:text-3xl">Utilisateurs</h1>
          <p className="mt-1 text-sm text-ink-500">{users.length} inscrits sur la plateforme</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-xl">
          <Plus className="h-4 w-4" /> Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Comptes totaux" value={users.length} sub="Base utilisateurs complete" />
        <StatCard label="Admins" value={adminCount} sub={`${users.length - adminCount} utilisateurs standards`} />
        <StatCard label="Actifs 30j" value={activeLast30d} sub="Connexions recentes detectees" />
      </div>

      <DataTable
        rows={users}
        columns={cols}
        searchKeys={['name', 'email', 'location']}
        searchPlaceholder="Rechercher par nom, email, localite..."
        toolbar={(
          <Button variant="secondary" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> Nouveau
          </Button>
        )}
        empty="Aucun utilisateur."
      />

      <AdminUserFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{sub}</p>
    </div>
  );
}
