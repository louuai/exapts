'use client';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ContactPropertyModal({ open, onClose, property }) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.createMessage({ propertyId: property.id, body });
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function close() {
    onClose?.();
    setTimeout(() => { setDone(false); setBody(''); setError(null); }, 300);
  }

  if (!property) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? '✨ Message envoyé' : "Contacter l'agent"}
      subtitle={done ? null : property.title}
      maxWidth="max-w-lg"
    >
      {done ? (
        <div className="text-center py-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 grid place-items-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-ink-700">Votre message a été transmis à l'agent. Réponse sous 24h.</p>
          <Button onClick={close} variant="dark" className="mt-6 rounded-full px-6">Fermer</Button>
        </div>
      ) : !user ? (
        <p className="text-ink-700 mt-2">Connectez-vous pour envoyer un message à l'agent.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4 mt-2">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">Votre message</label>
            <textarea
              rows={5}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Bonjour, je suis intéressé(e) par ce bien et souhaiterais…"
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
            />
          </div>

          <Button type="submit" loading={loading} disabled={!body.trim()} className="w-full h-12 rounded-xl">
            <MessageSquare className="h-4 w-4" />
            {loading ? 'Envoi…' : 'Envoyer le message'}
          </Button>
        </form>
      )}
    </Modal>
  );
}
