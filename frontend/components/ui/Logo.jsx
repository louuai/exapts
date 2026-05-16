'use client';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import SecretAdminLoginModal from '@/components/feature/SecretAdminLoginModal';

/**
 * OMEGA logo. Secret admin door: 5 clicks within 2 s opens the
 * SecretAdminLoginModal (regardless of where the logo is placed).
 */
export default function Logo({ className, compact = false, secret = true }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  function bumpCount(e) {
    if (!secret) return;
    // Don't count clicks while the modal is already open (the click came
    // from inside the modal and was already stopPropagation'd, but be safe)
    if (open) return;

    setCount((c) => {
      const next = c + 1;
      if (next >= 5) {
        // Block the parent <Link> from navigating on the 5th click
        e?.preventDefault?.();
        e?.stopPropagation?.();
        setOpen(true);
        return 0;
      }
      return next;
    });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCount(0), 2000);
  }

  return (
    <>
      <div
        className={cn('flex items-center gap-2 select-none', className)}
        onClick={bumpCount}
      >
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a7 7 0 0 1 7 7c0 4.5-4.5 8-7 11-2.5-3-7-6.5-7-11a7 7 0 0 1 7-7Z" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
        </span>
        {!compact && (
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold tracking-tight text-ink-900 text-lg">
              OMEGA
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-500 font-semibold">
              Expats · Mauritius
            </span>
          </div>
        )}
      </div>

      <SecretAdminLoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
