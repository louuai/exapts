'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, Briefcase, Inbox, CalendarCheck, MessageSquare,
  ArrowLeft, Shield, LineChart,
  Handshake,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Vue d\'ensemble' },
  { href: '/admin/properties', icon: Building2,       label: 'Biens immobiliers' },
  { href: '/admin/services',   icon: Briefcase,       label: 'Annuaire de services' },
  { href: '/admin/partners',   icon: Handshake,       label: 'Partenaires' },
  { href: '/admin/leads',      icon: Inbox,           label: 'Leads' },
  { href: '/admin/visits',     icon: CalendarCheck,   label: 'Demandes de visite' },
  { href: '/admin/messages',   icon: MessageSquare,   label: 'Messages' },
  { href: '/admin/users',      icon: Users,           label: 'Utilisateurs' },
  { href: '/admin/analytics',  icon: LineChart,       label: 'Analytics' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-100 bg-ink-950 text-ink-200">
      <div className="px-6 pt-6 pb-4">
        <Link href="/admin" className="block">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow">
              <Shield className="h-5 w-5 text-white" />
            </span>
            <div>
              <span className="font-display font-extrabold tracking-tight text-white text-lg block leading-none">OMEGA</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-brand-300 font-semibold">Admin</span>
            </div>
          </div>
        </Link>
      </div>
      <nav className="px-3 flex-1 space-y-0.5">
        {items.map((it) => {
          const active = it.href === '/admin'
            ? pathname === '/admin'
            : pathname === it.href || pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                active ? 'bg-white/10 text-white' : 'text-ink-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', active && 'text-brand-300')} />
              {it.label}
              {active && <span className="ml-auto h-2 w-2 rounded-full bg-brand-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-3 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;app
        </Link>
      </div>
    </aside>
  );
}
