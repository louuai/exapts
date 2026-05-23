'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, LogOut, Mail, Phone, Star, UsersRound } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const STATUSES = [
  { v: 'new', label: 'Nouveau' },
  { v: 'contacted', label: 'Contacte' },
  { v: 'converted', label: 'Converti' },
  { v: 'closed', label: 'Ferme' },
];

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState(null);
  const [services, setServices] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [me, leadData] = await Promise.all([api.partnerMe(), api.partnerLeads()]);
      setPartner(me.partner);
      setServices(me.services || []);
      setLeads(leadData.leads || []);
    } catch {
      window.localStorage.removeItem('omega.partnerToken');
      router.replace('/partner/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function changeStatus(id, status) {
    const data = await api.partnerUpdateLead(id, { status });
    setLeads((curr) => curr.map((lead) => (lead.id === id ? data.lead : lead)));
  }

  const stats = useMemo(() => ({
    leads: leads.length,
    newLeads: leads.filter((l) => l.status === 'new').length,
    converted: leads.filter((l) => l.status === 'converted').length,
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
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">Tableau de bord</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold">Clients, leads et services</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-300">
                Consulte les demandes recues depuis l'annuaire, contacte les prospects et garde ton profil professionnel a jour.
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
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:col-span-1">
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

          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-ink-950">Mes services annuaire</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div key={service.id} className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-ink-500">
                      {service.image ? <img src={service.image} alt="" className="h-full w-full object-cover" /> : <Briefcase className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-950">{service.name}</p>
                      <p className="text-xs text-ink-500">{service.category} · {service.subscription}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-600">{service.description}</p>
                    </div>
                    {service.rating > 0 && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {service.rating}</span>}
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-sm text-ink-500">Aucun service lie pour le moment.</p>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <div>
              <h3 className="font-display text-lg font-bold text-ink-950">Leads recus</h3>
              <p className="text-sm text-ink-500">Contact direct par email ou telephone.</p>
            </div>
            <UsersRound className="h-5 w-5 text-brand-600" />
          </div>
          <div className="divide-y divide-ink-100">
            {leads.map((lead) => (
              <div key={lead.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950">{lead.name}</p>
                  <p className="mt-1 text-sm text-ink-500">{lead.service?.name} · {formatDate(lead.createdAt)}</p>
                  {lead.message && <p className="mt-2 line-clamp-2 text-sm text-ink-700">{lead.message}</p>}
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <a href={`mailto:${lead.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 font-semibold text-ink-700 hover:bg-ink-50"><Mail className="h-4 w-4" /> Email</a>
                  {lead.phone && <a href={`tel:${lead.phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 font-semibold text-ink-700 hover:bg-ink-50"><Phone className="h-4 w-4" /> Appel</a>}
                </div>
                <select value={lead.status} onChange={(e) => changeStatus(lead.id, e.target.value)} className="h-9 rounded-xl border border-ink-200 bg-white px-3 text-xs font-bold outline-none focus:ring-4 focus:ring-brand-100">
                  {STATUSES.map((status) => <option key={status.v} value={status.v}>{status.label}</option>)}
                </select>
              </div>
            ))}
            {leads.length === 0 && <p className="p-10 text-center text-sm text-ink-500">Aucun lead recu pour le moment.</p>}
          </div>
        </section>
      </main>
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
