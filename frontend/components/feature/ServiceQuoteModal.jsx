'use client';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/**
 * Lead capture targeted at a specific service provider.
 * Stored as a regular OMEGA lead, with `interest = "service:<service.id>"`
 * so the admin can filter them.
 */
export default function ServiceQuoteModal({ open, onClose, service }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      await api.createLead({
        ...form,
        type: 'service',
        serviceId: service?.id,
        source: 'service-directory',
        interest: `service:${service?.id || 'unknown'}`,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    onClose?.();
    setTimeout(() => { setDone(false); setError(null); setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' }); }, 300);
  }

  if (!service) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? '✨ Demande envoyée' : 'Demander un devis'}
      subtitle={done ? null : service.name}
      maxWidth="max-w-lg"
    >
      {done ? (
        <div className="text-center py-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 grid place-items-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-ink-700">
            Votre demande a été transmise à <strong>{service.name}</strong>. Réponse sous 24-48h ouvrées.
          </p>
          <Button onClick={close} variant="dark" className="mt-6 rounded-full px-6">Fermer</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5" /> {error}
            </div>
          )}
          <Field icon={User}  label="Nom complet" required value={form.name}  onChange={(v) => update('name', v)} />
          <Field icon={Mail}  label="Email"       required type="email" value={form.email} onChange={(v) => update('email', v)} />
          <Field icon={Phone} label="Téléphone (optionnel)" type="tel" value={form.phone} onChange={(v) => update('phone', v)} />

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">
              Votre besoin <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder={`Bonjour ${service.name.split(' ')[0]}, je souhaite…`}
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full h-11 rounded-xl">
            <MessageSquare className="h-4 w-4" />
            {loading ? 'Envoi…' : 'Envoyer la demande'}
          </Button>
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
