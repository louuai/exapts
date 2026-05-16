'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, User, Mail, Phone, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function LeadCaptureSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createLead({ ...form, interest: 'real-estate', source: 'landing-section' });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="lead-capture" className="py-20 sm:py-28 bg-ink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden"
        >
          {/* Left: photo + value props */}
          <div className="relative lg:col-span-2 min-h-[280px] lg:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/85 via-ink-900/40 to-transparent" />
            <div className="relative h-full p-8 flex flex-col justify-end text-white">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 border border-white/30 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Accès prioritaire
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl mt-3 leading-tight">
                Recevez nos biens exclusifs à Maurice
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  'Biens off-market avant publication',
                  'Tarifs négociés exclusifs OMEGA',
                  'Accompagnement Residence Permit',
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-300 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3 p-8 lg:p-12">
            {done ? (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 grid place-items-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-display font-bold text-2xl text-ink-900">Demande enregistrée</h3>
                <p className="text-ink-600 mt-2 max-w-md mx-auto">
                  Merci <strong>{form.name.split(' ')[0]}</strong> ! Notre équipe vous contactera sous 24h ouvrées avec une sélection sur-mesure.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-display font-bold text-2xl text-ink-900">Demandez votre sélection sur-mesure</h3>
                <p className="text-ink-600 mt-1.5">Réponse sous 24h, sans engagement.</p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      <AlertCircle className="h-4 w-4 mt-0.5" /> {error}
                    </div>
                  )}
                  <Field icon={User}  label="Nom complet" required value={form.name}  onChange={(v) => update('name', v)} />
                  <Field icon={Mail}  label="Email"       required type="email" value={form.email} onChange={(v) => update('email', v)} />
                  <Field icon={Phone} label="Téléphone (optionnel)" type="tel" value={form.phone} onChange={(v) => update('phone', v)} />

                  <Button type="submit" loading={loading} size="lg" className="w-full rounded-xl">
                    {loading ? 'Envoi…' : 'Recevoir les opportunités exclusives'}
                  </Button>

                  <p className="text-[11px] text-ink-500 text-center">
                    Nous traitons vos données avec confidentialité. Aucun spam, désinscription à tout moment.
                  </p>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
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
