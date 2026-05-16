'use client';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, Mail, User, Phone, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function LeadCaptureModal({ open, onClose, interest = 'real-estate', source = 'landing-modal' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createLead({ ...form, interest, source });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    onClose?.();
    setTimeout(() => { setDone(false); setForm({ name: '', email: '', phone: '', message: '' }); setError(null); }, 300);
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? '✨ Demande envoyée' : 'Recevez nos biens exclusifs'}
      subtitle={done ? null : 'Nouvelles annonces, off-market et opportunités investisseurs — directement par email.'}
      maxWidth="max-w-lg"
    >
      {done ? (
        <div className="text-center py-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 grid place-items-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-ink-700">Merci <strong>{form.name.split(' ')[0]}</strong> ! Notre équipe vous contactera sous 24h ouvrées.</p>
          <Button onClick={close} variant="dark" className="mt-6 rounded-full px-6">Fermer</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="rounded-xl bg-brand-50 border border-brand-200 p-3 flex items-start gap-2 text-sm text-brand-800">
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Biens off-market à Grand Baie, Tamarin, Beau Champ. Tarif négocié, accès prioritaire.</span>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              {error}
            </div>
          )}

          <Field icon={User} label="Nom complet" required value={form.name} onChange={(v) => update('name', v)} />
          <Field icon={Mail} label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
          <Field icon={Phone} label="Téléphone (optionnel)" type="tel" value={form.phone} onChange={(v) => update('phone', v)} />

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">Votre projet (optionnel)</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Budget, zone préférée, calendrier, type de bien…"
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full h-12 rounded-xl">
            {loading ? 'Envoi…' : 'Recevoir les biens exclusifs'}
          </Button>

          <p className="text-[11px] text-ink-500 text-center">
            En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe.
            Aucun spam, désinscription à tout moment.
          </p>
        </form>
      )}
    </Modal>
  );
}

function Field({ icon: Icon, label, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-800 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <input
          {...props}
          required={required}
          onChange={(e) => props.onChange?.(e.target.value)}
          className="w-full h-11 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
      </div>
    </div>
  );
}
