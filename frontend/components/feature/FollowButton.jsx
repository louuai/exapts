'use client';
import { useState } from 'react';
import { UserPlus, UserMinus, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function FollowButton({ targetUserId, initialFollowing = false, onChange, className }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (!user || user.id === targetUserId) return null;

  async function toggle() {
    setLoading(true);
    const next = !following;
    setFollowing(next);
    try {
      const data = await api.toggleFollow(targetUserId);
      setFollowing(data.following);
      onChange?.(data.following);
    } catch (err) {
      setFollowing(!next);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 h-10 px-4 rounded-xl font-bold text-sm transition disabled:opacity-50',
        following
          ? 'bg-white text-ink-900 border border-ink-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700'
          : 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
        className
      )}
    >
      {following ? (
        <>
          <Check className="h-4 w-4" />
          <span>Suivi</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Suivre</span>
        </>
      )}
    </button>
  );
}
