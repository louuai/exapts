'use client';
import { motion } from 'framer-motion';
import { Home, Users, Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function ProblemSection() {
  const { t } = useI18n();
  const items = [
    { icon: Home,  k: 1, tone: 'rose'   },
    { icon: Users, k: 2, tone: 'amber'  },
    { icon: Info,  k: 3, tone: 'violet' },
  ];

  const tones = {
    rose:   'from-rose-100 to-rose-50 text-rose-700',
    amber:  'from-amber-100 to-amber-50 text-amber-700',
    violet: 'from-violet-100 to-violet-50 text-violet-700',
  };

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 uppercase tracking-wider">
            {t('lp.problem.eyebrow')}
          </span>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            {t('lp.problem.title')}
          </h2>
          <p className="mt-4 text-lg text-ink-600">{t('lp.problem.subtitle')}</p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-ink-100 bg-white p-6 lg:p-8 shadow-soft hover:shadow-card transition-all hover:-translate-y-1"
              >
                <div className={`h-12 w-12 rounded-xl grid place-items-center bg-gradient-to-br ${tones[it.tone]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display font-bold text-xl text-ink-900">
                  {t(`lp.problem.${it.k}.title`)}
                </h3>
                <p className="mt-2 text-ink-600 leading-relaxed">{t(`lp.problem.${it.k}.body`)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
