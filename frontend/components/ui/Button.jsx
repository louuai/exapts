'use client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 shadow-soft focus:ring-brand-300',
  secondary:
    'bg-white text-ink-900 border border-ink-200 hover:border-ink-300 hover:bg-ink-50 focus:ring-ink-200',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 focus:ring-ink-200',
  outline:
    'bg-transparent text-brand-700 border border-brand-300 hover:bg-brand-50 focus:ring-brand-200',
  dark:
    'bg-ink-900 text-white hover:bg-ink-800 focus:ring-ink-300 shadow-soft',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
        'focus:outline-none focus:ring-4',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
