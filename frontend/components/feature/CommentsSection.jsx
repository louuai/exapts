'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, Trash2, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo, cn } from '@/lib/utils';
import AllCommentsModal from '@/components/feature/AllCommentsModal';

const VISIBLE_LIMIT = 4;

/**
 * Inline comments preview shown directly under a post.
 * Caps the preview at 4 comments and shows a "view all" button that
 * opens a modal with the full thread.
 */
export default function CommentsSection({ postId, onCountChange }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    api.comments(postId)
      .then((d) => alive && setComments(d.comments || []))
      .catch(() => alive && setComments([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [postId]);

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const { comment } = await api.createComment(postId, { content });
      const next = [...comments, comment];
      setComments(next);
      onCountChange?.(next.length);
      setContent('');
    } catch (err) { alert(err.message); }
    finally { setPosting(false); }
  }

  async function remove(id) {
    if (!confirm('Supprimer ce commentaire ?')) return;
    try {
      await api.deleteComment(id);
      const next = comments.filter((c) => c.id !== id);
      setComments(next);
      onCountChange?.(next.length);
    } catch (err) { alert(err.message); }
  }

  // Show only the most recent VISIBLE_LIMIT comments inline; the rest live in the modal
  const visible  = comments.slice(-VISIBLE_LIMIT);
  const hidden   = Math.max(0, comments.length - VISIBLE_LIMIT);

  return (
    <div className="border-t border-ink-100 px-5 py-4 space-y-4">
      {loading ? (
        <p className="text-xs text-ink-400">Chargement des commentaires…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-ink-400">Soyez le premier à commenter.</p>
      ) : (
        <>
          {hidden > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-ink-900 transition"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Voir les {hidden} autre{hidden > 1 ? 's' : ''} commentaire{hidden > 1 ? 's' : ''}
            </button>
          )}

          <ul className="space-y-3">
            {visible.map((c) => (
              <li key={c.id} className="flex gap-3">
                <Link href={`/users/${c.author?.id}`} className="shrink-0">
                  <img src={c.author?.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-soft" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="inline-block rounded-2xl bg-ink-50 px-3 py-2 max-w-full">
                    <Link href={`/users/${c.author?.id}`} className="text-xs font-bold text-ink-900 hover:text-brand-700">
                      {c.author?.name}
                    </Link>
                    <p className="text-sm text-ink-800 mt-0.5 break-words whitespace-pre-line">{c.content}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-ink-500">
                    <span>{timeAgo(c.createdAt)}</span>
                    {user && (c.authorId === user.id || isAdmin) && (
                      <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 hover:text-rose-600">
                        <Trash2 className="h-3 w-3" /> Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {user ? (
        <form onSubmit={submit} className="flex gap-2 items-start">
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
          <div className="flex-1 relative">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrire un commentaire…"
              className="w-full h-10 pl-3 pr-12 rounded-full border border-ink-200 bg-ink-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!content.trim() || posting}
              className={cn(
                'absolute right-1 top-1 h-8 w-8 rounded-full grid place-items-center transition',
                content.trim() ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-ink-100 text-ink-400 cursor-not-allowed'
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-ink-400">
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">Connectez-vous</Link> pour commenter.
        </p>
      )}

      <AllCommentsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        postId={postId}
        onCountChange={(n) => {
          onCountChange?.(n);
          // Refresh inline list when modal closes
          api.comments(postId).then((d) => setComments(d.comments || [])).catch(() => {});
        }}
      />
    </div>
  );
}
