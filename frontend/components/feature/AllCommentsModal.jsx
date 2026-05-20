'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo, cn } from '@/lib/utils';

/**
 * Full-thread modal for a post's comments. Opens from CommentsSection
 * when there are > 4 comments. Refetches on open so it shows the latest.
 */
export default function AllCommentsModal({ open, onClose, postId, onCountChange }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState('');
  const scroller = useRef(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    api.comments(postId)
      .then((d) => { if (alive) setComments(d.comments || []); })
      .catch(() => { if (alive) setComments([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [open, postId]);

  // Auto-scroll to bottom on new comment
  useEffect(() => {
    if (open) scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [comments.length, open]);

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tous les commentaires"
      subtitle={loading ? 'Chargement…' : `${comments.length} commentaire${comments.length > 1 ? 's' : ''}`}
      maxWidth="max-w-xl"
    >
      <div ref={scroller} className="max-h-[55vh] overflow-y-auto -mx-2 px-2">
        {comments.length === 0 && !loading && (
          <p className="py-8 text-center text-sm text-ink-400">Aucun commentaire pour le moment.</p>
        )}
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Link href={`/users/${c.author?.id}`} className="shrink-0" onClick={onClose}>
                <img src={c.author?.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-soft" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="inline-block rounded-2xl bg-ink-50 px-3 py-2 max-w-full">
                  <Link
                    href={`/users/${c.author?.id}`}
                    onClick={onClose}
                    className="text-xs font-bold text-ink-900 hover:text-brand-700"
                  >
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
      </div>

      {/* Composer */}
      {user ? (
        <form onSubmit={submit} className="mt-4 pt-4 border-t border-ink-100 flex gap-2 items-center">
          <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
          <div className="flex-1 relative">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ajouter un commentaire…"
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
        <p className="mt-3 text-xs text-ink-500 text-center pt-3 border-t border-ink-100">
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">Connectez-vous</Link> pour commenter.
        </p>
      )}
    </Modal>
  );
}
