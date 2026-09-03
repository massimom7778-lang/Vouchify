import { site } from '@/data/site';

const moneyFormatter = new Intl.NumberFormat(site.locale, {
  style: 'currency',
  currency: site.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeMoneyFormatter = new Intl.NumberFormat(site.locale, {
  style: 'currency',
  currency: site.currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Cents in, display string out. The data layer never holds a formatted price.
 * `compact` drops `.00` on round amounts, which is how the tier table reads.
 */
export function formatMoney(cents: number, options?: { compact?: boolean }): string {
  const compact = options?.compact ?? false;
  const dollars = cents / 100;
  if (compact && cents % 100 === 0) return wholeMoneyFormatter.format(dollars);
  return moneyFormatter.format(dollars);
}

/** Price strings for JSON-LD, which wants a bare decimal and no currency symbol. */
export function priceForSchema(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * "3 stands", "2 plates", "3 stands and 2 plates", or "nothing to encode".
 *
 * The one place this sentence is built, so the confirmation email, the
 * owner's dashboard, and the fulfillment packing list can never drift into
 * describing the same order three different ways.
 */
export function describeCounts(standCount: number, plateCount: number): string {
  const parts: string[] = [];
  if (standCount > 0) parts.push(`${standCount} ${pluralize(standCount, 'stand')}`);
  if (plateCount > 0) parts.push(`${plateCount} ${pluralize(plateCount, 'plate')}`);
  return parts.length ? parts.join(' and ') : 'nothing to encode';
}
