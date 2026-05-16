'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Inbox, Briefcase, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Aperçu' },
  { href: '/admin/properties', icon: Building2,       label: 'Biens' },
  { href: '/admin/leads',      icon: Inbox,           label: 'Leads' },
  { href: '/admin/services',   icon: Briefcase,       label: 'Services' },
  { href: '/admin/users',      icon: Users,           label: 'Users' },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-ink-950 text-white shadow-card">
      <ul className="grid grid-cols-5 h-16">
        {items.map((it) => {
          const active = it.href === '/admin'
            ? pathname === '/admin'
            : pathname === it.href || pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex">
              <Link
                href={it.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-semibold transition-colors',
                  active ? 'text-brand-300' : 'text-ink-400'
                )}
              >
                <Icon className="h-5 w-5" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
