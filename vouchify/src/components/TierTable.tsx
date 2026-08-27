import Link from 'next/link';
import { ButtonLink, Coverage, Price } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatMoney, pluralize } from '@/lib/format';
import { DEFAULT_TIER_ID, coreProduct, coveredPositions, standTiers, tierEconomics, UNIT_PRICE_CENTS } from '@/data/products';

function tierHref(id: string) {
  return `/products/${coreProduct.slug}?tier=${id}`;
}

/**
 * The price ladder as an actual table, because it is actual tabular data: five
 * rows, five comparable columns. Every saving is computed from the one-unit
 * price at render time, so the table cannot disagree with the product page.
 */
export function TierTable({ tone = 'paper' }: { tone?: 'paper' | 'ink' }) {
  const onInk = tone === 'ink';
  const rule = onInk ? 'border-warm-800' : 'border-warm-300';
  const divide = onInk ? 'divide-warm-800' : 'divide-warm-300';
  const head = onInk ? 'text-warm-500' : 'text-warm-600';
  const muted = onInk ? 'text-warm-400' : 'text-warm-700';
  const faint = onInk ? 'text-warm-600' : 'text-warm-500';
  const highlightRow = onInk ? 'bg-warm-900' : 'bg-gold-tint';
  const savings = onInk ? 'text-gold' : 'text-gold-deep';
  const cardBase = onInk ? 'border-warm-800 bg-warm-900' : 'border-warm-300 bg-paper';
  const cardHi = onInk ? 'border-gold bg-warm-900' : 'border-gold bg-gold-tint';

  return (
    <>
      {/* Desktop: a dense spec table */}
      <table className={cn('hidden w-full border-collapse text-left md:table', divide)}>
        <caption className="sr-only">
          Vouchify stand bundles, prices and per-unit savings
        </caption>
        <thead>
          <tr className={cn('border-y', rule)}>
            {['Stands', 'Price', 'Per stand', 'You save', 'What it covers', ''].map((heading) => (
              <th
                key={heading}
                scope="col"
                className={cn('py-3 pr-4 text-2xs font-semibold uppercase tracking-wide', head)}
              >
                {heading || <span className="sr-only">Choose</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standTiers.map((tier) => {
            const economics = tierEconomics(tier);
            const coverage = coveredPositions(tier);
            const highlight = tier.id === DEFAULT_TIER_ID;
            return (
              <tr
                key={tier.id}
                className={cn('border-b', rule, highlight && highlightRow)}
              >
                <th scope="row" className="py-5 pr-4 align-top">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      data-numeric
                      className={cn(
                        'font-display text-xl font-bold tracking-tight',
                        onInk && 'text-paper',
                      )}
                    >
                      {tier.qty}
                    </span>
                    {coverage ? <Coverage {...coverage} tone={onInk ? 'dark' : 'light'} /> : null}
                  </span>
                </th>
                <td className="py-5 pr-4 align-top">
                  <Price cents={tier.priceCents} size="md" tone={onInk ? 'onDark' : 'ink'} />
                </td>
                <td data-numeric className={cn('py-5 pr-4 align-top text-sm', muted)}>
                  {formatMoney(economics.perUnitCents)}
                </td>
                <td className="py-5 pr-4 align-top text-sm">
                  {economics.savingsCents > 0 ? (
                    <span data-numeric className={cn('font-semibold', savings)}>
                      {formatMoney(economics.savingsCents, { compact: true })} ({economics.savingsPercent}%)
                    </span>
                  ) : (
                    <span className={faint}>&middot;</span>
                  )}
                </td>
                <td className={cn('max-w-[24ch] py-5 pr-4 align-top text-sm', muted)}>
                  {tier.coverage}
                </td>
                <td className="py-5 align-top text-right">
                  <ButtonLink
                    href={tierHref(tier.id)}
                    variant={highlight ? 'primary' : onInk ? 'onDark' : 'outline'}
                    size="sm"
                  >
                    Choose
                  </ButtonLink>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile: the same rows as stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {standTiers.map((tier) => {
          const economics = tierEconomics(tier);
          const coverage = coveredPositions(tier);
          const highlight = tier.id === DEFAULT_TIER_ID;
          return (
            <Link
              key={tier.id}
              href={tierHref(tier.id)}
              className={cn(
                'block rounded-md border p-4',
                highlight ? cardHi : cardBase,
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    'whitespace-nowrap font-display text-lg font-bold tracking-tight',
                    onInk && 'text-paper',
                  )}
                >
                  {tier.qty} {pluralize(tier.qty, 'stand')}
                </span>
                <span className="ml-auto shrink-0 text-right">
                  <Price cents={tier.priceCents} size="md" tone={onInk ? 'onDark' : 'ink'} />
                  <span data-numeric className={cn('mt-0.5 block text-xs', head)}>
                    {formatMoney(economics.perUnitCents)} each
                  </span>
                </span>
              </span>
              {coverage ? (
                <span className="mt-2 block">
                  <Coverage {...coverage} tone={onInk ? 'dark' : 'light'} />
                </span>
              ) : null}
              <span className={cn('mt-2 block text-xs', muted)}>{tier.coverage}</span>
              {economics.savingsCents > 0 ? (
                <span data-numeric className={cn('mt-1 block text-xs font-semibold', savings)}>
                  You save {formatMoney(economics.savingsCents, { compact: true })} ({economics.savingsPercent}%)
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <p data-numeric className={cn('mt-4 text-xs', head)}>
        Savings are measured against buying the same number of stands one at a time at{' '}
        {formatMoney(UNIT_PRICE_CENTS, { compact: true })} each. There is no list price we discount from.
      </p>
    </>
  );
}
