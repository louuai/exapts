'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowRight, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const colorMap = {
  sky: 'from-sky-100 to-sky-50 text-sky-700',
  teal: 'from-teal-100 to-teal-50 text-teal-700',
  indigo: 'from-indigo-100 to-indigo-50 text-indigo-700',
  rose: 'from-rose-100 to-rose-50 text-rose-700',
  amber: 'from-amber-100 to-amber-50 text-amber-700',
  violet: 'from-violet-100 to-violet-50 text-violet-700',
  emerald: 'from-emerald-100 to-emerald-50 text-emerald-700',
};

export default function GuideCard({ guide, compact = false }) {
  const { locale, t } = useI18n();
  const Icon = Icons[guide.icon] || Icons.BookOpen;
  const title = locale === 'en' && guide.titleEn ? guide.titleEn : guide.title;
  const desc = locale === 'en' && guide.descriptionEn ? guide.descriptionEn : guide.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/guides/${guide.slug}`}
        className="group block rounded-2xl bg-white border border-ink-100 shadow-soft hover:shadow-card transition-all p-5 h-full"
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'h-12 w-12 shrink-0 rounded-xl grid place-items-center bg-gradient-to-br',
              colorMap[guide.color] || colorMap.teal
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge tone={guide.color || 'teal'}>{guide.category}</Badge>
            </div>
            <h3 className="font-display font-bold text-ink-900 leading-snug line-clamp-1">
              {title}
            </h3>
            {!compact && (
              <p className="text-sm text-ink-600 mt-1.5 line-clamp-2">{desc}</p>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
              <span className="inline-flex items-center gap-1 text-xs text-ink-500 font-medium">
                <Clock className="h-3 w-3" /> {guide.readTime} {t('guides.readingTime')}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:gap-2 transition-all">
                {t('guides.read')} <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
