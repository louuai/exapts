import { cn } from '@/lib/utils';

const tones = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  ink:   'bg-ink-100 text-ink-700 border-ink-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose:  'bg-rose-50 text-rose-700 border-rose-200',
  sky:   'bg-sky-50 text-sky-700 border-sky-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  teal:  'bg-teal-50 text-teal-700 border-teal-200',
  white: 'bg-white/90 text-ink-900 border-white/0',
};

export default function Badge({ children, tone = 'ink', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone] || tones.ink,
        className
      )}
    >
      {children}
    </span>
  );
}
