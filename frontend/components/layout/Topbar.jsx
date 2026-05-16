'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Globe, LogOut, User, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Topbar() {
  const { locale, setLocale, t } = useI18n();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [openUser, setOpenUser] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    api.notifications().then((d) => setNotifications(d.notifications || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setOpenUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        {/* Search */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            placeholder={t('nav.search.placeholder')}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-ink-100/70 border border-transparent text-sm placeholder:text-ink-400 focus:bg-white focus:border-ink-200 focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all"
          />
        </div>

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
            onClick={() => setOpenNotif((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 hover:bg-ink-100 transition"
          >
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden animate-fadeIn">
              <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <span className="text-xs text-ink-500">{unread} non lues</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="p-6 text-center text-sm text-ink-500">Aucune notification</p>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'px-4 py-3 border-b border-ink-50 last:border-0 hover:bg-ink-50/60 transition cursor-pointer',
                      !n.read && 'bg-brand-50/40'
                    )}
                  >
                    <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                    <p className="text-xs text-ink-600 mt-0.5">{n.body}</p>
                  </div>
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
