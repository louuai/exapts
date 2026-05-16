'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize,
  Car,
  Calendar,
  Shield,
  MapPin,
  Heart,
  Share2,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { formatPrice, cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { mockProperties } from '@/lib/mock-fallback';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PropertyCard from '@/components/feature/PropertyCard';
import RequestVisitModal from '@/components/feature/RequestVisitModal';
import ContactPropertyModal from '@/components/feature/ContactPropertyModal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id;
  const { locale, t } = useI18n();

  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [fav, setFav] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    api.property(id)
      .then((d) => { if (!alive) return; setProperty(d.property); setSimilar(d.similar || []); })
      .catch(() => {
        if (!alive) return;
        const p = mockProperties.find((x) => x.id === id);
        if (p) {
          setProperty(p);
          setSimilar(mockProperties.filter((x) => x.id !== id).slice(0, 3));
        }
      });
    return () => { alive = false; };
  }, [id]);

  if (!property) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[440px] w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const title = locale === 'en' && property.titleEn ? property.titleEn : property.title;
  const desc = locale === 'en' && property.descriptionEn ? property.descriptionEn : property.description;
  const eligibility = locale === 'en' && property.eligibilityEn ? property.eligibilityEn : property.eligibility;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('properties.back')}
      </Link>

      {/* Title bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {property.new && <Badge tone="brand">{t('properties.new')}</Badge>}
            {property.featured && <Badge tone="amber">{t('properties.featured')}</Badge>}
            <Badge tone="ink">{property.type}</Badge>
          </div>
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight text-ink-900">
            {title}
          </h1>
          <div className="flex items-center gap-1.5 text-ink-600 mt-1.5">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold">{property.location}, {property.region}</span>
            <span className="text-ink-400 mx-1">·</span>
            <span className="text-sm">{property.surface} m²</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFav((v) => !v)}
            className="h-11 w-11 rounded-xl bg-white border border-ink-200 grid place-items-center hover:bg-ink-50 transition"
          >
            <Heart className={cn('h-4 w-4', fav ? 'fill-rose-500 stroke-rose-500' : 'stroke-ink-700')} />
          </button>
          <button className="h-11 w-11 rounded-xl bg-white border border-ink-200 grid place-items-center hover:bg-ink-50 transition">
            <Share2 className="h-4 w-4 text-ink-700" />
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <motion.div
          key={activeImg}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-8 relative aspect-[4/3] lg:aspect-[16/10] rounded-3xl overflow-hidden bg-ink-100"
        >
          <img
            src={property.images[activeImg]}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
          {property.images.slice(0, 4).map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveImg(i)}
              className={cn(
                'aspect-[4/3] rounded-2xl overflow-hidden border-2 transition',
                activeImg === i ? 'border-brand-500 ring-2 ring-brand-200' : 'border-transparent'
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key facts */}
          <section className="rounded-2xl bg-white border border-ink-100 shadow-soft p-5 lg:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-4">
              <Fact icon={Maximize} label={t('properties.surface')} value={`${property.surface} m²`} />
              <Fact icon={BedDouble} label={t('properties.bedrooms')} value={property.bedrooms} />
              <Fact icon={Bath} label={t('properties.bathrooms')} value={property.bathrooms} />
              <Fact icon={Car} label={t('properties.parking')} value={property.parking} />
              <Fact icon={Calendar} label={t('properties.yearBuilt')} value={property.yearBuilt} />
              <Fact icon={Shield} label={t('properties.eligibility')} value={eligibility} compact />
            </div>
          </section>

          {/* Description */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-xl text-ink-900">
              {t('properties.description')}
            </h2>
            <p className="text-ink-700 leading-relaxed">{desc}</p>
          </section>

          {/* Features */}
          {property.features?.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display font-bold text-xl text-ink-900">
                {t('properties.features')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-ink-700 bg-white border border-ink-100 rounded-xl px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: price + agent */}
        <aside className="lg:col-span-1 space-y-5">
          <div className="rounded-2xl bg-white border border-ink-100 shadow-soft p-5 sticky top-20">
            <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">
              {property.transaction === 'rent' ? t('properties.filters.rent') : t('properties.filters.sale')}
            </p>
            <p className="font-display font-extrabold text-3xl text-ink-900 mt-1">
              {formatPrice(property.price, property.currency, locale === 'fr' ? 'fr-FR' : 'en-US')}
              {property.transaction === 'rent' && (
                <span className="text-sm text-ink-500 font-medium ml-1">{t('properties.perMonth')}</span>
              )}
            </p>

            {property.agent && (
              <div className="mt-5 pt-5 border-t border-ink-100">
                <p className="text-xs uppercase tracking-wider font-semibold text-ink-500 mb-3">
                  {t('properties.agent')}
                </p>
                <div className="flex items-center gap-3">
                  <img src={property.agent.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-soft" />
                  <div>
                    <p className="font-semibold text-ink-900">{property.agent.name}</p>
                    <p className="text-xs text-ink-500">{property.agent.agency}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 mt-4">
                  <Button onClick={() => setVisitOpen(true)} className="rounded-xl">
                    <Calendar className="h-4 w-4" />
                    Demander une visite
                  </Button>
                  <Button onClick={() => setContactOpen(true)} variant="secondary" className="rounded-xl">
                    <Phone className="h-4 w-4" />
                    {t('properties.contact')}
                  </Button>
                </div>
                <p className="text-center text-xs text-ink-500 mt-2">{property.agent.phone}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display font-bold text-2xl text-ink-900">
            {t('properties.similar')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      <RequestVisitModal open={visitOpen} onClose={() => setVisitOpen(false)} property={property} />
      <ContactPropertyModal open={contactOpen} onClose={() => setContactOpen(false)} property={property} />
    </div>
  );
}

function Fact({ icon: Icon, label, value, compact }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-ink-500 text-xs font-semibold uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={cn('mt-1 text-ink-900 font-semibold', compact ? 'text-sm leading-snug' : 'text-lg')}>
        {value}
      </p>
    </div>
  );
}
