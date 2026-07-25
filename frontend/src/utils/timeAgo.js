import { toBanglaDigits } from './banglaDigits';

/**
 * Formats a date into a Bangla relative time string like "২ ঘণ্টা আগে".
 * Falls back to a localized date string for anything older than a week.
 */
export const timeAgoBn = (dateInput) => {
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const units = [
    { limit: 60, label: 'সেকেন্ড' },
    { limit: 3600, label: 'মিনিট', divisor: 60 },
    { limit: 86400, label: 'ঘণ্টা', divisor: 3600 },
    { limit: 604800, label: 'দিন', divisor: 86400 },
  ];

  if (seconds < 10) return 'এইমাত্র';

  for (const unit of units) {
    if (seconds < unit.limit) {
      const value = Math.floor(seconds / (unit.divisor || 1));
      return `${toBanglaDigits(value)} ${unit.label} আগে`;
    }
  }

  return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
};
