import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'OMEGA — Plateforme pour expatriés à Maurice',
  description:
    "OMEGA centralise tout ce dont les expatriés ont besoin à l'île Maurice : guides administratifs, communauté, immobilier premium.",
  applicationName: 'OMEGA',
  keywords: ['expatriés', 'Maurice', 'immobilier', 'visa', 'Grand Baie'],
};

export const viewport = {
  themeColor: '#06b6d4',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
