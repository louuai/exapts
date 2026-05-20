'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, User, Mail, Phone, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const STORAGE_KEY  = 'omega.popup.dismissedAt';
const COOLDOWN_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days
const TRIGGER_MS   = 9000;                    // ~9 seconds

/**
 * Global lead-capture popup. Triggers ~9s after page load on the public
 * landing. One-shot per browser for 7 days, suppressed if the visitor is
 * already authenticated (they're already in our funnel).
 */
export default function LeadGenPopup() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || user) return;
    // Already dismissed recently?
    try {
      const last = parseInt(window.localStorage.getItem(STORAGE_KEY) || '0', 10);
      if (last && Date.now() - last < COOLDOWN_MS) return;
    } catch { /* ignore */ }

    const t = setTimeout(() => setOpen(true), TRIGGER_MS);
    return () => clearTimeout(t);
  }, [mounted, loading, user]);

  function persistDismissal() {
    try { window.localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* ignore */ }
  }

  function close() {
    persistDismissal();
    setOpen(false);
  }

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    if (form.name.trim().length < 2) { setError('Nom trop court.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email invalide.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      await api.createLead({
        ...form,
        type: 'general',
        source: 'popup',
        interest: 'real-estate',
      });
      setDone(true);
      persistDismissal();
      setTimeout(() => setOpen(false), 2400);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm pointer-events-auto"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative w-full max-w-md sm:max-w-2xl rounded-3xl bg-white shadow-card overflow-hidden grid grid-cols-1 sm:grid-cols-5 pointer-events-auto"
            role="dialog" aria-modal="true"
          >
            {/* Visual side */}
            <div className="hidden sm:block sm:col-span-2 relative">
              <img
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/80 via-brand-900/55 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 border border-white/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" /> Accès prioritaire
                </span>
                <p className="mt-3 text-xs text-white/80 leading-relaxed">
                  Plus de <strong className="text-white">400 biens disponibles</strong>, dont une sélection off-market réservée à nos abonnés.
                </p>
              </div>
            </div>

            {/* Form side */}
            <div className="sm:col-span-3 p-5 sm:p-7">
              <button
                onClick={close}
                aria-label="Fermer"
                className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-xl text-ink-500 hover:bg-ink-100"
              >
                <X className="h-4 w-4" />
              </button>

              {done ? (
                <div className="text-center py-6">
                  <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 grid place-items-center mb-3">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink-900">Demande enregistrée</h3>
                  <p className="text-ink-600 mt-1.5 text-sm">
                    Merci <strong>{form.name.split(' ')[0]}</strong> — vous recevrez nos prochaines opportunités sous 24h.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink-900 leading-tight pr-8">
                    Recevez nos biens exclusifs à Maurice
                  </h3>
                  <p className="text-sm text-ink-600 mt-1.5">
                    Off-market, prix négociés, accompagnement Residence Permit. Aucun spam.
                  </p>

                  <form onSubmit={submit} className="mt-5 space-y-3">
                    {/* honeypot */}
                    <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hidden" />

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        <AlertCircle className="h-4 w-4 mt-0.5" /> {error}
                      </div>
                    )}

                    <Field icon={User}  label="Nom complet" required value={form.name}
                      onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                    <Field icon={Mail}  label="Email"       required type="email" value={form.email}
                      onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                    <Field icon={Phone} label="Téléphone (optionnel)" type="tel" value={form.phone}
                      onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />

                    <Button type="submit" loading={submitting} className="w-full h-11 rounded-xl">
                      <Sparkles className="h-4 w-4" />
                      {submitting ? 'Envoi…' : 'Get access'}
                    </Button>

                    <button
                      type="button"
                      onClick={close}
                      className="w-full text-center text-[11px] text-ink-500 hover:text-ink-700"
                    >
                      Non merci, je préfère explorer seul.
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Field({ icon: Icon, label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <input
          {...props}
          required={required}
          onChange={(e) => props.onChange?.(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
      </div>
    </div>
  );
}
