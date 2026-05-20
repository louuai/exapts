'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, BedDouble, Bath, Maximize, MapPin, Phone, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import PropertyLeadModal from '@/components/feature/PropertyLeadModal';

export default function PropertyCard({ property, isFavorite: initialFav = false, onToggleFavorite }) {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const [imgIdx, setImgIdx] = useState(0);
  const [fav, setFav] = useState(initialFav);
  const [leadModal, setLeadModal] = useState(null); // null | 'contact' | 'visit'

  const title = locale === 'en' && property.titleEn ? property.titleEn : property.title;

  function openLead(e, mode) {
    e.preventDefault();
    e.stopPropagation();
    setLeadModal(mode);
  }

  async function handleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setFav((v) => !v);
    try {
      await api.toggleFavorite(property.id);
      onToggleFavorite?.(property.id);
    } catch {
      setFav((v) => !v);
    }
  }

  function nav(e, dir) {
    e.preventDefault();
    e.stopPropagation();
    const max = property.images.length;
    setImgIdx((i) => (i + dir + max) % max);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group"
    >
      <div className="rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-card transition-all overflow-hidden flex flex-col">
      <Link
        href={`/properties/${property.id}`}
        className="block"
      >
        {/* Image area */}
        <div className="relative h-60 overflow-hidden bg-ink-100">
          <img
            src={property.images[imgIdx]}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* Image nav (visible on hover) */}
          {property.images.length > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={(e) => nav(e, -1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/95 text-ink-800 grid place-items-center opacity-0 group-hover:opacity-100 transition shadow-soft"
              >‹</button>
              <button
                aria-label="Next"
                onClick={(e) => nav(e, +1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/95 text-ink-800 grid place-items-center opacity-0 group-hover:opacity-100 transition shadow-soft"
              >›</button>
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                {property.images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-all',
                      i === imgIdx ? 'bg-white w-4' : 'bg-white/60'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-3.5rem)]">
            {Array.isArray(property.tags) && property.tags.includes('Expat Opportunity') && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-soft">
                <Star className="h-3 w-3 fill-amber-950" />
                Expat Opportunity
              </span>
            )}
            {property.new && <Badge tone="brand">{t('properties.new')}</Badge>}
            {property.featured && (
              <Badge tone="white">{t('properties.featured')}</Badge>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={handleFav}
            aria-label="Favorite"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 grid place-items-center shadow-soft hover:scale-110 transition"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition',
                fav ? 'fill-rose-500 stroke-rose-500' : 'stroke-ink-700'
              )}
            />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-ink-900 leading-snug line-clamp-1">
              {title}
            </h3>
            <span className="text-xs font-semibold text-ink-500 shrink-0">{property.type}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-ink-500 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{property.location} · {property.region}</span>
            {property.reference && (
              <span className="ml-auto text-[10px] font-bold tracking-wider text-ink-400 uppercase">
                {property.reference}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-ink-600 mt-3">
            <span className="inline-flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {property.surface} m²
            </span>
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-ink-100 flex items-baseline gap-1">
            <span className="font-display font-extrabold text-xl text-ink-900">
              {formatPrice(property.price, property.currency, locale === 'fr' ? 'fr-FR' : 'en-US')}
            </span>
            {property.transaction === 'rent' && (
              <span className="text-xs text-ink-500">{t('properties.perMonth')}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Action row — Contact + Request Visit (creates Lead with type=property) */}
      <div className="px-4 pb-4 mt-auto flex gap-2">
        <button
          onClick={(e) => openLead(e, 'contact')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold text-ink-700 border border-ink-200 bg-white hover:bg-ink-50 transition"
        >
          <Phone className="h-3.5 w-3.5" />
          Contact
        </button>
        <button
          onClick={(e) => openLead(e, 'visit')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold text-white bg-ink-900 hover:bg-ink-800 transition"
        >
          <Calendar className="h-3.5 w-3.5" />
          Demander une visite
        </button>
      </div>
      </div>

      <PropertyLeadModal
        open={!!leadModal}
        onClose={() => setLeadModal(null)}
        property={property}
        mode={leadModal || 'contact'}
      />
    </motion.div>
  );
}
