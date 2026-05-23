'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Globe, LogOut, User, ChevronDown, CheckCheck, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { cn, timeAgo } from '@/lib/utils';
import UserSearchInput from '@/components/feature/UserSearchInput';

export default function Topbar() {
  const { locale, setLocale, t } = useI18n();
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [openUser, setOpenUser] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = () => api.notifications().then((d) => {
      if (active) setNotifications(d.notifications || []);
    }).catch(() => {});

    load();
    const timer = window.setInterval(load, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user]);

  // Realtime: prepend new notifications when they arrive via socket
  useEffect(() => {
    if (!user) return;
    const s = getSocket();
    if (!s) return;
    const handler = (n) => {
      // Re-fetch to get hydrated payload (actor, title, body)
      api.notifications().then((d) => setNotifications(d.notifications || [])).catch(() => {});
    };
    s.on('notification:new', handler);
    return () => s.off('notification:new', handler);
  }, [user]);

  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setOpenUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function toggleNotifications() {
    const next = !openNotif;
    setOpenNotif(next);
    if (next && user) {
      api.notifications().then((d) => setNotifications(d.notifications || [])).catch(() => {});
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/88 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        {/* Global user search */}
        <div className="flex-1 max-w-2xl">
          <UserSearchInput placeholder={t('nav.search.placeholder')} />
        </div>

        {/* Locale switcher */}
        {isAdmin && (
          <Link
            href="/admin"
            className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 shadow-soft transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            title="Panel admin"
          >
            <Shield className="h-4 w-4" />
          </Link>
        )}

        {/* Locale switcher */}
        <button
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
          className="hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100 transition"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 text-ink-500" />
          <span className="uppercase">{locale}</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 hover:bg-ink-100 transition"
          >
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden animate-fadeIn">
              <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">{unread} non lues</span>
                  {unread > 0 && (
                    <button
                      onClick={async () => {
                        await api.markAllNotificationsRead().catch(() => {});
                        setNotifications((curr) => curr.map((n) => ({ ...n, read: true })));
                      }}
                      className="text-[11px] font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
                      title="Tout marquer comme lu"
                    >
                      <CheckCheck className="h-3 w-3" /> Tout lu
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="p-6 text-center text-sm text-ink-500">Aucune notification</p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={async () => {
                      if (!n.read) {
                        api.markNotificationRead(n.id).catch(() => {});
                        setNotifications((curr) => curr.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                      }
                      setOpenNotif(false);
                      // Route to relevant area
                      const p = n.payload || {};
                      if (n.type === 'NEW_MESSAGE' && p.conversationId) router.push(`/messages/${p.conversationId}`);
                      else if (n.type === 'NEW_FOLLOWER' && p.actorId)  router.push(`/users/${p.actorId}`);
                      else if (['NEW_COMMENT', 'NEW_LIKE', 'NEW_REPOST'].includes(n.type) && p.postId)
                        router.push('/community');
                      else if (['NEW_LEAD', 'NEW_VISIT_REQUEST'].includes(n.type)) router.push('/admin');
                      else if (n.type === 'NEW_PROPERTY' && p.propertyId) router.push(`/properties/${p.propertyId}`);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-ink-50 last:border-0 hover:bg-ink-50/60 transition flex gap-3',
                      !n.read && 'bg-brand-50/40'
                    )}
                  >
                    {n.actor?.avatar && (
                      <img src={n.actor.avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-soft" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{n.title}</p>
                      <p className="text-xs text-ink-600 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-ink-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="h-2 w-2 mt-1.5 rounded-full bg-brand-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        {user ? (
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setOpenUser((v) => !v)}
              className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-xl hover:bg-ink-100 transition"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-soft"
              />
              <span className="hidden md:inline text-sm font-semibold text-ink-800">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="hidden md:inline h-4 w-4 text-ink-400" />
            </button>
            {openUser && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden animate-fadeIn">
                <div className="px-4 py-3 border-b border-ink-100">
                  <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="text-xs text-ink-500 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50">
                    <User className="h-4 w-4 text-ink-500" /> {t('nav.profile')}
                  </Link>
                  <button
                    onClick={() => { logout(); router.push('/login'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-rose-50 text-rose-600"
                  >
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-ink-700 hover:text-ink-900 px-3 py-2">{t('nav.login')}</Link>
            <Link href="/signup" className="text-sm font-semibold bg-ink-900 text-white px-4 py-2 rounded-xl hover:bg-ink-800 transition">{t('nav.signup')}</Link>
          </div>
        )}
      </div>
    </header>
  );
}
