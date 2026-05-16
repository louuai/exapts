'use client';
import { motion } from 'framer-motion';
import { Banknote, TrendingUp, Sun, ShieldCheck } from 'lucide-react';

const cards = [
  {
    icon: Banknote,
    title: 'Fiscalité avantageuse',
    body: "Impôt sur le revenu plafonné à 15%, pas d'impôt sur les plus-values, convention fiscale France–Maurice contre la double imposition.",
    stats: [{ v: '15%', l: 'IR maximum' }, { v: '0%', l: 'IFI' }],
    tone: 'emerald',
  },
  {
    icon: TrendingUp,
    title: 'ROI immobilier élevé',
    body: "Rendement locatif moyen de 5 à 8% bruts à Grand Baie. Marché en croissance soutenue depuis 2018, demande expat forte.",
    stats: [{ v: '5-8%', l: 'rendement brut' }, { v: '+6%/an', l: 'valorisation' }],
    tone: 'brand',
  },
  {
    icon: Sun,
    title: 'Qualité de vie',
    body: "Climat tropical doux toute l'année, écoles internationales, sécurité, infrastructure médicale moderne. Anglais & français parlés.",
    stats: [{ v: '25°C', l: 'moyenne' }, { v: '0', l: 'décalage France' }],
    tone: 'amber',
  },
  {
    icon: ShieldCheck,
    title: 'Résidence permanente',
    body: "Acquisition immobilière ≥ 375 000 USD = Residence Permit pour toute la famille. Démarches simplifiées via l'EDB.",
    stats: [{ v: '375 K$', l: 'seuil' }, { v: 'Famille', l: 'incluse' }],
    tone: 'sky',
  },
];

const toneMap = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  brand:   'bg-brand-50 text-brand-700 border-brand-200',
  amber:   'bg-amber-50 text-amber-700 border-amber-200',
  sky:     'bg-sky-50 text-sky-700 border-sky-200',
};

export default function WhyMauritiusSection() {
  return (
    <section id="why-mauritius" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Pourquoi Maurice ?
          </span>
          <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            Le meilleur compromis fiscalité, ROI et lifestyle.
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            Maurice est devenue, en 5 ans, la destination #1 des expatriés francophones — et pour de très bonnes raisons.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-3xl bg-white border border-ink-100 shadow-soft hover:shadow-card transition-all p-6 lg:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 shrink-0 rounded-xl grid place-items-center border ${toneMap[c.tone]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-xl text-ink-900">{c.title}</h3>
                    <p className="mt-2 text-ink-600 leading-relaxed">{c.body}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {c.stats.map((s) => (
                        <div key={s.l} className="px-3 py-1.5 rounded-xl bg-ink-50 border border-ink-100">
                          <span className="font-display font-extrabold text-ink-900 text-sm mr-1.5">{s.v}</span>
                          <span className="text-[11px] text-ink-500 font-semibold uppercase tracking-wider">{s.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
