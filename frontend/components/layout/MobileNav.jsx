'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Accueil' },
  { href: '/properties', icon: Building2,       label: 'Biens' },
  { href: '/services',   icon: Briefcase,       label: 'Services' },
  { href: '/community',  icon: Users,           label: 'Communauté' },
  { href: '/profile',    icon: User,            label: 'Profil' },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-100 shadow-card">
      <ul className="grid grid-cols-5 h-16">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex">
              <Link
                href={it.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-semibold transition-colors',
                  active ? 'text-brand-700' : 'text-ink-500'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-brand-600')} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
