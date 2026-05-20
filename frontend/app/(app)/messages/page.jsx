'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/utils';
import { getSocket } from '@/lib/socket';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.conversations()
      .then((d) => setList(d.conversations || []))
      .catch(() => setList([]));
  }, [user]);

  // Realtime: bump conversation on new message
  useEffect(() => {
    if (!user) return;
    const s = getSocket();
    if (!s) return;
    const handler = ({ conversationId, message }) => {
      setList((curr) => {
        if (!curr) return curr;
        const idx = curr.findIndex((c) => c.id === conversationId);
        if (idx === -1) {
          // Refresh list — we don't have the peer info yet
          api.conversations().then((d) => setList(d.conversations || [])).catch(() => {});
          return curr;
        }
        const next = curr.slice();
        next[idx] = {
          ...next[idx],
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unread: next[idx].unread + (message.senderId !== user.id ? 1 : 0),
        };
        next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        return next;
      });
    };
    const onDeleted = ({ conversationId }) => {
      setList((curr) => (curr ? curr.filter((c) => c.id !== conversationId) : curr));
    };
    s.on('conversation:bump',    handler);
    s.on('conversation:deleted', onDeleted);
    return () => {
      s.off('conversation:bump',    handler);
      s.off('conversation:deleted', onDeleted);
    };
  }, [user]);

  if (loading) return null;
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fadeIn">
        <MessageSquare className="h-10 w-10 mx-auto text-ink-300" />
        <h1 className="font-display font-bold text-2xl mt-4">Messagerie</h1>
        <p className="text-ink-600 mt-2">Connectez-vous pour discuter avec la communauté.</p>
        <Link href="/login" className="inline-flex mt-4 h-11 px-5 items-center bg-ink-900 text-white rounded-xl font-semibold hover:bg-ink-800">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-2 text-brand-700 mb-2">
        <MessageSquare className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.18em]">OMEGA Messenger</span>
      </div>
      <h1 className="font-display font-extrabold text-3xl lg:text-4xl tracking-tight">Messages</h1>
      <p className="text-ink-600 mt-1">Discutez en direct avec d'autres expatriés et nos agents.</p>

      <div className="mt-6 rounded-2xl bg-white border border-ink-100 shadow-soft overflow-hidden">
        {list === null ? (
          <ul className="divide-y divide-ink-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-4">
                <div className="skeleton h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-ink-500">
            <MessageSquare className="h-10 w-10 mx-auto text-ink-300" />
            <p className="mt-3 font-display font-bold text-ink-900">Aucune conversation</p>
            <p className="text-sm">Visitez un profil utilisateur et cliquez "Message" pour démarrer.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {list.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-ink-50/60 transition"
                >
                  <img src={c.peer?.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-soft" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-ink-900 truncate">{c.peer?.name}</p>
                      <span className="text-[11px] text-ink-400 shrink-0">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <p className="text-xs text-ink-500 truncate">
                        {c.lastMessage ? c.lastMessage.body : <em>Aucun message</em>}
                      </p>
                      {c.unread > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
