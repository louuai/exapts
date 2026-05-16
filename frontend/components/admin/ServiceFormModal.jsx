'use client';
import { useEffect, useState } from 'react';
import { Upload, Save, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const EMPTY = {
  name: '', category: 'Notaire', description: '', location: '',
  image: '', subscription: 'standard',
  contact: { phone: '', email: '', website: '' },
};

const CATEGORIES = ['Notaire', 'Agence immobilière', 'Avocat', 'Banque', 'Déménagement', 'École internationale', 'Santé', 'Transport', 'Autre'];

export default function ServiceFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial, contact: { ...EMPTY.contact, ...(initial.contact || {}) } } : EMPTY);
      setError(null);
    }
  }, [open, initial]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateContact = (k, v) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: v } }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) { setError('Image trop volumineuse (max 2 Mo).'); return; }
    const reader = new FileReader();
    reader.onload = () => update('image', reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier le prestataire' : 'Ajouter un prestataire'}
      subtitle="Affiché immédiatement dans l'annuaire public."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">{error}</p>}

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-ink-100 overflow-hidden border border-ink-200 shrink-0">
            {form.image && <img src={form.image} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1 flex gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 hover:bg-ink-50 cursor-pointer">
              <Upload className="h-4 w-4" /> Importer photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.image && (
              <button type="button" onClick={() => update('image', '')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 hover:bg-rose-100">
                <X className="h-4 w-4" /> Retirer
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nom du prestataire" required value={form.name} onChange={(v) => update('name', v)} />
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">Catégorie <span className="text-rose-500">*</span></label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Localité" value={form.location} onChange={(v) => update('location', v)} placeholder="Grand Baie" />
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">Abonnement (visibilité)</label>
            <select
              value={form.subscription}
              onChange={(e) => update('subscription', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium (mis en avant)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Téléphone" value={form.contact.phone} onChange={(v) => updateContact('phone', v)} placeholder="+230 5 720 14 22" />
          <Field label="Email" type="email" value={form.contact.email} onChange={(v) => updateContact('email', v)} />
          <Field label="Site web" type="url" value={form.contact.website} onChange={(v) => updateContact('website', v)} placeholder="https://" />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
          <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100">
            Annuler
          </button>
          <Button type="submit" loading={saving} className="rounded-xl">
            <Save className="h-4 w-4" />
            {initial ? 'Enregistrer' : 'Créer le prestataire'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, type = 'text', ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        {...props}
        type={type}
        required={required}
        onChange={(e) => props.onChange?.(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
      />
    </div>
  );
}
