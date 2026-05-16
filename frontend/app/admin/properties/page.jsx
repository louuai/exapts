'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import DataTable from '@/components/admin/DataTable';
import PropertyFormModal from '@/components/admin/PropertyFormModal';
import Button from '@/components/ui/Button';

export default function AdminPropertiesPage() {
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const d = await api.properties();
      setList(d.properties);
    } catch { setList([]); }
  }
  useEffect(() => { load(); }, []);

  async function handleSave(payload) {
    if (editing) {
      const d = await api.updateProperty(editing.id, payload);
      setList((curr) => curr.map((p) => (p.id === editing.id ? d.property : p)));
    } else {
      const d = await api.createProperty(payload);
      setList((curr) => [d.property, ...curr]);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer définitivement ce bien ?')) return;
    await api.deleteProperty(id);
    setList((curr) => curr.filter((p) => p.id !== id));
  }

  if (list === null) return <p className="text-ink-500">Chargement…</p>;

  const cols = [
    { key: 'property', header: 'Bien', render: (r) => (
      <div className="flex items-center gap-3">
        <img src={r.images?.[0]} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0 bg-ink-100" />
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate flex items-center gap-1.5">
            {r.title}
            {r.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 shrink-0" />}
          </p>
          <p className="text-xs text-ink-500">
            {r.reference && <span className="font-bold mr-1.5">{r.reference}</span>}
            {r.location} · {r.region}
          </p>
        </div>
      </div>
    )},
    { key: 'type', header: 'Type', render: (r) => (
      <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-700">
        {r.type}
      </span>
    )},
    { key: 'transaction', header: 'Transaction', render: (r) => (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        r.transaction === 'sale' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
        {r.transaction === 'sale' ? 'Achat' : 'Location'}
      </span>
    )},
    { key: 'surface', header: 'Surface', render: (r) => <span className="text-sm font-semibold">{r.surface} m²</span> },
    { key: 'price', header: 'Prix', render: (r) => (
      <span className="font-display font-extrabold text-ink-900">
        {formatPrice(r.price, r.currency)}
      </span>
    )},
    { key: 'tags', header: 'Tags', render: (r) => (
      <div className="flex flex-wrap gap-1 max-w-[180px]">
        {(r.tags || []).map((t) => (
          <span key={t} className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
            {t}
          </span>
        ))}
        {(!r.tags || r.tags.length === 0) && <span className="text-xs text-ink-400">—</span>}
      </div>
    )},
    { key: 'actions', header: '', className: 'text-right', render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        <Link href={`/properties/${r.id}`} target="_blank" className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100" title="Voir">
          <Eye className="h-4 w-4" />
        </Link>
        <button onClick={() => { setEditing(r); setOpen(true); }} className="p-1.5 rounded-lg text-ink-700 hover:bg-brand-50 hover:text-brand-700" title="Modifier">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" title="Supprimer">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">Biens immobiliers</h1>
          <p className="text-sm text-ink-500 mt-1">
            {list.length} biens · {list.filter((p) => p.transaction === 'sale').length} à vendre ·{' '}
            {list.filter((p) => p.transaction === 'rent').length} à louer
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-xl">
          <Plus className="h-4 w-4" /> Ajouter un bien
        </Button>
      </div>

      <DataTable
        rows={list}
        columns={cols}
        searchKeys={['title', 'location', 'region', 'type', 'reference']}
        searchPlaceholder="Rechercher par titre, ville, référence…"
        empty="Aucun bien. Cliquez « Ajouter un bien » pour commencer."
      />

      <PropertyFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
