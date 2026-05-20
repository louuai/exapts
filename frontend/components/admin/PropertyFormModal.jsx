'use client';
import { useEffect, useState } from 'react';
import { Plus, X, ImagePlus, Upload, Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const EMPTY = {
  reference: '', title: '', titleEn: '', type: 'Villa', transaction: 'sale',
  price: '', currency: 'EUR', location: '', region: 'Nord',
  surface: '', landSurface: '', rooms: '', bedrooms: '', bathrooms: '', parking: '',
  yearBuilt: '', eligibility: 'PDS — éligible Residence Permit',
  description: '', features: [], tags: [],
  images: [], featured: false,
  sourceUrl: '', internalNotes: '', // admin-only
};

export default function PropertyFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { ...EMPTY, ...initial, features: initial.features || [], tags: initial.tags || [], images: initial.images || [] }
        : EMPTY);
      setError(null);
    }
  }, [open, initial]);

  const isEdit = !!initial;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        surface: Number(form.surface),
        landSurface: form.landSurface ? Number(form.landSurface) : undefined,
        rooms: Number(form.rooms),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        parking: Number(form.parking),
        yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 1024 * 1024 * 4) {
        setError(`"${file.name}" trop volumineux (max 4 Mo).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({ ...f, images: [...f.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function addImageUrl() {
    const url = prompt('URL de l\'image :');
    if (url) setForm((f) => ({ ...f, images: [...f.images, url] }));
  }

  function removeImage(i) {
    setForm((f) => ({ ...f, images: f.images.filter((_, k) => k !== i) }));
  }

  function addFeature() {
    if (newFeature.trim()) {
      setForm((f) => ({ ...f, features: [...f.features, newFeature.trim()] }));
      setNewFeature('');
    }
  }

  function addTag() {
    if (newTag.trim()) {
      setForm((f) => ({ ...f, tags: [...f.tags, newTag.trim()] }));
      setNewTag('');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le bien' : 'Ajouter un bien'}
      subtitle="Les champs marqués d'une étoile sont obligatoires."
      maxWidth="max-w-4xl"
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <p className="text-sm rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">{error}</p>}

        {/* Images */}
        <Section title="Photos">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {form.images.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 border border-ink-200">
                <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 h-7 w-7 rounded-lg bg-white/95 grid place-items-center text-ink-700 hover:bg-rose-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-ink-200 grid place-items-center text-ink-500 hover:bg-ink-50 cursor-pointer">
              <span className="text-center text-xs">
                <Upload className="h-5 w-5 mx-auto mb-1" />
                Importer
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={addImageUrl}
              className="aspect-square rounded-xl border-2 border-dashed border-ink-200 grid place-items-center text-ink-500 hover:bg-ink-50"
            >
              <span className="text-center text-xs">
                <ImagePlus className="h-5 w-5 mx-auto mb-1" />
                Coller URL
              </span>
            </button>
          </div>
        </Section>

        {/* Identity */}
        <Section title="Identité du bien">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Titre (FR)" required value={form.title} onChange={(v) => update('title', v)} />
            <Field label="Titre (EN)" value={form.titleEn} onChange={(v) => update('titleEn', v)} />
            <Field label="Référence interne" value={form.reference} onChange={(v) => update('reference', v)} placeholder="MA7-1234" />
            <SelectField label="Type" value={form.type} onChange={(v) => update('type', v)}
              options={['Villa', 'Maison', 'Appartement', 'Penthouse', 'Duplex', 'Studio']} />
            <SelectField label="Transaction" value={form.transaction} onChange={(v) => update('transaction', v)}
              options={[{ value: 'sale', label: 'Achat' }, { value: 'rent', label: 'Location' }]} />
            <Field label="Prix" type="number" required value={form.price} onChange={(v) => update('price', v)} />
            <SelectField label="Devise" value={form.currency} onChange={(v) => update('currency', v)} options={['EUR', 'USD', 'MUR']} />
            <Field label="Localité" required value={form.location} onChange={(v) => update('location', v)} placeholder="Grand Baie" />
            <SelectField label="Région" value={form.region} onChange={(v) => update('region', v)}
              options={['Nord', 'Sud', 'Est', 'Ouest', 'Centre']} />
            <Field label="Éligibilité" value={form.eligibility} onChange={(v) => update('eligibility', v)} />
          </div>
        </Section>

        {/* Specs */}
        <Section title="Caractéristiques">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Surface (m²)" type="number" value={form.surface} onChange={(v) => update('surface', v)} />
            <Field label="Terrain (m²)" type="number" value={form.landSurface} onChange={(v) => update('landSurface', v)} />
            <Field label="Pièces" type="number" value={form.rooms} onChange={(v) => update('rooms', v)} />
            <Field label="Chambres" type="number" value={form.bedrooms} onChange={(v) => update('bedrooms', v)} />
            <Field label="Salles de bain" type="number" value={form.bathrooms} onChange={(v) => update('bathrooms', v)} />
            <Field label="Parkings" type="number" value={form.parking} onChange={(v) => update('parking', v)} />
            <Field label="Année" type="number" value={form.yearBuilt} onChange={(v) => update('yearBuilt', v)} />
          </div>
        </Section>

        {/* Description */}
        <Section title="Description">
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
            placeholder="Description commerciale du bien…"
          />
        </Section>

        {/* Features & tags */}
        <Section title="Prestations & tags">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChipsInput
              label="Prestations"
              value={form.features}
              onAdd={addFeature}
              newValue={newFeature}
              setNewValue={setNewFeature}
              onRemove={(i) => setForm((f) => ({ ...f, features: f.features.filter((_, k) => k !== i) }))}
              placeholder="Ex : Piscine privée"
            />
            <ChipsInput
              label="Tags marketing"
              value={form.tags}
              onAdd={addTag}
              newValue={newTag}
              setNewValue={setNewTag}
              onRemove={(i) => setForm((f) => ({ ...f, tags: f.tags.filter((_, k) => k !== i) }))}
              placeholder='Ex : "Expat Opportunity"'
            />
          </div>

          <label className="mt-4 inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.featured}
              onChange={(e) => update('featured', e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-300"
            />
            <span className="text-sm font-semibold text-ink-800">Mettre en avant (featured)</span>
          </label>
        </Section>

        {/* Admin-only — hidden from public/frontend */}
        <Section title="Champs internes (admin uniquement)">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
            <Field label="Lien source d'origine" value={form.sourceUrl} onChange={(v) => update('sourceUrl', v)} placeholder="https://decordier-immobilier.mu/…" />
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">Notes internes</label>
              <textarea
                value={form.internalNotes}
                onChange={(e) => update('internalNotes', e.target.value)}
                rows={3}
                placeholder="Notes confidentielles équipe (commission, contacts, négo…)"
                className="w-full px-3 py-2 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
              />
            </div>
            <p className="text-[11px] text-amber-700">
              Ces champs ne sont jamais exposés aux utilisateurs publics, uniquement à l'équipe admin.
            </p>
          </div>
        </Section>

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
          <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100">
            Annuler
          </button>
          <Button type="submit" loading={saving} className="rounded-xl">
            <Save className="h-4 w-4" />
            {isEdit ? 'Enregistrer' : 'Créer le bien'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500 mb-3">{title}</h3>
      {children}
    </div>
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
function SelectField({ label, value, onChange, options }) {
  const opts = options.map((o) => typeof o === 'string' ? { value: o, label: o } : o);
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-700 mb-1.5">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
      >
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function ChipsInput({ label, value, onAdd, onRemove, newValue, setNewValue, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-ink-200 bg-white min-h-[80px]">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-800">
            {v}
            <button type="button" onClick={() => onRemove(i)} className="text-ink-500 hover:text-rose-600">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
        <button type="button" onClick={onAdd} className="h-9 px-3 rounded-xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-800 inline-flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> Ajouter
        </button>
      </div>
    </div>
  );
}
