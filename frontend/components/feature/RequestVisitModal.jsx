'use client';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, Calendar, Phone, MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RequestVisitModal({ open, onClose, property }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ preferredDate: '', message: '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createVisitRequest({ propertyId: property.id, ...form });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    onClose?.();
    setTimeout(() => { setDone(false); setForm({ preferredDate: '', message: '', phone: user?.phone || '' }); setError(null); }, 300);
  }

  if (!property) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? '✨ Demande envoyée' : 'Demander une visite'}
      subtitle={done ? null : property.title}
      maxWidth="max-w-lg"
    >
      {done ? (
        <div className="text-center py-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 grid place-items-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-ink-700">Votre demande pour <strong>{property.title}</strong> a bien été envoyée. L'agent reviendra vers vous sous 24h.</p>
          <Button onClick={close} variant="dark" className="mt-6 rounded-full px-6">Fermer</Button>
        </div>
      ) : !user ? (
        <p className="text-ink-700 mt-2">Connectez-vous pour demander une visite.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4 mt-2">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">
              Date souhaitée <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="date"
                required
                value={form.preferredDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => update('preferredDate', e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">Message (optionnel)</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Précisez votre disponibilité, questions, etc."
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full h-12 rounded-xl">
            {loading ? 'Envoi…' : 'Confirmer la demande'}
          </Button>
        </form>
      )}
    </Modal>
  );
}
