import Link from 'next/link';
import { Badge, ButtonLink, Price } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatMoney, pluralize } from '@/lib/format';
import { coreProduct, standTiers, tierEconomics, UNIT_PRICE_CENTS } from '@/data/products';

function tierHref(id: string) {
  return `/products/${coreProduct.slug}?tier=${id}`;
}

function badgeTone(tone: 'popular' | 'value' | 'scale') {
  return tone === 'popular' ? 'popular' : tone === 'value' ? 'value' : 'scale';
}

/**
 * The price ladder as an actual table, because it is actual tabular data: five
 * rows, five comparable columns. Every saving is computed from the one-unit
 * price at render time, so the table cannot disagree with the product page.
 */
export function TierTable() {
  return (
    <>
      {/* Desktop: a dense spec table */}
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">
          Vouchify stand bundles, prices and per-unit savings
        </caption>
        <thead>
          <tr className="border-y border-warm-300">
            {['Stands', 'Price', 'Per stand', 'You save', 'What it covers', ''].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="py-3 pr-4 text-2xs font-semibold uppercase tracking-wide text-warm-600"
              >
                {heading || <span className="sr-only">Choose</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standTiers.map((tier) => {
            const economics = tierEconomics(tier);
            const highlight = tier.badge?.tone === 'popular';
            return (
              <tr
                key={tier.id}
                className={cn('border-b border-warm-300', highlight && 'bg-gold-tint')}
              >
                <th scope="row" className="py-5 pr-4 align-top">
                  <span className="flex flex-wrap items-center gap-2">
                    <span data-numeric className="font-display text-xl font-extrabold tracking-tight">
                      {tier.qty}
                    </span>
                    {tier.badge ? (
                      <Badge tone={badgeTone(tier.badge.tone)}>{tier.badge.label}</Badge>
                    ) : null}
                  </span>
                </th>
                <td className="py-5 pr-4 align-top">
                  <Price cents={tier.priceCents} size="md" />
                </td>
                <td data-numeric className="py-5 pr-4 align-top text-sm text-warm-700">
                  {formatMoney(economics.perUnitCents)}
                </td>
                <td className="py-5 pr-4 align-top text-sm">
                  {economics.savingsCents > 0 ? (
                    <span data-numeric className="font-semibold text-gold-deep">
                      {formatMoney(economics.savingsCents, { compact: true })} ({economics.savingsPercent}%)
                    </span>
                  ) : (
                    <span className="text-warm-500">—</span>
                  )}
                </td>
                <td className="max-w-[24ch] py-5 pr-4 align-top text-sm text-warm-700">
                  {tier.coverage}
                </td>
                <td className="py-5 align-top text-right">
                  <ButtonLink href={tierHref(tier.id)} variant={highlight ? 'primary' : 'outline'} size="sm">
                    Choose
                  </ButtonLink>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile: the same five rows as stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {standTiers.map((tier) => {
          const economics = tierEconomics(tier);
          const highlight = tier.badge?.tone === 'popular';
          return (
            <Link
              key={tier.id}
              href={tierHref(tier.id)}
              className={cn(
                'block rounded-md border p-4',
                highlight ? 'border-gold bg-gold-tint' : 'border-warm-300 bg-paper',
              )}
            >
              <span className="flex items-center gap-3">
                <span className="whitespace-nowrap font-display text-lg font-bold tracking-tight">
                  {tier.qty} {pluralize(tier.qty, 'stand')}
                </span>
                <span className="ml-auto shrink-0 text-right">
                  <Price cents={tier.priceCents} size="md" />
                  <span data-numeric className="mt-0.5 block text-xs text-warm-600">
                    {formatMoney(economics.perUnitCents)} each
                  </span>
                </span>
              </span>
              {tier.badge ? (
                <span className="mt-2 block">
                  <Badge tone={badgeTone(tier.badge.tone)}>{tier.badge.label}</Badge>
                </span>
              ) : null}
              <span className="mt-2 block text-xs text-warm-700">{tier.coverage}</span>
              {economics.savingsCents > 0 ? (
                <span data-numeric className="mt-1 block text-xs font-semibold text-gold-deep">
                  You save {formatMoney(economics.savingsCents, { compact: true })} ({economics.savingsPercent}%)
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <p data-numeric className="mt-4 text-xs text-warm-600">
        Savings are measured against buying the same number of stands one at a time at{' '}
        {formatMoney(UNIT_PRICE_CENTS, { compact: true })} each. There is no list price we discount from.
      </p>
    </>
  );
}
