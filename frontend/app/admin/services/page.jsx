'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BadgeCheck, Star } from 'lucide-react';
import { api } from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import ServiceFormModal from '@/components/admin/ServiceFormModal';
import Button from '@/components/ui/Button';

export default function AdminServicesPage() {
  const [list, setList] = useState(null);
  const [partners, setPartners] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const [d, p] = await Promise.all([api.services(), api.adminPartners()]);
      setList(d.services);
      setPartners(p.partners || []);
    }
    catch { setList([]); }
  }
  useEffect(() => { load(); }, []);

  async function handleSave(payload) {
    if (editing) {
      const d = await api.updateService(editing.id, payload);
      setList((curr) => curr.map((s) => (s.id === editing.id ? d.service : s)));
    } else {
      const d = await api.createService(payload);
      setList((curr) => [d.service, ...curr]);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce prestataire ?')) return;
    await api.deleteService(id);
    setList((curr) => curr.filter((s) => s.id !== id));
  }

  if (list === null) return <p className="text-ink-500">Chargement…</p>;

  const cols = [
    { key: 'service', header: 'Prestataire', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-ink-100 overflow-hidden shrink-0">
          {r.image && <img src={r.image} alt="" className="h-full w-full object-cover" />}
        </div>
        <div>
          <p className="font-semibold text-ink-900 flex items-center gap-1.5">
            {r.name}
            {r.subscription === 'premium' && <BadgeCheck className="h-3.5 w-3.5 text-amber-500" />}
          </p>
          <p className="text-xs text-ink-500">{r.location}</p>
          {r.partner && <p className="text-[11px] font-semibold text-brand-700 mt-0.5">{r.partner.companyName}</p>}
        </div>
      </div>
    )},
    { key: 'category', header: 'Catégorie', render: (r) => (
      <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-700">
        {r.category}
      </span>
    )},
    { key: 'subscription', header: 'Abonnement', render: (r) => (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        r.subscription === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-ink-50 text-ink-700 border-ink-200'
      }`}>
        {r.subscription}
      </span>
    )},
    { key: 'rating', header: 'Note', render: (r) => (
      r.rating > 0
        ? <span className="inline-flex items-center gap-0.5 text-sm"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {r.rating} <span className="text-ink-400 text-xs ml-1">({r.reviews})</span></span>
        : <span className="text-ink-400 text-xs">—</span>
    )},
    { key: 'description', header: 'Description', render: (r) => (
      <p className="text-ink-700 max-w-sm line-clamp-2 text-sm">{r.description}</p>
    )},
    { key: 'actions', header: '', className: 'text-right', render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        <button onClick={() => { setEditing(r); setOpen(true); }} className="p-1.5 rounded-lg text-ink-700 hover:bg-brand-50 hover:text-brand-700">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">Annuaire de services</h1>
          <p className="text-sm text-ink-500 mt-1">
            {list.length} prestataires · {list.filter((s) => s.subscription === 'premium').length} premium
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-xl">
          <Plus className="h-4 w-4" /> Ajouter un prestataire
        </Button>
      </div>

      <DataTable
        rows={list}
        columns={cols}
        searchKeys={['name', 'category', 'description', 'location']}
        searchPlaceholder="Rechercher par nom, catégorie…"
        empty="Aucun prestataire. Cliquez « Ajouter un prestataire »."
      />

      <ServiceFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initial={editing}
        partners={partners}
      />
    </div>
  );
}
