'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Modal rendered through a React portal to document.body.
 * Two reasons this matters:
 *  1) Decouples the modal from any parent stacking context / overflow.
 *  2) Crucial bugfix: when a Modal is declared inside a wrapping <Link>,
 *     clicks inside the modal bubble up to the <a>. Next.js's <Link>
 *     calls e.preventDefault() on those clicks, which silently kills
 *     <button type="submit"> form submissions. The portal + the
 *     stopPropagation guards below make the modal fully click-isolated.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  // Belt-and-braces: stop any pointer event inside the modal root from
  // bubbling up through React's synthetic event tree.
  const stop = (e) => e.stopPropagation();

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50"
          onClick={stop}
          onMouseDown={stop}
          onMouseUp={stop}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
          />
          <div className="relative h-full w-full grid place-items-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={stop}
              className={cn(
                'relative w-full bg-white rounded-3xl border border-ink-100 shadow-card overflow-hidden pointer-events-auto',
                maxWidth
              )}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                aria-label="Fermer"
                className="absolute top-3 right-3 h-9 w-9 rounded-xl text-ink-500 hover:bg-ink-100 grid place-items-center z-10"
              >
                <X className="h-4 w-4" />
              </button>
              {(title || subtitle) && (
                <div className="px-6 pt-6 pb-2">
                  {title && (
                    <h2 className="font-display font-extrabold text-xl text-ink-900 pr-12">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-ink-600 mt-1">{subtitle}</p>
                  )}
                </div>
              )}
              <div className={cn('overflow-y-auto max-h-[calc(100vh-200px)]', title || subtitle ? 'px-6 pb-6' : 'p-6')}>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
