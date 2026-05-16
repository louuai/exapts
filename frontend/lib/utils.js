import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount, currency = 'EUR', locale = 'fr-FR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(iso, locale = 'fr-FR') {
  const date = new Date(iso);
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const steps = [
    [60, 'second'],
    [3600, 'minute', 60],
    [86400, 'hour', 3600],
    [604800, 'day', 86400],
    [2592000, 'week', 604800],
    [31536000, 'month', 2592000],
    [Infinity, 'year', 31536000],
  ];
  for (const [limit, unit, div] of steps) {
    if (diffSec < limit) {
      const value = Math.round(-diffSec / (div || 1));
      return rtf.format(value, unit);
    }
  }
}

export function formatDate(iso, locale = 'fr-FR') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}
