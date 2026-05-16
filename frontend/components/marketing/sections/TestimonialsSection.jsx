'use client';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const testimonials = [
  {
    name: 'Claire Vidal',
    role: 'Designer · Tamarin',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&q=80',
    rating: 5,
    quote:
      "OMEGA m'a fait gagner 3 mois. Le guide Premium Visa, les biens présélectionnés, la communauté toujours réactive — c'est exactement ce qui manquait.",
  },
  {
    name: 'Marc Dupont',
    role: 'Investisseur · Grand Baie',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&q=80',
    rating: 5,
    quote:
      "J'ai acheté mon penthouse via OMEGA. L'équipe a coordonné notaire, banque et Occupation Permit en parallèle. 18 jours, dossier validé.",
  },
  {
    name: 'Sophie Martin',
    role: 'Maman expat · Flic-en-Flac',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&q=80',
    rating: 5,
    quote:
      "Les guides école et fiscalité sont en or. On a inscrit nos enfants à Westcoast en 2 semaines, sans stress.",
  },
  {
    name: 'Léo Bernard',
    role: 'Tech lead remote · Moka',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&q=80',
    rating: 5,
    quote:
      "La communauté est le vrai trésor d'OMEGA. Des retours d'expérience honnêtes, des bons plans concrets — pas des forums fantômes.",
  },
];

export default function TestimonialsSection() {
  const { t } = useI18n();

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 uppercase tracking-wider">
            {t('lp.testimonials.eyebrow')}
          </span>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            {t('lp.testimonials.title')}
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((tt, i) => (
            <motion.figure
              key={tt.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-soft hover:shadow-card transition-all"
            >
              <Quote className="absolute top-5 right-5 h-6 w-6 text-brand-200" />
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {Array.from({ length: tt.rating }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <blockquote className="text-ink-800 leading-relaxed">
                "{tt.quote}"
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-ink-100 flex items-center gap-3">
                <img
                  src={tt.avatar}
                  alt={tt.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-soft"
                />
                <div>
                  <p className="text-sm font-bold text-ink-900">{tt.name}</p>
                  <p className="text-xs text-ink-500">{tt.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl border border-ink-100 bg-ink-50/60 p-6 lg:p-8"
        >
          {[
            ['4.9 / 5', 'note moyenne'],
            ['+12 000', 'expatriés inscrits'],
            ['480+',    'biens référencés'],
            ['18 j',    'délai moyen Permit'],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">{v}</p>
              <p className="text-xs sm:text-sm text-ink-500 mt-1 font-semibold uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
