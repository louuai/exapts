'use client';
import { useEffect, useState } from 'react';
import { Upload, Save, Shield, User as UserIcon, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const EMPTY = {
  name: '',
  email: '',
  password: '',
  phone: '',
  location: '',
  bio: '',
  avatar: '',
  role: 'user',
};

export default function AdminUserFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...EMPTY, ...initial, password: '' } : EMPTY);
    setError(null);
  }, [open, initial]);

  const isEdit = !!initial;
  const update = (key, value) => setForm((curr) => ({ ...curr, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone || null,
        location: form.location || null,
        bio: form.bio || null,
        avatar: form.avatar || null,
      };
      if (form.password) payload.password = form.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) {
      setError('Avatar trop volumineux (max 2 Mo).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('avatar', reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier un utilisateur' : 'Creer un utilisateur'}
      subtitle="Gestion manuelle des comptes depuis le panel admin."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
            {form.avatar
              ? <img src={form.avatar} alt="" className="h-full w-full object-cover" />
              : <div className="grid h-full w-full place-items-center text-ink-400"><UserIcon className="h-8 w-8" /></div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
              <Upload className="h-4 w-4" /> Importer avatar
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            {form.avatar && (
              <button
                type="button"
                onClick={() => update('avatar', '')}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                <X className="h-4 w-4" /> Retirer
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nom complet" required value={form.name} onChange={(value) => update('name', value)} />
          <Field label="Email" type="email" required value={form.email} onChange={(value) => update('email', value)} />
          <Field
            label={isEdit ? 'Nouveau mot de passe' : 'Mot de passe'}
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(value) => update('password', value)}
            placeholder={isEdit ? 'Laisser vide pour conserver' : ''}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <Field label="Telephone" value={form.phone} onChange={(value) => update('phone', value)} />
          <Field label="Localite" value={form.location} onChange={(value) => update('location', value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
            placeholder="Presentation courte du membre"
          />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            {form.role === 'admin' ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
            {form.role === 'admin'
              ? 'Ce compte aura acces a tout le panel admin.'
              : "Ce compte sera limite a l'application utilisateur."}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 pt-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl px-4 text-sm font-semibold text-ink-700 hover:bg-ink-100">
            Annuler
          </button>
          <Button type="submit" loading={saving} className="rounded-xl">
            <Save className="h-4 w-4" />
            {isEdit ? 'Enregistrer' : 'Creer le compte'}
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
        className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
      />
    </div>
  );
}
