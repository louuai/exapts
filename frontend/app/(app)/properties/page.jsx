'use client';
import { useEffect, useMemo, useState } from 'react';
import PropertyCard from '@/components/feature/PropertyCard';
import PropertyFilters from '@/components/feature/PropertyFilters';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { mockProperties } from '@/lib/mock-fallback';
import { Building2, Tag, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PropertiesPage() {
  const { t } = useI18n();

  /* Section = 'sale' | 'rent'. Drives the visible filter set. */
  const [section, setSection] = useState('sale');
  const [filters, setFilters] = useState({});
  const [properties, setProperties] = useState(null);
  const [facets, setFacets] = useState({});
  const [favIds, setFavIds] = useState(new Set());
  const [matching, setMatching] = useState(null);

  /* Combine section + extra filters in one request */
  const queryParams = useMemo(
    () => ({ ...filters, transaction: section }),
    [filters, section]
  );

  useEffect(() => {
    let alive = true;
    setProperties(null);
    api
      .properties(queryParams)
      .then((d) => {
        if (!alive) return;
        setProperties(d.properties);
        setFacets(d.facets);
      })
      .catch(() => {
        if (!alive) return;
        // Fallback when the backend is down
        const filtered = mockProperties.filter((p) => p.transaction === section);
        setProperties(filtered);
        setFacets({
          regions: [...new Set(filtered.map((p) => p.region))],
          types: [...new Set(filtered.map((p) => p.type))],
          locations: [...new Set(filtered.map((p) => p.location))],
        });
      });
    return () => { alive = false; };
  }, [queryParams, section]);

  useEffect(() => {
    api.favorites()
      .then((d) => setFavIds(new Set(d.ids)))
      .catch(() => {});
    api.matchingMe().then((d) => setMatching(d)).catch(() => setMatching(null));
  }, []);

  const matchById = useMemo(() => new Map((matching?.properties || []).map((p) => [p.id, p.matchScore || 0])), [matching]);
  const sortedProperties = useMemo(() => {
    if (!properties) return properties;
    return [...properties].sort((a, b) => (matchById.get(b.id) || 0) - (matchById.get(a.id) || 0));
  }, [properties, matchById]);
  const total = sortedProperties?.length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <Building2 className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">OMEGA Real Estate</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">
          {t('properties.title')}
        </h1>
        <p className="text-ink-600 max-w-2xl">{t('properties.subtitle')}</p>
      </div>

      {/* Achat / Location tabs */}
      <div className="inline-flex p-1 rounded-2xl bg-ink-100 border border-ink-200 shadow-soft">
        <TabButton
          active={section === 'sale'}
          onClick={() => setSection('sale')}
          icon={Tag}
          label="Achat"
          sublabel="13 biens"
        />
        <TabButton
          active={section === 'rent'}
          onClick={() => setSection('rent')}
          icon={KeyRound}
          label="Location"
          sublabel="longue durée"
        />
      </div>

      <PropertyFilters filters={filters} setFilters={setFilters} facets={facets} />

      <div className="flex items-center justify-between text-sm text-ink-600">
        <span>
          {matching?.score && <span className="mr-2 font-semibold text-brand-700">Personnalise {matching.score.segment}</span>}
          {properties === null ? '…' : total}{' '}
          {section === 'sale'
            ? (total > 1 ? 'biens à vendre' : 'bien à vendre')
            : (total > 1 ? 'biens à louer' : 'bien à louer')}
        </span>
      </div>

      {properties === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      )}

      {sortedProperties && total === 0 && (
        <div className="rounded-2xl bg-white border border-ink-100 p-12 text-center text-ink-500">
          {t('properties.empty')}
        </div>
      )}

      {sortedProperties && total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortedProperties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isFavorite={favIds.has(p.id)}
              onToggleFavorite={() => {
                setFavIds((s) => {
                  const ns = new Set(s);
                  ns.has(p.id) ? ns.delete(p.id) : ns.add(p.id);
                  return ns;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, sublabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 sm:px-5 h-11 text-sm font-bold transition-all',
        active
          ? 'bg-white text-ink-900 shadow-soft'
          : 'text-ink-500 hover:text-ink-800'
      )}
    >
      <Icon className={cn('h-4 w-4', active ? 'text-brand-600' : 'text-ink-400')} />
      <span>{label}</span>
      <span className={cn(
        'hidden sm:inline text-[10px] font-semibold uppercase tracking-wider',
        active ? 'text-ink-400' : 'text-ink-400/70'
      )}>
        · {sublabel}
      </span>
    </button>
  );
}
