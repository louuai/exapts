'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { ArrowLeft, Clock, Lightbulb, CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function GuideDetailPage() {
  const { slug } = useParams();
  const { locale, t } = useI18n();
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    api.guide(slug).then((d) => setGuide(d.guide)).catch(() => setGuide(null));
  }, [slug]);

  if (!guide) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  const Icon = Icons[guide.icon] || Icons.BookOpen;
  const title = locale === 'en' && guide.titleEn ? guide.titleEn : guide.title;
  const desc = locale === 'en' && guide.descriptionEn ? guide.descriptionEn : guide.description;

  return (
    <article className="max-w-3xl mx-auto pb-12 animate-fadeIn">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('guides.back')}
      </Link>

      {/* Cover */}
      <div className="mt-6 relative aspect-[21/9] rounded-3xl overflow-hidden bg-ink-100 shadow-card">
        <img src={guide.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div className="text-white">
            <Badge tone="white" className="mb-2">{guide.category}</Badge>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight">{title}</h1>
          </div>
          <span className="h-14 w-14 shrink-0 rounded-2xl bg-white/95 backdrop-blur-md grid place-items-center text-ink-900 shadow-soft">
            <Icon className="h-6 w-6" />
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-ink-600">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {guide.readTime} {t('guides.readingTime')}</span>
        <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {t('guides.updatedAt')} {formatDate(guide.updatedAt, locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
      </div>

      {/* Intro */}
      <p className="text-lg text-ink-700 leading-relaxed mt-5">{desc}</p>

      {/* Steps */}
      <section className="mt-10">
        <h2 className="font-display font-bold text-2xl text-ink-900 mb-5">{t('guides.steps.title')}</h2>
        <ol className="space-y-4">
          {guide.steps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex gap-4 rounded-2xl bg-white border border-ink-100 shadow-soft p-5"
            >
              <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-display font-extrabold">
                {i + 1}
              </div>
              <div>
                <h3 className="font-display font-bold text-ink-900">{s.title}</h3>
                <p className="text-ink-700 mt-1 leading-relaxed">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Tips */}
      {guide.tips?.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display font-bold text-2xl text-ink-900 mb-5 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            {t('guides.tips.title')}
          </h2>
          <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-5">
            <ul className="space-y-3">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-ink-800">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-amber-600 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
