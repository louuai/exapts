'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, User, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/**
 * Unified property lead capture used on cards and detail pages.
 * `mode` is 'contact' (default) or 'visit' (adds preferred-date field
 * and prefixes the message).
 *
 * Always creates a Lead with type='property', propertyId=<id>.
 */
export default function PropertyLeadModal({ open, onClose, property, mode = 'contact' }) {
  const { user } = useAuth();
  const isVisit = mode === 'visit';

  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
    preferredDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        name:  user?.name  || f.name  || '',
        email: user?.email || f.email || '',
        phone: user?.phone || f.phone || '',
      }));
      setDone(false);
      setError(null);
    }
  }, [open, user]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    // Basic anti-spam: honeypot + min length
    if (e.currentTarget.elements.website?.value) return; // bot trap
    if (form.name.trim().length < 2) { setError('Nom trop court.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email invalide.'); return; }

    setLoading(true);
    setError(null);
    try {
      const message = isVisit
        ? `[Demande de visite${form.preferredDate ? ` — ${form.preferredDate}` : ''}] ${form.message || ''}`.trim()
        : form.message?.trim() || '';

      // If the visitor is logged in AND asking for a visit, route through
      // /api/visits — which atomically creates a VisitRequest (so the user
      // sees it in their profile) AND a mirrored Lead (so admin sees it
      // in the unified leads dashboard). For anonymous visitors and for
      // plain contact requests, we hit /api/leads.
      if (isVisit && user) {
        await api.createVisitRequest({
          propertyId: property?.id,
          preferredDate: form.preferredDate || null,
          message: form.message || null,
          phone: form.phone || undefined,
        });
      } else {
        await api.createLead({
          type: 'property',
          propertyId: property?.id,
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: message || undefined,
          source: isVisit ? 'property-visit' : 'property-contact',
          interest: 'real-estate',
        });
      }
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    onClose?.();
    setTimeout(() => {
      setDone(false); setError(null);
      setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '', preferredDate: '' });
    }, 300);
  }

  if (!property) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? '✨ Demande envoyée' : (isVisit ? 'Demander une visite' : 'Contacter un agent')}
      subtitle={done ? null : property.title}
      maxWidth="max-w-lg"
    >
      {done ? (
        <div className="text-center py-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 grid place-items-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-ink-700">
            Merci <strong>{form.name.split(' ')[0]}</strong> ! Notre équipe vous recontacte sous 24h ouvrées.
          </p>
          <Button onClick={close} variant="dark" className="mt-6 rounded-full px-6">Fermer</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {/* honeypot — invisible field bots will fill */}
          <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hidden" />

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5" /> {error}
            </div>
          )}

          <Field icon={User}  label="Nom complet" required value={form.name}  onChange={(v) => update('name', v)} />
          <Field icon={Mail}  label="Email"       required type="email" value={form.email} onChange={(v) => update('email', v)} />
          <Field icon={Phone} label="Téléphone (optionnel)" type="tel" value={form.phone} onChange={(v) => update('phone', v)} />

          {isVisit && (
            <Field icon={Calendar} label="Date souhaitée (optionnel)" type="date"
              value={form.preferredDate}
              onChange={(v) => update('preferredDate', v)}
              min={new Date().toISOString().split('T')[0]} />
          )}

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">
              Message {isVisit ? '(optionnel)' : '(optionnel)'}
            </label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              maxLength={2000}
              placeholder={isVisit
                ? 'Précisez vos disponibilités, questions, etc.'
                : 'Bonjour, je suis intéressé(e) par ce bien…'}
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full h-11 rounded-xl">
            <MessageSquare className="h-4 w-4" />
            {loading ? 'Envoi…' : (isVisit ? 'Confirmer la demande' : 'Envoyer la demande')}
          </Button>

          <p className="text-[11px] text-ink-500 text-center">
            En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe.
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
