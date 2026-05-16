'use client';
import { useEffect, useState, useMemo } from 'react';
import { Briefcase, Search, Phone, Mail, Globe, MapPin, Star, BadgeCheck, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import ServiceQuoteModal from '@/components/feature/ServiceQuoteModal';

export default function ServicesPage() {
  const [services, setServices] = useState(null);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [quoteFor, setQuoteFor] = useState(null);

  useEffect(() => {
    api.services()
      .then((d) => { setServices(d.services); setCategories(d.categories || []); })
      .catch(() => setServices([]));
  }, []);

  const filtered = useMemo(() => {
    if (!services) return null;
    return services.filter((s) => {
      if (category && s.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q) ||
          (s.location || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [services, query, category]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <Briefcase className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">OMEGA Directory</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
          Annuaire de services
        </h1>
        <p className="text-ink-600 max-w-2xl">
          Notaires, agents, avocats, transport, écoles… Prestataires de confiance vérifiés
          par la communauté OMEGA.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-ink-100 shadow-soft p-3 lg:p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="search"
            placeholder="Rechercher un prestataire…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          <CatChip active={category === ''} onClick={() => setCategory('')}>Tous</CatChip>
          {categories.map((c) => (
            <CatChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </CatChip>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-600">
        {filtered === null ? '…' : filtered.length} prestataire{(filtered?.length || 0) > 1 ? 's' : ''} disponibles
      </p>

      {/* Premium showcase banner */}
      {services?.some((s) => s.subscription === 'premium') && !query && !category && (
        <PremiumShowcase
          services={services.filter((s) => s.subscription === 'premium').slice(0, 4)}
          onAskQuote={setQuoteFor}
        />
      )}

      {/* Grid */}
      {filtered === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-ink-100 p-12 text-center text-ink-500">
          Aucun prestataire ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} onAskQuote={setQuoteFor} />
          ))}
        </div>
      )}

      <ServiceQuoteModal
        open={!!quoteFor}
        onClose={() => setQuoteFor(null)}
        service={quoteFor}
      />
    </div>
  );
}

function CatChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 px-3 rounded-xl text-sm font-semibold transition shrink-0',
        active ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
      )}
    >
      {children}
    </button>
  );
}

function PremiumShowcase({ services, onAskQuote }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-ink-900 via-brand-900 to-ink-900 text-white p-5 lg:p-7 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay pointer-events-none" />
      <div className="relative flex items-center gap-2 text-brand-200 mb-4">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.18em]">Prestataires Premium · Vérifiés OMEGA</span>
      </div>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onAskQuote(s)}
            className="text-left rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 p-4 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 overflow-hidden shrink-0">
                {s.image && <img src={s.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-brand-200 font-bold uppercase tracking-wider truncate">{s.category}</p>
                <p className="font-display font-bold text-sm leading-tight truncate group-hover:text-brand-100">{s.name}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/70 line-clamp-2">{s.description}</p>
            <span className="mt-3 inline-block text-[11px] font-bold text-brand-200 group-hover:text-brand-100">
              Demander un devis →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service, index, onAskQuote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-card transition-all overflow-hidden flex flex-col"
    >
      <div className="relative h-40 bg-ink-100 overflow-hidden">
        {service.image && (
          <img src={service.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-800">
            {service.category}
          </span>
          {service.subscription === 'premium' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <BadgeCheck className="h-3 w-3" />
              Premium
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-ink-900 leading-tight line-clamp-2">{service.name}</h3>
          {service.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              {service.rating}
            </span>
          )}
        </div>
        {service.location && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
            <MapPin className="h-3 w-3" /> {service.location}
            {service.reviews > 0 && <span className="ml-2">· {service.reviews} avis</span>}
          </p>
        )}
        <p className="mt-3 text-sm text-ink-700 leading-relaxed flex-1 line-clamp-3">
          {service.description}
        </p>

        <div className="mt-4 pt-4 border-t border-ink-100 flex flex-wrap gap-3 text-xs">
          {service.contact?.phone && (
            <a href={`tel:${service.contact.phone}`} className="inline-flex items-center gap-1 font-semibold text-ink-700 hover:text-brand-700">
              <Phone className="h-3.5 w-3.5" /> {service.contact.phone}
            </a>
          )}
          {service.contact?.email && (
            <a href={`mailto:${service.contact.email}`} className="inline-flex items-center gap-1 font-semibold text-ink-700 hover:text-brand-700">
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          )}
          {service.contact?.website && (
            <a href={service.contact.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-ink-700 hover:text-brand-700">
              <Globe className="h-3.5 w-3.5" /> Web
            </a>
          )}
        </div>

        <button
          onClick={() => onAskQuote?.(service)}
          className="mt-4 w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-ink-900 text-white text-sm font-bold hover:bg-ink-800 transition"
        >
          <MessageSquare className="h-4 w-4" />
          Demander un devis
        </button>
      </div>
    </motion.div>
  );
}
