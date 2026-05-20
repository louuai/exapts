'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, MoreVertical, Trash2, Pencil, X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getSocket } from '@/lib/socket';
import { timeAgo, cn } from '@/lib/utils';
import EmojiPicker from '@/components/feature/EmojiPicker';

export default function ConversationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState(null);
  const [peer, setPeer] = useState(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [convoMenuOpen, setConvoMenuOpen] = useState(false);
  const scroller = useRef(null);
  const textareaRef = useRef(null);
  const convoMenuRef = useRef(null);

  // Resolve peer info via the conversations list (cheap call we already cache server-side)
  useEffect(() => {
    if (!user) return;
    api.conversations().then((d) => {
      const c = (d.conversations || []).find((x) => x.id === id);
      if (c) setPeer(c.peer);
    }).catch(() => {});
  }, [id, user]);

  // Load messages
  useEffect(() => {
    if (!user) return;
    api.conversationMessages(id)
      .then((d) => setMessages(d.messages || []))
      .catch(() => setMessages([]));
  }, [id, user]);

  // Auto-scroll
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length]);

  // Real-time WS
  useEffect(() => {
    if (!user) return;
    const s = getSocket();
    if (!s) return;
    s.emit('conversation:join', id);

    const onNew     = (m) => setMessages((curr) => (curr?.some((x) => x.id === m.id) ? curr : [...(curr || []), m]));
    const onUpdated = (m) => setMessages((curr) => (curr || []).map((x) => (x.id === m.id ? m : x)));
    const onDeleted = (m) => setMessages((curr) => (curr || []).map((x) => (x.id === m.id ? m : x)));
    const onConvoDeleted = ({ conversationId }) => {
      if (conversationId === id) router.push('/messages');
    };

    s.on('message:new',     onNew);
    s.on('message:updated', onUpdated);
    s.on('message:deleted', onDeleted);
    s.on('conversation:deleted', onConvoDeleted);
    return () => {
      s.off('message:new',     onNew);
      s.off('message:updated', onUpdated);
      s.off('message:deleted', onDeleted);
      s.off('conversation:deleted', onConvoDeleted);
      s.emit('conversation:leave', id);
    };
  }, [id, user, router]);

  // Outside-click handlers for the conversation 3-dot menu
  useEffect(() => {
    const onClick = (e) => { if (convoMenuRef.current && !convoMenuRef.current.contains(e.target)) setConvoMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function send(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const { message } = await api.sendChatMessage(id, body);
      setMessages((curr) => (curr?.some((m) => m.id === message.id) ? curr : [...(curr || []), message]));
      setBody('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  function insertEmoji(emo) {
    const ta = textareaRef.current;
    if (!ta) { setBody((b) => b + emo); return; }
    const start = ta.selectionStart ?? body.length;
    const end   = ta.selectionEnd   ?? body.length;
    setBody(body.slice(0, start) + emo + body.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + emo.length;
    });
  }

  function startEdit(m) {
    setEditingId(m.id);
    setEditingDraft(m.body);
    setMenuOpenFor(null);
  }
  function cancelEdit() { setEditingId(null); setEditingDraft(''); }

  async function saveEdit(m) {
    if (!editingDraft.trim() || editingDraft.trim() === m.body) { cancelEdit(); return; }
    try {
      const { message } = await api.editChatMessage(id, m.id, editingDraft.trim());
      setMessages((curr) => curr.map((x) => (x.id === m.id ? message : x)));
      cancelEdit();
    } catch (err) { alert(err.message); }
  }

  async function deleteMsg(m) {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      const { message } = await api.deleteChatMessage(id, m.id);
      setMessages((curr) => curr.map((x) => (x.id === m.id ? message : x)));
      setMenuOpenFor(null);
    } catch (err) { alert(err.message); }
  }

  async function deleteConversation() {
    if (!confirm('Supprimer définitivement cette discussion ? Cette action est irréversible.')) return;
    try {
      await api.deleteConversation(id);
      router.push('/messages');
    } catch (err) { alert(err.message); }
  }

  if (loading) return null;
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fadeIn">
        <p>Connectez-vous pour accéder à la messagerie.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col animate-fadeIn">
      {/* Header */}
      <header className="rounded-2xl bg-white border border-ink-100 shadow-soft p-3 flex items-center gap-3">
        <Link href="/messages" className="h-9 w-9 grid place-items-center rounded-xl hover:bg-ink-100 text-ink-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {peer && (
          <Link href={`/users/${peer.id}`} className="flex items-center gap-3 group flex-1 min-w-0">
            <img src={peer.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-soft" />
            <div className="min-w-0">
              <p className="font-semibold text-ink-900 leading-tight group-hover:text-brand-700 truncate">{peer.name}</p>
              <p className="text-xs text-ink-500 truncate">{peer.location || ''}</p>
            </div>
          </Link>
        )}
        {/* Conversation menu */}
        <div className="relative" ref={convoMenuRef}>
          <button
            onClick={() => setConvoMenuOpen((v) => !v)}
            className="h-9 w-9 grid place-items-center rounded-xl hover:bg-ink-100 text-ink-600"
            aria-label="Options de la discussion"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {convoMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white border border-ink-100 shadow-card overflow-hidden animate-fadeIn z-20">
              <button
                onClick={() => { setConvoMenuOpen(false); deleteConversation(); }}
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 inline-flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer la discussion
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages stream */}
      <div
        ref={scroller}
        className="flex-1 mt-3 rounded-2xl bg-white border border-ink-100 shadow-soft p-4 overflow-y-auto space-y-3"
      >
        {messages === null && <p className="text-center text-ink-400 text-sm py-6">Chargement…</p>}
        {messages && messages.length === 0 && (
          <p className="text-center text-ink-400 text-sm py-6">Aucun message. Lancez la discussion ✨</p>
        )}
        {messages && messages.map((m) => {
          const mine = m.senderId === user.id;
          const isDeleted = !!m.deletedAt;
          const isEditing = editingId === m.id;

          // Soft-deleted: subtle italic placeholder
          if (isDeleted) {
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className="px-3 py-1 text-[11px] text-ink-400 italic">
                  message supprimé
                </div>
              </div>
            );
          }

          return (
            <div key={m.id} className={cn('group flex items-end gap-1.5', mine ? 'justify-end' : 'justify-start')}>
              {mine && !isEditing && (
                <div className="relative opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => setMenuOpenFor((cur) => (cur === m.id ? null : m.id))}
                    className="h-7 w-7 grid place-items-center rounded-full hover:bg-ink-100 text-ink-500"
                    aria-label="Options du message"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                  {menuOpenFor === m.id && (
                    <div className="absolute bottom-9 right-0 w-44 rounded-xl bg-white border border-ink-100 shadow-card overflow-hidden z-10">
                      <button
                        onClick={() => startEdit(m)}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50 inline-flex items-center gap-2"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Modifier
                      </button>
                      <button
                        onClick={() => deleteMsg(m)}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 inline-flex items-center gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isEditing ? (
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-2.5 py-1.5 shadow-soft bg-white border border-brand-300',
                  mine ? 'rounded-br-sm' : 'rounded-bl-sm'
                )}>
                  <textarea
                    value={editingDraft}
                    onChange={(e) => setEditingDraft(e.target.value)}
                    autoFocus
                    rows={Math.min(4, editingDraft.split('\n').length)}
                    className="w-full min-w-[200px] resize-none text-sm bg-transparent focus:outline-none text-ink-900"
                  />
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-ink-100 mt-1">
                    <button
                      onClick={cancelEdit}
                      className="h-7 w-7 grid place-items-center rounded-md hover:bg-ink-100 text-ink-500"
                      aria-label="Annuler"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => saveEdit(m)}
                      className="h-7 w-7 grid place-items-center rounded-md bg-brand-600 text-white hover:bg-brand-700"
                      aria-label="Enregistrer"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft',
                  mine ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-ink-100 text-ink-900 rounded-bl-sm'
                )}>
                  <p className="whitespace-pre-line break-words">{m.body}</p>
                  <p className={cn('text-[10px] mt-1', mine ? 'text-brand-100' : 'text-ink-500')}>
                    {timeAgo(m.createdAt)}
                    {m.editedAt && <span className="italic"> · modifié</span>}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form onSubmit={send} className="mt-3 rounded-2xl bg-white border border-ink-100 shadow-soft p-2 flex gap-2 items-end">
        <EmojiPicker onPick={insertEmoji} />
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
          rows={1}
          placeholder="Votre message…"
          className="flex-1 resize-none px-3 py-2 rounded-xl bg-ink-50 border border-transparent focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-100 focus:outline-none text-sm max-h-32"
        />
        <button
          type="submit"
          disabled={!body.trim() || sending}
          className={cn(
            'h-10 w-10 grid place-items-center rounded-xl transition',
            body.trim() ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-ink-100 text-ink-400 cursor-not-allowed'
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
