'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Lightweight admin table with built-in search.
 *
 *   columns: [{ key, header, render?: (row) => node, className?: string }]
 *   rowKey: 'id' or function
 *   searchKeys: array of keys to search through
 */
export default function DataTable({
  rows = [],
  columns = [],
  rowKey = 'id',
  searchKeys = [],
  searchPlaceholder = 'Rechercher…',
  toolbar,
  empty = 'Aucun résultat.',
}) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q.trim() || searchKeys.length === 0) return rows;
    const term = q.toLowerCase();
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(term))
    );
  }, [rows, q, searchKeys]);

  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-soft overflow-hidden">
      <div className="p-3 lg:p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between border-b border-ink-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          />
        </div>
        {toolbar && <div className="flex gap-2">{toolbar}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/60 text-ink-500 text-[11px] uppercase tracking-wider">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn('px-4 py-3 text-left font-bold', c.className)}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.length === 0 && (
              <tr><td colSpan={columns.length} className="p-10 text-center text-ink-500">{empty}</td></tr>
            )}
            {filtered.map((row) => (
              <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey]} className="hover:bg-ink-50/40 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 py-3 align-top', c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-ink-100 text-xs text-ink-500 text-right">
        {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
