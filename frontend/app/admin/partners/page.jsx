'use client';
import { useEffect, useState } from 'react';
import { Briefcase, Mail, Phone, Plus, Power, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/admin/DataTable';

const EMPTY = {
  email: '',
  password: '',
  name: '',
  companyName: '',
  phone: '',
  avatar: '',
  bio: '',
  location: '',
  website: '',
  status: 'active',
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const data = await api.adminPartners();
      setPartners(data.partners || []);
    } catch {
      setPartners([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(payload) {
    if (editing) {
      const data = await api.adminUpdatePartner(editing.id, payload);
      setPartners((curr) => curr.map((p) => (p.id === editing.id ? { ...p, ...data.partner } : p)));
    } else {
      const data = await api.adminCreatePartner(payload);
      setPartners((curr) => [data.partner, ...(curr || [])]);
    }
  }

  async function remove(id) {
    if (!confirm('Supprimer ce compte partenaire ? Les services seront detaches.')) return;
    await api.adminDeletePartner(id);
    setPartners((curr) => curr.filter((p) => p.id !== id));
  }

  async function toggleStatus(partner) {
    const next = partner.status === 'active' ? 'suspended' : 'active';
    const data = await api.adminUpdatePartner(partner.id, { status: next });
    setPartners((curr) => curr.map((p) => (p.id === partner.id ? { ...p, ...data.partner } : p)));
  }

  if (partners === null) return <p className="text-ink-500">Chargement...</p>;

  const cols = [
    { key: 'partner', header: 'Partenaire', render: (p) => (
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-100 text-sm font-bold text-ink-600">
          {p.avatar ? <img src={p.avatar} alt="" className="h-full w-full object-cover" /> : p.companyName?.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{p.companyName}</p>
          <p className="truncate text-xs text-ink-500">{p.name} · {p.location || 'Localite non renseignee'}</p>
        </div>
      </div>
    ) },
    { key: 'contact', header: 'Contact', render: (p) => (
      <div className="space-y-1 text-xs">
        <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-ink-700 hover:text-brand-700"><Mail className="h-3 w-3" /> {p.email}</a>
        {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-ink-500 hover:text-brand-700"><Phone className="h-3 w-3" /> {p.phone}</a>}
      </div>
    ) },
    { key: 'services', header: 'Services', render: (p) => (
      <div className="space-y-1">
        <p className="inline-flex items-center gap-1 text-sm font-semibold text-ink-800"><Briefcase className="h-3.5 w-3.5" /> {p.services?.length || 0}</p>
        <p className="text-xs text-ink-500">{(p.services || []).reduce((sum, s) => sum + (s.leadsCount || 0), 0)} leads</p>
      </div>
    ) },
    { key: 'status', header: 'Statut', render: (p) => (
      <button
        onClick={() => toggleStatus(p)}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          p.status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
        }`}
      >
        <Power className="h-3 w-3" /> {p.status}
      </button>
    ) },
    { key: 'actions', header: '', className: 'text-right', render: (p) => (
      <div className="flex justify-end gap-1">
        <button onClick={() => { setEditing(p); setOpen(true); }} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-100">Editer</button>
        <button onClick={() => remove(p.id)} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 lg:text-3xl">Partenaires annuaire</h1>
          <p className="mt-1 text-sm text-ink-500">{partners.length} comptes professionnels · creation uniquement admin</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Ajouter partenaire
        </Button>
      </div>

      <DataTable
        rows={partners}
        columns={cols}
        searchKeys={['companyName', 'name', 'email', 'location']}
        searchPlaceholder="Rechercher un partenaire..."
        empty="Aucun partenaire cree."
      />

      <PartnerModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSave={save}
      />
    </div>
  );
}

function PartnerModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial, password: '' } : EMPTY);
      setError(null);
    }
  }, [open, initial]);

  const update = (key, value) => setForm((curr) => ({ ...curr, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      if (initial && !payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier partenaire' : 'Creer partenaire'} subtitle="Ce compte donne acces au portail partenaire." maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Entreprise" required value={form.companyName} onChange={(v) => update('companyName', v)} />
          <Field label="Responsable" required value={form.name} onChange={(v) => update('name', v)} />
          <Field label="Email login" required type="email" value={form.email} onChange={(v) => update('email', v)} />
          <Field label={initial ? 'Nouveau mot de passe' : 'Mot de passe'} required={!initial} type="password" value={form.password} onChange={(v) => update('password', v)} />
          <Field label="Telephone" value={form.phone || ''} onChange={(v) => update('phone', v)} />
          <Field label="Localite" value={form.location || ''} onChange={(v) => update('location', v)} />
          <Field label="Site web" type="url" value={form.website || ''} onChange={(v) => update('website', v)} placeholder="https://" />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Statut</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)} className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">Bio partenaire</label>
          <textarea value={form.bio || ''} onChange={(e) => update('bio', e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
        </div>
        <div className="flex justify-end gap-2 border-t border-ink-100 pt-3">
          <button type="button" onClick={onClose} className="h-11 rounded-xl px-4 text-sm font-semibold text-ink-700 hover:bg-ink-100">Annuler</button>
          <Button type="submit" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, type = 'text', ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-700">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input
        {...props}
        required={required}
        type={type}
        onChange={(e) => props.onChange?.(e.target.value)}
        className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
    </div>
  );
}
