'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  Heart,
  Briefcase,
  User,
  Shield,
  Settings,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/ui/Logo';

const items = [
  { href: '/dashboard',  icon: LayoutDashboard, key: 'nav.dashboard' },
  { href: '/properties', icon: Building2,       key: 'nav.properties' },
  { href: '/guides',     icon: BookOpen,        key: 'nav.guides' },
  { href: '/community',  icon: Users,           key: 'nav.community' },
  { href: '/services',   icon: Briefcase,       key: 'nav.services',   label: 'Services' },
  { href: '/messages',   icon: MessageCircle,   key: 'nav.messages',   label: 'Messages' },
  { href: '/favorites',  icon: Heart,           key: 'nav.favorites' },
  { href: '/profile',    icon: User,            key: 'nav.profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAdmin } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-100 bg-white/82 backdrop-blur-xl">
      <div className="px-6 pt-6 pb-4">
        <Link href="/dashboard"><Logo /></Link>
      </div>
      <nav className="px-3 flex-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                active
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'text-ink-600 hover:bg-white hover:text-ink-900 hover:shadow-soft'
              )}
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] transition-transform group-hover:scale-110',
                  active ? 'text-brand-300' : 'text-ink-400'
                )}
              />
              {it.label || t(it.key)}
              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-brand-300" />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all mt-2',
              pathname.startsWith('/admin')
                ? 'bg-ink-900 text-white'
                : 'text-ink-700 border border-ink-200 bg-white hover:bg-ink-100'
            )}
          >
            <Shield className="h-[18px] w-[18px]" />
            Admin
            <span className="ml-auto rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-amber-950 uppercase tracking-wider">
              owner
            </span>
          </Link>
        )}
      </nav>

      <div className="m-3 p-4 rounded-2xl bg-ink-950 text-white shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-100/80">
          OMEGA Premium
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug">
          Service de conciergerie pour votre installation à Maurice.
        </p>
        <button className="mt-3 text-xs font-bold text-ink-950 bg-brand-300 px-3 py-1.5 rounded-lg hover:bg-brand-200 transition">
          En savoir plus
        </button>
      </div>

      <div className="px-3 pb-6 border-t border-ink-100 pt-3 space-y-1">
        <Link
          href="/profile?tab=settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-100/60"
        >
          <Settings className="h-4 w-4" /> Paramètres
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-100/60"
        >
          <HelpCircle className="h-4 w-4" /> Centre d&apos;aide
        </Link>
      </div>
    </aside>
  );
}
