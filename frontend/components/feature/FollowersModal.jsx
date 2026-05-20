'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Users as UsersIcon } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import FollowButton from '@/components/feature/FollowButton';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

/**
 * Instagram-style Followers / Following modal.
 * Two tabs, a search box, and a "X amis en commun" hint per user.
 */
export default function FollowersModal({ open, onClose, userId, initialTab = 'followers', counts = {} }) {
  const { user: viewer } = useAuth();
  const [tab, setTab]       = useState(initialTab);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [q, setQ]           = useState('');

  // Reset tab when modal reopens with a different requested tab
  useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  // Fetch both lists on open (one round-trip each, cached for the duration of the modal)
  useEffect(() => {
    if (!open || !userId) return;
    let alive = true;
    setFollowers(null);
    setFollowing(null);
    Promise.all([api.userFollowers(userId), api.userFollowing(userId)])
      .then(([f1, f2]) => { if (!alive) return; setFollowers(f1.users || []); setFollowing(f2.users || []); })
      .catch(() => { if (!alive) return; setFollowers([]); setFollowing([]); });
    return () => { alive = false; };
  }, [open, userId]);

  const list = tab === 'followers' ? followers : following;

  const filtered = useMemo(() => {
    if (!list) return null;
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((u) =>
      u.name.toLowerCase().includes(term) ||
      (u.location || '').toLowerCase().includes(term)
    );
  }, [list, q]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tab === 'followers' ? 'Followers' : 'Abonnements'}
      subtitle={null}
      maxWidth="max-w-md"
    >
      {/* Tabs */}
      <div className="flex border-b border-ink-100 -mx-6 px-6 -mt-2 mb-3">
        <TabButton
          active={tab === 'followers'}
          onClick={() => setTab('followers')}
          label="Followers"
          count={counts.followers ?? followers?.length}
        />
        <TabButton
          active={tab === 'following'}
          onClick={() => setTab('following')}
          label="Abonnements"
          count={counts.following ?? following?.length}
        />
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un membre…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-ink-200 bg-ink-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none text-sm"
        />
      </div>

      {/* List */}
      <div className="max-h-[55vh] overflow-y-auto -mx-2 px-2">
        {filtered === null && (
          <ul className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
              </li>
            ))}
          </ul>
        )}
        {filtered && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-ink-500">
            <UsersIcon className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-2">{q ? 'Aucun résultat.' : 'Aucun membre ici pour le moment.'}</p>
          </div>
        )}
        {filtered && filtered.length > 0 && (
          <ul className="space-y-1">
            {filtered.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-ink-50/60 transition">
                <Link
                  href={`/users/${u.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <img
                    src={u.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-soft shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{u.name}</p>
                    <div className="text-[11px] text-ink-500 truncate flex items-center gap-2">
                      {u.location && (
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" /> {u.location}
                        </span>
                      )}
                      {viewer && !u.isSelf && u.mutualCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold">
                          {u.mutualCount} ami{u.mutualCount > 1 ? 's' : ''} en commun
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                {viewer && !u.isSelf && (
                  <FollowButton
                    targetUserId={u.id}
                    initialFollowing={!!u.isFollowing}
                    className="!h-8 !px-3 !text-xs shrink-0"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 py-3 text-sm font-bold border-b-2 transition-colors',
        active
          ? 'border-brand-600 text-ink-900'
          : 'border-transparent text-ink-500 hover:text-ink-800'
      )}
    >
      {label}
      {typeof count === 'number' && (
        <span className={cn('ml-1.5 text-xs font-semibold', active ? 'text-brand-700' : 'text-ink-400')}>
          {count}
        </span>
      )}
    </button>
  );
}
