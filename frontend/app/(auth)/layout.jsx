import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-6 sm:px-12 lg:px-16 py-8">
        <Link href="/dashboard"><Logo /></Link>
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-xs text-ink-500 text-center">© 2026 OMEGA — Expatriés Maurice</p>
      </div>

      {/* Right: visual */}
      <div className="hidden lg:block relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1583245177184-4ff7e26da7c6?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/80 via-ink-900/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <p className="text-xs uppercase tracking-[0.24em] font-bold text-brand-200">
            Île Maurice · Océan Indien
          </p>
          <h2 className="font-display font-extrabold text-3xl xl:text-4xl leading-tight mt-2 max-w-md">
            Tout pour réussir votre expatriation, en un seul endroit.
          </h2>
          <p className="mt-4 text-sm text-white/80 max-w-md">
            Guides experts, immobilier premium, communauté active de plus de
            12 000 expatriés vérifiés.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['1438761681033-6461ffad8d80', '1507003211169-0a1dd7228f2d', '1544005313-94ddf0286df2', '1500648767791-00dcc994a43e']
                .map((id) => (
                <img
                  key={id}
                  src={`https://images.unsplash.com/photo-${id}?w=64&q=80`}
                  alt=""
                  className="h-9 w-9 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <p className="text-sm font-semibold">+12 000 expatriés nous font confiance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
