'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ShieldCheck, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/**
 * Reusable user search with a dropdown of results.
 * Used in the community page header and the topbar global search.
 */
export default function UserSearchInput({
  placeholder = 'Rechercher un membre…',
  className,
  autoFocus = false,
  onPickedNavigate = true, // if false, the parent handles the pick via onPick
  onPick,
}) {
  const router = useRouter();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  // Debounced search
  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const d = await api.searchUsers(term, 8);
        setResults(d.users || []);
        setHighlighted(0);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function pick(u) {
    setOpen(false);
    setQ('');
    setResults([]);
    if (onPick) onPick(u);
    if (onPickedNavigate) router.push(`/users/${u.id}`);
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp')  { e.preventDefault(); setHighlighted((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter')    { e.preventDefault(); pick(results[highlighted]); }
    else if (e.key === 'Escape')   { setOpen(false); inputRef.current?.blur(); }
  }

  const showDropdown = open && (loading || results.length > 0 || (q.trim().length > 0 && !loading));

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 rounded-xl bg-ink-100/70 border border-transparent text-sm placeholder:text-ink-400 focus:bg-white focus:border-ink-200 focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all"
        autoComplete="off"
      />
      {q && (
        <button
          type="button"
          aria-label="Effacer"
          onClick={() => { setQ(''); setResults([]); inputRef.current?.focus(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-lg text-ink-400 hover:bg-ink-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute z-30 mt-2 left-0 right-0 rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden animate-fadeIn">
          {loading && (
            <div className="px-4 py-3 flex items-center gap-2 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Recherche…
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className="px-4 py-4 text-sm text-ink-500 text-center">Aucun membre trouvé.</p>
          )}
          {!loading && results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((u, i) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => pick(u)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 flex items-center gap-3 transition',
                      i === highlighted ? 'bg-brand-50' : 'hover:bg-ink-50'
                    )}
                  >
                    <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-soft shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900 text-sm flex items-center gap-1.5 truncate">
                        {u.name}
                        {u.role === 'admin' && (
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                      </p>
                      {u.location && (
                        <p className="text-[11px] text-ink-500 inline-flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" /> {u.location}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      Voir profil →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
