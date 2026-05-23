'use client';
import Link from 'next/link';
import { LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

const TITLES = {
  '/admin': 'Vue d\'ensemble',
  '/admin/properties': 'Biens immobiliers',
  '/admin/services':   'Annuaire de services',
  '/admin/partners':   'Partenaires',
  '/admin/leads':      'Leads',
  '/admin/visits':     'Demandes de visite',
  '/admin/messages':   'Messages',
  '/admin/users':      'Utilisateurs',
  '/admin/analytics':  'Analytics',
};

export default function AdminTopbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const title = Object.entries(TITLES)
    .filter(([href]) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || 'Admin';

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-brand-700 uppercase tracking-[0.18em]">Admin Panel</p>
          <h1 className="font-display font-bold text-lg text-ink-900 truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100"
          >
            <ExternalLink className="h-4 w-4" />
            Voir la landing
          </Link>
          {user && (
            <>
              <div className="flex items-center gap-2 pl-2 pr-1 h-10 rounded-xl bg-ink-100">
                <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                <span className="text-sm font-semibold text-ink-800 hidden sm:inline">{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={() => { logout(); router.push('/login'); }}
                className="h-10 w-10 grid place-items-center rounded-xl text-ink-700 hover:bg-rose-50 hover:text-rose-600"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
