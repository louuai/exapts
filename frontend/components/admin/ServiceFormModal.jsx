'use client';
import { useEffect, useState } from 'react';
import { Save, Upload, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const EMPTY = {
  name: '',
  category: 'Notaire',
  description: '',
  location: '',
  image: '',
  subscription: 'standard',
  partnerId: '',
  contact: { phone: '', email: '', website: '' },
  sourceUrl: '',
  internalNotes: '',
};

const CATEGORIES = ['Notaire', 'Agence immobiliere', 'Avocat', 'Banque', 'Demenagement', 'Ecole internationale', 'Sante', 'Transport', 'Autre'];

export default function ServiceFormModal({ open, onClose, onSave, initial, partners = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial, partnerId: initial.partnerId || '', contact: { ...EMPTY.contact, ...(initial.contact || {}) } } : EMPTY);
      setError(null);
    }
  }, [open, initial]);

  const update = (key, value) => setForm((curr) => ({ ...curr, [key]: value }));
  const updateContact = (key, value) => setForm((curr) => ({ ...curr, contact: { ...curr.contact, [key]: value } }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, partnerId: form.partnerId || null });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) {
      setError('Image trop volumineuse (max 2 Mo).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('image', reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier le prestataire' : 'Ajouter un prestataire'}
      subtitle="Affiche immediatement dans l'annuaire public."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
            {form.image && <img src={form.image} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex flex-1 gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
              <Upload className="h-4 w-4" /> Importer photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.image && (
              <button type="button" onClick={() => update('image', '')} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
                <X className="h-4 w-4" /> Retirer
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nom du prestataire" required value={form.name} onChange={(value) => update('name', value)} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Categorie <span className="text-rose-500">*</span></label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            >
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <Field label="Localite" value={form.location} onChange={(value) => update('location', value)} placeholder="Grand Baie" />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Abonnement</label>
            <select
              value={form.subscription}
              onChange={(e) => update('subscription', e.target.value)}
              className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Compte partenaire</label>
            <select
              value={form.partnerId || ''}
              onChange={(e) => update('partnerId', e.target.value)}
              className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            >
              <option value="">Aucun partenaire lie</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.companyName} - {partner.name}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-ink-500">Le partenaire lie pourra gerer ce service et suivre ses leads.</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Telephone" value={form.contact.phone} onChange={(value) => updateContact('phone', value)} placeholder="+230 5 720 14 22" />
          <Field label="Email" type="email" value={form.contact.email} onChange={(value) => updateContact('email', value)} />
          <Field label="Site web" type="url" value={form.contact.website} onChange={(value) => updateContact('website', value)} placeholder="https://" />
        </div>

        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Champs internes admin</p>
          <Field label="Lien source" value={form.sourceUrl} onChange={(value) => update('sourceUrl', value)} placeholder="https://" />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Notes internes</label>
            <textarea
              value={form.internalNotes}
              onChange={(e) => update('internalNotes', e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl px-4 text-sm font-semibold text-ink-700 hover:bg-ink-100">
            Annuler
          </button>
          <Button type="submit" loading={saving} className="rounded-xl">
            <Save className="h-4 w-4" />
            {initial ? 'Enregistrer' : 'Creer le prestataire'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, type = 'text', ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        {...props}
        type={type}
        required={required}
        onChange={(e) => props.onChange?.(e.target.value)}
        className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
    </div>
  );
}
