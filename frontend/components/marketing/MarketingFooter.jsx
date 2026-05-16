'use client';
import Link from 'next/link';
import { Twitter, Linkedin, Instagram, Github } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';

export default function MarketingFooter() {
  const { t } = useI18n();

  const cols = [
    {
      heading: t('lp.footer.product'),
      links: [
        { label: t('nav.dashboard'),  href: '/dashboard'  },
        { label: t('nav.properties'), href: '/properties' },
        { label: t('nav.guides'),     href: '/guides'     },
        { label: t('nav.community'),  href: '/community'  },
      ],
    },
    {
      heading: t('lp.footer.company'),
      links: [
        { label: t('lp.footer.about'),    href: '#' },
        { label: t('lp.footer.careers'),  href: '#' },
        { label: t('lp.footer.contact'),  href: '#' },
        { label: t('lp.footer.blog'),     href: '#' },
      ],
    },
    {
      heading: t('lp.footer.resources'),
      links: [
        { label: t('lp.footer.help'),  href: '#' },
        { label: 'API',                href: '#' },
        { label: 'Status',             href: '#' },
      ],
    },
    {
      heading: t('lp.footer.legal'),
      links: [
        { label: t('lp.footer.privacy'), href: '#' },
        { label: t('lp.footer.terms'),   href: '#' },
        { label: 'Cookies',              href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-ink-900 text-ink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="text-white">
              <Logo />
            </div>
            <p className="mt-4 text-sm text-ink-400 max-w-xs">
              {t('lp.footer.tagline')}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center transition-colors"
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.heading}>
              <h4 className="text-xs font-bold tracking-[0.18em] uppercase text-white/70 mb-4">
                {c.heading}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-300 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ink-400">
          <p>{t('lp.footer.copyright')}</p>
          <p>Conçu à Port-Louis · Made for expats worldwide</p>
        </div>
      </div>
    </footer>
  );
}
