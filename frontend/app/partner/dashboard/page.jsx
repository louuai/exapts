'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Calculator, Copy, Euro, LogOut, Mail, MessageSquare, Pencil, Phone, Plus, Send, Star, Trash2, UsersRound, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const STATUSES = [
  { v: 'new', label: 'Nouveau' },
  { v: 'contacted', label: 'Contacte' },
  { v: 'converted', label: 'Converti' },
  { v: 'closed', label: 'Ferme' },
];

const EMPTY_SERVICE = {
  name: '',
  category: 'Service expat',
  description: '',
  location: '',
  image: '',
  contact: { phone: '', email: '', website: '' },
};

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState(null);
  const [services, setServices] = useState([]);
  const [leads, setLeads] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  async function load() {
    try {
      const [me, leadData, billData] = await Promise.all([api.partnerMe(), api.partnerLeads(), api.partnerBilling()]);
      setPartner(me.partner);
      setServices(me.services || []);
      setLeads(leadData.leads || []);
      setBilling(billData.billing || null);
    } catch {
      window.localStorage.removeItem('omega.partnerToken');
      router.replace('/partner/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveService(payload) {
    if (serviceModal?.id) {
      const data = await api.partnerUpdateService(serviceModal.id, payload);
      setServices((curr) => curr.map((service) => (service.id === serviceModal.id ? data.service : service)));
    } else {
      const data = await api.partnerCreateService(payload);
      setServices((curr) => [data.service, ...curr]);
    }
    const billData = await api.partnerBilling();
    setBilling(billData.billing || null);
  }

  async function deleteService(id) {
    if (!confirm('Supprimer ce service de votre annuaire ?')) return;
    await api.partnerDeleteService(id);
    setServices((curr) => curr.filter((service) => service.id !== id));
    const billData = await api.partnerBilling();
    setBilling(billData.billing || null);
  }

  async function changeStatus(id, status) {
    const data = await api.partnerUpdateLead(id, { status });
    setLeads((curr) => curr.map((lead) => (lead.id === id ? data.lead : lead)));
    setSelectedLead((curr) => (curr?.id === id ? data.lead : curr));
    const billData = await api.partnerBilling();
    setBilling(billData.billing || null);
  }

  function updateLeadInState(lead) {
    setLeads((curr) => curr.map((item) => (item.id === lead.id ? lead : item)));
    setSelectedLead(lead);
  }

  const stats = useMemo(() => ({
    leads: leads.length,
    newLeads: leads.filter((lead) => lead.status === 'new').length,
    converted: leads.filter((lead) => lead.status === 'converted').length,
    services: services.length,
  }), [leads, services]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-ink-50 text-ink-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_46%,#eef7f6_100%)]">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">OMEGA Partner</p>
            <h1 className="truncate font-display text-lg font-bold text-ink-950">{partner?.companyName}</h1>
          </div>
          <button
            onClick={() => { window.localStorage.removeItem('omega.partnerToken'); router.push('/partner/login'); }}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink-600 hover:bg-rose-50 hover:text-rose-600"
            title="Deconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        <section className="rounded-3xl bg-ink-950 p-6 text-white shadow-card lg:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">Business dashboard</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold">Services, clients et revenus</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-300">
                Gere tes fiches annuaire comme des cartes pro, suis les leads et estime ta facturation mensuelle OMEGA.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Leads" value={stats.leads} />
              <Metric label="Nouveaux" value={stats.newLeads} />
              <Metric label="Convertis" value={stats.converted} />
              <Metric label="Services" value={stats.services} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ProfileCard partner={partner} />
          <BillingCard billing={billing} />
          <PipelineCard leads={leads} />
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-extrabold text-ink-950">Mes services annuaire</h3>
              <p className="text-sm text-ink-500">Cree, modifie et garde tes fiches propres et rassurantes.</p>
            </div>
            <Button onClick={() => setServiceModal({})}>
              <Plus className="h-4 w-4" /> Nouveau service
            </Button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onEdit={() => setServiceModal(service)} onDelete={() => deleteService(service.id)} />
            ))}
            {services.length === 0 && (
              <button onClick={() => setServiceModal({})} className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 p-8 text-center text-sm font-semibold text-ink-500 hover:bg-ink-50">
                Ajouter votre premier service
              </button>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <div>
              <h3 className="font-display text-xl font-extrabold text-ink-950">Leads recus</h3>
              <p className="text-sm text-ink-500">Contact direct par email ou telephone.</p>
            </div>
            <UsersRound className="h-5 w-5 text-brand-600" />
          </div>
          <div className="divide-y divide-ink-100">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedLead(lead); }}
                className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-ink-50/70 lg:grid-cols-[1fr_auto_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950">{lead.name}</p>
                  <p className="mt-1 text-sm text-ink-500">{lead.service?.name} · {formatDate(lead.createdAt)}</p>
                  {lead.message && <p className="mt-2 line-clamp-2 text-sm text-ink-700">{lead.message}</p>}
                  {lead.leadScore && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      Score {lead.leadScore.totalScore} - {lead.leadScore.segment}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
                  <a href={`mailto:${lead.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 font-semibold text-ink-700 hover:bg-ink-50"><Mail className="h-4 w-4" /> Email</a>
                  {lead.phone && <a href={`tel:${lead.phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 font-semibold text-ink-700 hover:bg-ink-50"><Phone className="h-4 w-4" /> Appel</a>}
                </div>
                <select value={lead.status} onClick={(e) => e.stopPropagation()} onChange={(e) => changeStatus(lead.id, e.target.value)} className="h-9 rounded-xl border border-ink-200 bg-white px-3 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-100">
                  {STATUSES.map((status) => <option key={status.v} value={status.v}>{status.label}</option>)}
                </select>
              </div>
            ))}
            {leads.length === 0 && <p className="p-10 text-center text-sm text-ink-500">Aucun lead recu pour le moment.</p>}
          </div>
        </section>
      </main>

      <ServiceEditor
        open={!!serviceModal}
        initial={serviceModal?.id ? serviceModal : null}
        partner={partner}
        onClose={() => setServiceModal(null)}
        onSave={saveService}
      />
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={updateLeadInState}
        onStatusChange={changeStatus}
      />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-300">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function ProfileCard({ partner }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <h3 className="font-display text-lg font-bold text-ink-950">Profil partenaire</h3>
      <div className="mt-4 flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-ink-100 font-bold text-ink-600">
          {partner?.avatar ? <img src={partner.avatar} alt="" className="h-full w-full object-cover" /> : partner?.companyName?.slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-ink-950">{partner?.name}</p>
          <p className="text-sm text-ink-500">{partner?.location || 'Localite non renseignee'}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-600">{partner?.bio || 'Ajoute une bio depuis l admin pour rassurer les clients.'}</p>
      <div className="mt-4 space-y-2 text-sm">
        <a href={`mailto:${partner?.email}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-700"><Mail className="h-4 w-4" /> {partner?.email}</a>
        {partner?.phone && <a href={`tel:${partner.phone}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-700"><Phone className="h-4 w-4" /> {partner.phone}</a>}
      </div>
    </div>
  );
}

function BillingCard({ billing }) {
  const format = (value) => `${billing?.currency || 'EUR'} ${Number(value || 0).toLocaleString('fr-FR')}`;
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-ink-950">Facturation OMEGA</h3>
        <Calculator className="h-5 w-5 text-brand-600" />
      </div>
      <p className="mt-4 text-3xl font-extrabold text-ink-950">{format(billing?.omegaMonthlyDue)}</p>
      <p className="mt-1 text-sm text-ink-500">Abonnement mensuel estime · {billing?.month}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <InfoTile label="Standard" value={`${billing?.services?.standard || 0} x ${format(billing?.fees?.standard)}`} />
        <InfoTile label="Premium" value={`${billing?.services?.premium || 0} x ${format(billing?.fees?.premium)}`} />
      </div>
    </div>
  );
}

function PipelineCard({ leads }) {
  const total = Math.max(1, leads.length);
  const rows = STATUSES.map((status) => ({
    ...status,
    count: leads.filter((lead) => lead.status === status.v).length,
  }));
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-ink-950">Pipeline revenus</h3>
        <Euro className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.v}>
            <div className="flex justify-between text-xs font-semibold text-ink-700">
              <span>{row.label}</span>
              <span>{row.count}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-ink-950" style={{ width: `${Math.round((row.count / total) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/70 p-3">
      <p className="font-bold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function ServiceCard({ service, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article
      onClick={() => setExpanded((value) => !value)}
      className={`cursor-pointer overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition hover:shadow-card ${expanded ? 'md:col-span-2 xl:col-span-2' : ''}`}
    >
      <div className="relative h-36 bg-ink-100">
        {service.image ? <img src={service.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink-300"><Briefcase className="h-8 w-8" /></div>}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-800">{service.subscription}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-ink-950">{service.name}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{service.category}</p>
          </div>
          {service.rating > 0 && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {service.rating}</span>}
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-600">{service.description || 'Description a completer.'}</p>
        {expanded && (
          <div className="mt-4 grid gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-4 text-sm text-ink-700 sm:grid-cols-2">
            <InfoTile label="Localite" value={service.location || 'Non renseignee'} />
            <InfoTile label="Categorie" value={service.category || 'Non renseignee'} />
            <InfoTile label="Telephone" value={service.contact?.phone || 'Non renseigne'} />
            <InfoTile label="Email" value={service.contact?.email || 'Non renseigne'} />
            {service.contact?.website && (
              <a href={service.contact.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="sm:col-span-2 rounded-xl bg-white px-3 py-2 font-semibold text-brand-700 hover:bg-brand-50">
                Site web: {service.contact.website}
              </a>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
          <span className="text-xs text-ink-500">{service.leadsCount || 0} leads</span>
          <div className="flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="grid h-9 w-9 place-items-center rounded-xl text-ink-600 hover:bg-ink-100"><Pencil className="h-4 w-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="grid h-9 w-9 place-items-center rounded-xl text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

function LeadDetailModal({ lead, onClose, onLeadUpdated, onStatusChange }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadChat() {
      if (!lead?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.partnerLeadChat(lead.id);
        if (!active) return;
        setMessages(data.messages || []);
        if (data.lead) onLeadUpdated?.(data.lead);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    setMessages(lead?.chat || []);
    setBody('');
    loadChat();
    return () => { active = false; };
  }, [lead?.id]);

  if (!lead) return null;

  const clientLink = typeof window === 'undefined'
    ? ''
    : `${window.location.origin}/lead-chat/${lead.id}?email=${encodeURIComponent(lead.email)}`;

  async function sendMessage(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const data = await api.partnerSendLeadChatMessage(lead.id, body);
      setMessages(data.messages || []);
      if (data.lead) onLeadUpdated?.(data.lead);
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function copyClientLink() {
    try {
      await navigator.clipboard.writeText(clientLink);
    } catch {
      window.prompt('Lien chat client', clientLink);
    }
  }

  return (
    <Modal open={!!lead} onClose={onClose} title={`Lead - ${lead.name}`} subtitle={lead.service?.name || 'Demande client'} maxWidth="max-w-4xl">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-ink-100 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl font-extrabold text-ink-950">{lead.name}</p>
              <p className="mt-1 text-sm text-ink-500">{formatDate(lead.createdAt)}</p>
            </div>
            <select value={lead.status} onChange={(e) => onStatusChange?.(lead.id, e.target.value)} className="h-9 rounded-xl border border-ink-200 bg-white px-3 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-100">
              {STATUSES.map((status) => <option key={status.v} value={status.v}>{status.label}</option>)}
            </select>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-700"><Mail className="h-4 w-4" /> {lead.email}</a>
            {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-700"><Phone className="h-4 w-4" /> {lead.phone}</a>}
          </div>
          <div className="mt-4 rounded-2xl bg-ink-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Besoin</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-800">{lead.message || 'Aucun besoin detaille.'}</p>
          </div>
          {lead.leadScore && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <InfoTile label="Score" value={lead.leadScore.totalScore} />
              <InfoTile label="Segment" value={lead.leadScore.segment} />
              <InfoTile label="Probabilite" value={`${Math.round((lead.leadScore.conversionProbability || 0) * 100)}%`} />
            </div>
          )}
          <button onClick={copyClientLink} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 px-3 text-sm font-bold text-ink-700 hover:bg-ink-50">
            <Copy className="h-4 w-4" />
            Copier le lien chat client
          </button>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg font-extrabold text-ink-950">Chat direct</h4>
            <MessageSquare className="h-5 w-5 text-brand-600" />
          </div>
          <div className="mt-4 h-72 space-y-3 overflow-y-auto rounded-2xl bg-white p-3">
            {loading && <p className="text-center text-sm text-ink-500">Chargement du chat...</p>}
            {!loading && messages.length === 0 && (
              <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-500">Aucun message pour le moment. Envoyez le premier message au lead.</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'partner' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.sender === 'partner' ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-800'}`}>
                  <p className="whitespace-pre-line">{msg.body}</p>
                  <p className={`mt-1 text-[10px] ${msg.sender === 'partner' ? 'text-white/60' : 'text-ink-400'}`}>
                    {msg.sender === 'partner' ? 'Vous' : lead.name} - {formatDate(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ecrire un message au lead..."
              className="h-11 flex-1 rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
            <Button type="submit" loading={sending} disabled={!body.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </section>
      </div>
    </Modal>
  );
}

function ServiceEditor({ open, initial, partner, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_SERVICE, ...initial, contact: { ...EMPTY_SERVICE.contact, ...(initial.contact || {}) } } : {
        ...EMPTY_SERVICE,
        contact: { ...EMPTY_SERVICE.contact, email: partner?.email || '', phone: partner?.phone || '' },
        location: partner?.location || '',
      });
      setError(null);
    }
  }, [open, initial, partner]);

  const update = (key, value) => setForm((curr) => ({ ...curr, [key]: value }));
  const updateContact = (key, value) => setForm((curr) => ({ ...curr, contact: { ...curr.contact, [key]: value } }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier service' : 'Nouveau service'} subtitle="Votre fiche sera visible dans l'annuaire OMEGA." maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nom du service" required value={form.name} onChange={(value) => update('name', value)} />
          <Field label="Categorie" required value={form.category} onChange={(value) => update('category', value)} />
          <Field label="Localite" value={form.location || ''} onChange={(value) => update('location', value)} />
          <Field label="Image URL" value={form.image || ''} onChange={(value) => update('image', value)} placeholder="https://" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">Description</label>
          <textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Telephone" value={form.contact.phone || ''} onChange={(value) => updateContact('phone', value)} />
          <Field label="Email" type="email" value={form.contact.email || ''} onChange={(value) => updateContact('email', value)} />
          <Field label="Site web" type="url" value={form.contact.website || ''} onChange={(value) => updateContact('website', value)} placeholder="https://" />
        </div>
        <div className="flex justify-end gap-2 border-t border-ink-100 pt-3">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-ink-700 hover:bg-ink-100"><X className="h-4 w-4" /> Annuler</button>
          <Button type="submit" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, type = 'text', ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-700">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input
        {...props}
        required={required}
        type={type}
        onChange={(e) => props.onChange?.(e.target.value)}
        className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
    </div>
  );
}
