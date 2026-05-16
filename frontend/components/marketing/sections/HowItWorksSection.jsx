'use client';
import { motion } from 'framer-motion';
import { UserPlus, Compass, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const steps = [
  { k: 1, icon: UserPlus },
  { k: 2, icon: Compass },
  { k: 3, icon: Sparkles },
];

export default function HowItWorksSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-28 bg-ink-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full bg-white border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-700 uppercase tracking-wider">
            {t('lp.how.eyebrow')}
          </span>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            {t('lp.how.title')}
          </h2>
          <p className="mt-4 text-lg text-ink-600">{t('lp.how.subtitle')}</p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="relative mx-auto h-24 w-24 rounded-3xl bg-white border border-ink-100 shadow-card grid place-items-center">
                  <Icon className="h-8 w-8 text-brand-700" />
                  <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-ink-900 text-white grid place-items-center text-sm font-bold shadow-soft">
                    {s.k}
                  </span>
                </div>
                <h3 className="mt-6 font-display font-bold text-xl text-ink-900">
                  {t(`lp.how.${s.k}.title`)}
                </h3>
                <p className="mt-2 text-ink-600 max-w-xs mx-auto">
                  {t(`lp.how.${s.k}.body`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
