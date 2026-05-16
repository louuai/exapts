'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Users, Briefcase, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const modules = [
  { key: 'guides',     icon: BookOpen,  tone: 'sky',     href: '/guides',     featured: false },
  { key: 'community',  icon: Users,     tone: 'emerald', href: '/community',  featured: false },
  { key: 'services',   icon: Briefcase, tone: 'amber',   href: '#',           featured: false, soon: true },
  { key: 'realestate', icon: Building2, tone: 'brand',   href: '/properties', featured: true  },
];

const toneClasses = {
  sky:     { dot: 'bg-sky-500',     iconBg: 'bg-sky-50 text-sky-700',         border: 'border-sky-100'     },
  emerald: { dot: 'bg-emerald-500', iconBg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-100' },
  amber:   { dot: 'bg-amber-500',   iconBg: 'bg-amber-50 text-amber-700',     border: 'border-amber-100'   },
  brand:   { dot: 'bg-brand-500',   iconBg: 'bg-brand-50 text-brand-700',     border: 'border-brand-200'   },
};

export default function SolutionSection() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-20 sm:py-28 bg-ink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 uppercase tracking-wider">
            {t('lp.solution.eyebrow')}
          </span>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            {t('lp.solution.title')}
          </h2>
          <p className="mt-4 text-lg text-ink-600">{t('lp.solution.subtitle')}</p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {modules.map((m, i) => {
            const Icon = m.icon;
            const tone = toneClasses[m.tone];
            const bullets = t(`lp.solution.${m.key}.bullets`).split('|');

            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`group relative rounded-3xl bg-white border ${tone.border} p-7 lg:p-8 shadow-soft hover:shadow-card transition-all overflow-hidden`}
              >
                {m.featured && (
                  <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-ink-900 text-white px-2.5 py-0.5 text-[10px] font-bold tracking-wider">
                    PRIORITÉ
                  </span>
                )}
                {m.soon && (
                  <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[10px] font-bold tracking-wider">
                    BIENTÔT
                  </span>
                )}

                <div className={`h-12 w-12 rounded-xl grid place-items-center ${tone.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-display font-bold text-2xl text-ink-900 leading-tight">
                  {t(`lp.solution.${m.key}.title`)}
                </h3>
                <p className="mt-2 text-ink-600 leading-relaxed">
                  {t(`lp.solution.${m.key}.body`)}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {bullets.map((b) => (
                    <li
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 border border-ink-100 px-3 py-1 text-xs font-semibold text-ink-700"
                    >
                      <CheckCircle2 className={`h-3 w-3 ${tone.dot.replace('bg-', 'text-')}`} />
                      {b}
                    </li>
                  ))}
                </ul>

                <Link
                  href={m.href}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-ink-900 group-hover:gap-2 transition-all"
                >
                  Découvrir <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Soft decorative gradient corner */}
                <div className={`absolute -bottom-16 -right-16 h-56 w-56 rounded-full ${tone.dot} opacity-[0.04]`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
