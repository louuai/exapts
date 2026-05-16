'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Building2, BookOpen, Users, MapPin, Heart, BedDouble, Bath, Maximize, Gift } from 'lucide-react';
import Button from '@/components/ui/Button';
import LeadCaptureModal from '@/components/feature/LeadCaptureModal';
import { useI18n } from '@/lib/i18n';

export default function HeroSection() {
  const { t, locale } = useI18n();
  const [leadOpen, setLeadOpen] = useState(false);
  const fmt = (n) => new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US').format(n);

  return (
    <section className="relative pt-32 pb-24 sm:pt-36 sm:pb-32 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] pointer-events-none" />
      <div
        className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.4), transparent)' }}
      />
      <div
        className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(8,145,178,0.4), transparent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <Sparkles className="h-3 w-3" />
                {t('lp.hero.eyebrow')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink-900"
            >
              {t('lp.hero.title.line1')}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-tr from-brand-600 to-brand-400">
                {t('lp.hero.title.line2')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-ink-600 max-w-xl"
            >
              {t('lp.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Link href="/properties">
                <Button size="lg" className="rounded-full px-6">
                  {t('lp.hero.cta.primary')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLeadOpen(true)}
                className="rounded-full px-6"
              >
                <Gift className="h-4 w-4" />
                {t('lp.hero.cta.secondary')}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['1438761681033-6461ffad8d80', '1507003211169-0a1dd7228f2d', '1544005313-94ddf0286df2', '1500648767791-00dcc994a43e'].map((id) => (
                    <img
                      key={id}
                      src={`https://images.unsplash.com/photo-${id}?w=64&q=80`}
                      alt=""
                      className="h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                </div>
                <span className="font-semibold text-ink-700">{t('lp.hero.trust.expats')}</span>
              </div>
              <span className="hidden sm:inline-block h-4 w-px bg-ink-200" />
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-brand-600" />
                <span className="font-semibold text-ink-700">{t('lp.hero.trust.properties')}</span>
              </span>
              <span className="hidden sm:inline-block h-4 w-px bg-ink-200" />
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                <span className="font-semibold text-ink-700">{t('lp.hero.trust.guides')}</span>
              </span>
            </motion.div>
          </div>

          {/* Right: product mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            {/* Glow */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-brand-500/20 via-transparent to-brand-300/20 blur-2xl rounded-[3rem]" />

            {/* Browser window mockup */}
            <div className="relative rounded-3xl border border-ink-200/70 bg-white shadow-card overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 h-9 bg-ink-50 border-b border-ink-100">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="mx-auto h-5 px-3 inline-flex items-center text-[11px] text-ink-500 bg-white border border-ink-200 rounded-md font-medium">
                  omega.mu/properties
                </div>
              </div>

              {/* Mockup content — mini property cards */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-ink-50/40 to-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-display font-bold text-ink-900">Biens à la une</p>
                  <span className="text-xs text-ink-500 font-semibold">3 résultats</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {miniListings.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                      className="rounded-xl bg-white border border-ink-100 shadow-soft overflow-hidden"
                    >
                      <div className="relative h-28 bg-ink-100">
                        <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        {p.new && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-brand-600 text-white">
                            NOUVEAU
                          </span>
                        )}
                        <span className="absolute top-2 right-2 h-6 w-6 grid place-items-center bg-white/95 rounded-full">
                          <Heart className="h-3 w-3 text-ink-700" />
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-[12px] font-bold text-ink-900 truncate">{p.title}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-ink-500">
                          <MapPin className="h-2.5 w-2.5" /> {p.loc}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-ink-600">
                          <span className="inline-flex items-center gap-0.5"><Maximize className="h-2.5 w-2.5" /> {p.m2}m²</span>
                          <span className="inline-flex items-center gap-0.5"><BedDouble className="h-2.5 w-2.5" /> {p.bd}</span>
                          <span className="inline-flex items-center gap-0.5"><Bath className="h-2.5 w-2.5" /> {p.bt}</span>
                        </div>
                        <p className="mt-1.5 font-display font-extrabold text-sm text-ink-900">{fmt(p.price)} €</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating notification card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="hidden sm:flex absolute -bottom-4 -left-4 lg:-left-10 items-center gap-3 rounded-2xl bg-white border border-ink-100 shadow-card px-4 py-3 max-w-[260px]"
            >
              <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900 leading-tight">+18 expatriés en ligne</p>
                <p className="text-[11px] text-ink-500 mt-0.5">Discussion sur l'Occupation Permit</p>
              </div>
            </motion.div>

            {/* Floating guide card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="hidden sm:flex absolute -top-4 -right-4 lg:-right-8 items-center gap-3 rounded-2xl bg-white border border-ink-100 shadow-card px-4 py-3 max-w-[260px]"
            >
              <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900 leading-tight">Visa Premium</p>
                <p className="text-[11px] text-ink-500 mt-0.5">Mis à jour il y a 3 jours</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <LeadCaptureModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </section>
  );
}

const miniListings = [
  {
    id: 'ma7-1882',
    title: 'Penthouse 400 m² vue mer',
    loc: 'Grand Baie',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&q=80',
    m2: 400,
    bd: 3,
    bt: 3,
    price: 2890000,
    new: true,
  },
  {
    id: 'ma7-1735',
    title: 'Villa contemporaine 5p.',
    loc: 'Grand Baie',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=640&q=80',
    m2: 416,
    bd: 4,
    bt: 4,
    price: 1690000,
    new: true,
  },
];
