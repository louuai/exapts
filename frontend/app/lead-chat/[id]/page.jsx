'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function LeadChatPage() {
  const params = useParams();
  const search = useSearchParams();
  const leadId = params?.id;
  const [email, setEmail] = useState(search.get('email') || '');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function load(targetEmail = email) {
    if (!targetEmail.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.leadChat(leadId, targetEmail.trim());
      setLead(data.lead);
      setMessages(data.messages || []);
      setVerifiedEmail(targetEmail.trim());
    } catch (err) {
      setError(err.message);
      setLead(null);
      setMessages([]);
      setVerifiedEmail('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialEmail = search.get('email');
    if (initialEmail) load(initialEmail);
  }, [leadId]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!body.trim() || !verifiedEmail) return;
    setSending(true);
    setError(null);
    try {
      const data = await api.sendLeadChatMessage(leadId, { email: verifiedEmail, body });
      setMessages(data.messages || []);
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_50%,#eef7f6_100%)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft lg:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <MessageSquare className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">OMEGA Chat</p>
              <h1 className="font-display text-2xl font-extrabold text-ink-950">Conversation avec le partenaire</h1>
            </div>
          </div>

          {!lead && (
            <form onSubmit={(e) => { e.preventDefault(); load(); }} className="mt-6 rounded-2xl bg-ink-50 p-4">
              <label className="mb-1.5 block text-sm font-semibold text-ink-800">Votre email de demande</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </div>
                <Button type="submit" loading={loading}>Ouvrir</Button>
              </div>
            </form>
          )}

          {lead && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-ink-100 bg-ink-50/80 p-4">
                <p className="font-bold text-ink-950">{lead.service?.name || lead.property?.title || 'Demande OMEGA'}</p>
                <p className="mt-1 text-sm text-ink-500">{lead.name} - {formatDate(lead.createdAt)}</p>
                {lead.message && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink-700">{lead.message}</p>}
              </div>

              <div className="h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-ink-100 bg-white p-3">
                {messages.length === 0 && <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-500">Aucun message pour le moment.</p>}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'lead' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${msg.sender === 'lead' ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-800'}`}>
                      <p className="whitespace-pre-line">{msg.body}</p>
                      <p className={`mt-1 text-[10px] ${msg.sender === 'lead' ? 'text-white/60' : 'text-ink-400'}`}>
                        {msg.sender === 'lead' ? 'Vous' : 'Partenaire'} - {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Ecrire votre reponse..."
                  className="h-11 flex-1 rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <Button type="submit" loading={sending} disabled={!body.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}

          {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </section>
      </div>
    </main>
  );
}
