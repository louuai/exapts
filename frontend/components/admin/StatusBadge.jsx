import { cn } from '@/lib/utils';

const MAP = {
  new:       { tone: 'bg-brand-50 text-brand-700 border-brand-200',         label: 'Nouveau' },
  contacted: { tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',   label: 'Contacté' },
  closed:    { tone: 'bg-ink-100 text-ink-700 border-ink-200',              label: 'Fermé' },
  pending:   { tone: 'bg-amber-50 text-amber-700 border-amber-200',         label: 'En attente' },
  confirmed: { tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',   label: 'Confirmée' },
  done:      { tone: 'bg-ink-100 text-ink-700 border-ink-200',              label: 'Terminée' },
  cancelled: { tone: 'bg-rose-50 text-rose-700 border-rose-200',            label: 'Annulée' },
  open:      { tone: 'bg-brand-50 text-brand-700 border-brand-200',         label: 'Ouvert' },
  answered:  { tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',   label: 'Répondu' },
};

export default function StatusBadge({ status }) {
  const m = MAP[status] || { tone: 'bg-ink-100 text-ink-700 border-ink-200', label: status };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', m.tone)}>
      {m.label}
    </span>
  );
}
