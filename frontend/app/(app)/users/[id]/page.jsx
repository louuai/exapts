'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, MessageSquare, Heart, ArrowLeft, ShieldCheck, BadgeCheck, Settings,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import PostCard from '@/components/feature/PostCard';
import FollowButton from '@/components/feature/FollowButton';
import FollowersModal from '@/components/feature/FollowersModal';
import { PostSkeleton } from '@/components/ui/Skeleton';

export default function PublicUserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: viewer } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [followersOpen, setFollowersOpen] = useState(null); // null | 'followers' | 'following'

  useEffect(() => {
    let alive = true;
    setProfile(null);
    setPosts(null);
    setError(null);

    Promise.all([
      api.publicUser(id).catch((e) => { throw e; }),
      api.userPosts(id).catch(() => ({ posts: [] })),
    ])
      .then(([p, ps]) => { if (!alive) return; setProfile(p.user); setPosts(ps.posts); })
      .catch((err) => { if (!alive) return; setError(err.message); });

    return () => { alive = false; };
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 animate-fadeIn">
        <p className="text-ink-500">Utilisateur introuvable.</p>
        <Link href="/community" className="inline-flex mt-4 h-10 px-4 items-center bg-ink-900 text-white rounded-xl font-semibold text-sm hover:bg-ink-800">
          Retour à la communauté
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
        <div className="skeleton h-44 w-full rounded-3xl" />
        <div className="skeleton h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const isMe = viewer?.id === profile.id;

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la communauté
      </Link>

      {/* Cover + identity */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-ink-900 via-brand-900 to-ink-900 text-white">
        <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay pointer-events-none" />
        <div
          className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(closest-side, #22d3ee, transparent)' }}
        />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/90 shadow-card"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                  {profile.name}
                </h1>
                {profile.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                )}
                {!profile.seeded && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-100">
                    <BadgeCheck className="h-3 w-3" /> Vérifié
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-sm text-white/70 flex flex-wrap items-center gap-3">
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {profile.location}
                  </span>
                )}
                {profile.createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Membre depuis {formatDate(profile.createdAt)}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="mt-3 text-sm text-white/80 max-w-xl">{profile.bio}</p>
              )}
            </div>

            {isMe ? (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white text-ink-900 font-semibold text-sm hover:bg-brand-50 transition self-start sm:self-center"
              >
                <Settings className="h-4 w-4" />
                Gérer mon profil
              </Link>
            ) : viewer && (
              <div className="flex items-center gap-2 self-start sm:self-center">
                <FollowButton
                  targetUserId={profile.id}
                  initialFollowing={!!profile.isFollowing}
                  onChange={(following) => setProfile((p) => ({
                    ...p,
                    isFollowing: following,
                    followersCount: (p.followersCount || 0) + (following ? 1 : -1),
                  }))}
                />
                <button
                  onClick={async () => {
                    try {
                      const { conversationId } = await api.startConversation(profile.id);
                      router.push(`/messages/${conversationId}`);
                    } catch (err) { alert(err.message); }
                  }}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white text-ink-900 font-semibold text-sm border border-ink-200 hover:bg-ink-50 transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
              </div>
            )}
          </div>

          {/* Stats bar — followers & following are clickable (Instagram-style) */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            <Stat label="Publications" value={profile.postsCount} />
            <Stat
              label="Followers"
              value={profile.followersCount}
              onClick={() => setFollowersOpen('followers')}
            />
            <Stat
              label="Following"
              value={profile.followingCount}
              onClick={() => setFollowersOpen('following')}
            />
            <Stat label="J'aime reçus" value={profile.likesReceived} />
          </div>
        </div>
      </div>

      <FollowersModal
        open={!!followersOpen}
        onClose={() => setFollowersOpen(null)}
        userId={profile.id}
        initialTab={followersOpen || 'followers'}
        counts={{ followers: profile.followersCount, following: profile.followingCount }}
      />

      {/* Posts feed */}
      <section className="mt-8 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-ink-900">
              {isMe ? 'Mes publications' : `Publications de ${profile.name.split(' ')[0]}`}
            </h2>
            <p className="text-sm text-ink-500">
              {posts === null ? '…' : `${posts.length} post${posts.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {posts === null ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center text-ink-500">
            {isMe ? "Vous n'avez encore rien publié." : "Cet utilisateur n'a encore rien publié."}
          </div>
        ) : (
          <motion.div className="space-y-4" initial="hidden" animate="visible">
            {posts.map((p) => (
              <PostCard
                key={p.feedKey || p.id}
                post={p}
                onDeleted={(id) => setPosts((curr) => curr.filter((x) => x.id !== id))}
                onUpdated={(u) => setPosts((curr) => curr.map((x) => (x.id === u.id ? u : x)))}
              />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, onClick }) {
  const cls = 'rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm w-full text-left';
  const inner = (
    <>
      <p className="font-display font-extrabold text-xl text-white">{value ?? '—'}</p>
      <p className="text-[11px] text-white/60 mt-0.5 font-semibold uppercase tracking-wider">{label}</p>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} hover:bg-white/10 transition cursor-pointer`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
