'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Globe, Gift } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import LeadCaptureModal from '@/components/feature/LeadCaptureModal';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function MarketingNav() {
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { href: '#features',     label: t('lp.nav.features') },
    { href: '#real-estate',  label: t('lp.nav.realEstate') },
    { href: '#testimonials', label: t('lp.nav.testimonials') },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-ink-100 shadow-soft'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {items.map((it) => (
            <li key={it.href}>
              <a
                href={it.href}
                className="px-3 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 transition-colors rounded-lg hover:bg-ink-100/60"
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100 transition"
          >
            <Globe className="h-4 w-4 text-ink-500" />
            <span className="uppercase">{locale}</span>
          </button>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900 transition"
          >
            {t('lp.nav.signIn')}
          </Link>
          <Button
            onClick={() => setLeadOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-full px-4 border-brand-300 bg-brand-50 hover:bg-brand-100"
          >
            <Gift className="h-3.5 w-3.5" />
            Offres exclusives
          </Button>
          <Link href="/dashboard">
            <Button variant="dark" size="sm" className="rounded-full px-5">
              {t('lp.nav.tryDemo')}
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden h-10 w-10 grid place-items-center rounded-xl text-ink-700 hover:bg-ink-100"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden absolute top-16 inset-x-0 bg-white border-b border-ink-100 shadow-card animate-fadeIn">
          <ul className="px-4 py-4 space-y-1">
            {items.map((it) => (
              <li key={it.href}>
                <a
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 text-sm font-semibold text-ink-800 rounded-lg hover:bg-ink-100/60"
                >
                  {it.label}
                </a>
              </li>
            ))}
            <li className="pt-3 mt-2 border-t border-ink-100 flex flex-col gap-2">
              <button
                onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink-700"
              >
                <Globe className="h-4 w-4 text-ink-500" />
                {locale === 'fr' ? 'English' : 'Français'}
              </button>
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-ink-700"
              >
                {t('lp.nav.signIn')}
              </Link>
              <Button
                onClick={() => { setOpen(false); setLeadOpen(true); }}
                variant="outline"
                className="w-full border-brand-300 bg-brand-50"
              >
                <Gift className="h-4 w-4" />
                Offres exclusives
              </Button>
              <Link href="/dashboard">
                <Button variant="dark" className="w-full">
                  {t('lp.nav.tryDemo')}
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      )}

      <LeadCaptureModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </header>
  );
}
