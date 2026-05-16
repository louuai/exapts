'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n';

export default function FinalCTASection() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-28 bg-ink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-ink-900 via-brand-900 to-ink-900 text-white"
        >
          <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
          <div
            className="absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(closest-side, #22d3ee, transparent)' }}
          />
          <div
            className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(closest-side, #0891b2, transparent)' }}
          />

          <div className="relative px-6 sm:px-12 py-14 sm:py-20 text-center max-w-3xl mx-auto">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              {t('lp.cta.title')}
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              {t('lp.cta.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-6 bg-white text-ink-900 hover:bg-brand-50">
                  {t('lp.cta.primary')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#">
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full px-6 bg-white/10 border border-white/20 text-white hover:bg-white/20"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t('lp.cta.secondary')}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/60">
              Aucune carte bancaire requise · Démo accessible immédiatement
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
