'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/Button';

export default function HeroBanner() {
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-brand-900 to-ink-900 text-white">
      <div className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
      <div
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(closest-side, #22d3ee, transparent)' }}
      />
      <div
        className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(closest-side, #0891b2, transparent)' }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 sm:px-10 py-10 lg:py-14">
        <div className="lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-brand-100 backdrop-blur-sm"
          >
            <Sparkles className="h-3 w-3" />
            {t('home.hero.eyebrow')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight mt-4"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-white/80 max-w-xl"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Link href="/properties">
              <Button size="lg" className="bg-white text-ink-900 hover:bg-brand-50">
                {t('home.hero.cta.primary')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/guides">
              <Button size="lg" variant="ghost" className="bg-white/10 text-white border border-white/20 hover:bg-white/20">
                <BookOpen className="h-4 w-4" />
                {t('home.hero.cta.secondary')}
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { v: '32+', k: 'home.stats.guides' },
              { v: '12 K', k: 'home.stats.members' },
              { v: '480+', k: 'home.stats.properties' },
              { v: '14', k: 'home.stats.cities' },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <p className="font-display text-2xl font-extrabold">{s.v}</p>
                <p className="text-xs text-white/70 mt-0.5">{t(s.k)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 hidden lg:block relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="absolute inset-0 rounded-3xl overflow-hidden border border-white/15 shadow-card"
          >
            <img
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 text-ink-900 backdrop-blur-md px-4 py-3 shadow-soft">
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Coup de cœur</p>
              <p className="font-display font-bold text-sm mt-0.5">Penthouse 400 m² · Grand Baie</p>
              <p className="text-xs text-ink-500">2 890 000 € · MA7-1882</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
