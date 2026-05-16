'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { timeAgo, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import EditPostModal from '@/components/feature/EditPostModal';

export default function PostCard({ post: initial, onDeleted, onUpdated }) {
  const { locale, t } = useI18n();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState(initial);
  const [liked, setLiked] = useState(initial.liked || false);
  const [likes, setLikes] = useState(initial.likes);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  // Re-sync when parent passes a refreshed post
  useEffect(() => {
    setPost(initial);
    setLiked(initial.liked || false);
    setLikes(initial.likes);
  }, [initial]);

  // Close kebab menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function toggleLike() {
    if (!user) return;
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
    try {
      await api.likePost(post.id);
    } catch {
      setLiked((v) => !v);
      setLikes((n) => (liked ? n + 1 : n - 1));
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement ce post ?')) return;
    setDeleting(true);
    try {
      await api.deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  }

  function onPostUpdated(updated) {
    setPost(updated);
    onUpdated?.(updated);
  }

  const ownsPost = user && (user.id === post.user.id || isAdmin);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-2xl bg-white border border-ink-100 shadow-soft overflow-hidden',
          deleting && 'opacity-50 pointer-events-none'
        )}
      >
        <div className="p-5">
          <header className="flex items-start justify-between gap-3">
            <Link
              href={`/users/${post.user.id}`}
              className="flex items-center gap-3 group min-w-0"
            >
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-soft group-hover:ring-brand-100 transition"
              />
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 leading-tight truncate group-hover:text-brand-700 transition">
                  {post.user.name}
                </p>
                <p className="text-xs text-ink-500 truncate">
                  {post.user.location && `${post.user.location} · `}
                  {timeAgo(post.createdAt, locale === 'fr' ? 'fr-FR' : 'en-US')}
                  {post.editedAt && <span className="italic"> · modifié</span>}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              {post.tag && <Badge tone="brand">{post.tag}</Badge>}
              {ownsPost && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="h-8 w-8 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 transition"
                    aria-label="Plus"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-9 z-10 w-48 rounded-xl bg-white border border-ink-100 shadow-card overflow-hidden animate-fadeIn">
                      <button
                        onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4 text-ink-500" />
                        Modifier
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); handleDelete(); }}
                        className="w-full text-left px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 inline-flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          <p className="mt-3 text-ink-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {post.image && (
          <div className="bg-ink-100">
            <img
              src={post.image}
              alt=""
              className="w-full max-h-[440px] object-cover"
            />
          </div>
        )}

        <footer className="px-5 py-3 border-t border-ink-100 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className={cn(
                'inline-flex items-center gap-1.5 font-semibold transition',
                liked ? 'text-rose-600' : 'text-ink-600 hover:text-ink-900'
              )}
            >
              <Heart className={cn('h-4 w-4', liked && 'fill-rose-500 stroke-rose-500')} />
              {likes}
            </button>
            <span className="inline-flex items-center gap-1.5 text-ink-600 font-semibold">
              <MessageCircle className="h-4 w-4" />
              {post.comments}
            </span>
          </div>
          <button className="inline-flex items-center gap-1.5 text-ink-500 hover:text-ink-800 transition">
            <Share2 className="h-4 w-4" /> {t('common.share')}
          </button>
        </footer>
      </motion.article>

      {ownsPost && (
        <EditPostModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          post={post}
          onUpdated={onPostUpdated}
        />
      )}
    </>
  );
}
