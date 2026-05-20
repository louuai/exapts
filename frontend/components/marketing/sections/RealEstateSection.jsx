'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BedDouble, Bath, Maximize, MapPin, ShieldCheck, Phone, Calendar, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PropertyLeadModal from '@/components/feature/PropertyLeadModal';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { mockProperties } from '@/lib/mock-fallback';
import { formatPrice, cn } from '@/lib/utils';

export default function RealEstateSection() {
  const { t, locale } = useI18n();
  const [properties, setProperties] = useState(mockProperties);
  const [leadProperty, setLeadProperty] = useState(null);
  const [leadMode, setLeadMode] = useState('contact');

  useEffect(() => {
    api.properties({ featured: true, transaction: 'sale' })
      .then((d) => setProperties(d.properties?.slice(0, 4) || mockProperties))
      .catch(() => {});
  }, []);

  const openLead = (property, mode = 'contact') => {
    setLeadProperty(property);
    setLeadMode(mode);
  };

  const pills = [
    { key: 'invest', tone: 'amber'   },
    { key: 'live',   tone: 'emerald' },
    { key: 'rent',   tone: 'sky'     },
  ];
  const toneToClass = {
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sky:     'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <section id="real-estate" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center rounded-full bg-ink-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {t('lp.realestate.eyebrow')}
            </span>
            <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
              {t('lp.realestate.title')}
            </h2>
            <p className="mt-4 text-lg text-ink-600">{t('lp.realestate.subtitle')}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {pills.map((p) => (
                <span
                  key={p.key}
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider',
                    toneToClass[p.tone]
                  )}
                >
                  {t(`lp.realestate.tag.${p.key}`)}
                </span>
              ))}
            </div>
          </motion.div>

          <Link href="/properties" className="shrink-0">
            <Button variant="dark" size="lg" className="rounded-full">
              {t('lp.realestate.cta')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {properties.slice(0, 4).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-card transition-all overflow-hidden flex flex-col"
            >
              <Link href={`/properties/${p.id}`} className="block">
                <div className="relative h-52 overflow-hidden bg-ink-100">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-soft">
                      <Star className="h-3 w-3 fill-amber-950" />
                      Expat Opportunity
                    </span>
                    {p.new && <Badge tone="brand">Nouveau</Badge>}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-ink-800 shadow-soft">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Eligible permis
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-display font-bold text-ink-900 leading-snug line-clamp-1">
                    {locale === 'en' && p.titleEn ? p.titleEn : p.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                    <MapPin className="h-3 w-3" /> {p.location} · {p.region}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-ink-600">
                    <span className="inline-flex items-center gap-1">
                      <Maximize className="h-3 w-3" /> {p.surface} m²
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-3 w-3" /> {p.bedrooms}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="h-3 w-3" /> {p.bathrooms}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-ink-100 flex items-baseline justify-between">
                    <span className="font-display font-extrabold text-lg text-ink-900">
                      {formatPrice(p.price, p.currency, locale === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-500">{p.type}</span>
                  </div>
                </div>
              </Link>

              {/* Card CTAs — creates a real Lead with type='property' */}
              <div className="px-4 pb-4 flex gap-2 mt-auto">
                <button
                  onClick={(e) => { e.preventDefault(); openLead(p, 'contact'); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold text-ink-700 border border-ink-200 bg-white hover:bg-ink-50 transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Contact
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); openLead(p, 'visit'); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold text-white bg-ink-900 hover:bg-ink-800 transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Visite
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <PropertyLeadModal
        open={!!leadProperty}
        onClose={() => setLeadProperty(null)}
        property={leadProperty}
        mode={leadMode}
      />
    </section>
  );
}
