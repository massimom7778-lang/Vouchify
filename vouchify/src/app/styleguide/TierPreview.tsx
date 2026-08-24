'use client';

import { useState } from 'react';
import { AnimatedTotal, Badge, Button, Card, Price } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import {
  DEFAULT_TIER_ID,
  buyBoxAddOns,
  standTiers,
  tierEconomics,
  type AddOnId,
  type StandTierId,
} from '@/data/products';

/**
 * Not the finished buy box, a working preview of the tier engine so the visual
 * direction can be judged with real behaviour rather than a static mock.
 */
export function TierPreview() {
  const [tierId, setTierId] = useState<StandTierId>(DEFAULT_TIER_ID);
  const [picked, setPicked] = useState<Set<AddOnId>>(() => new Set());

  const tier = standTiers.find((t) => t.id === tierId) ?? standTiers[0]!;
  const addOnTotal = buyBoxAddOns
    .filter((a) => picked.has(a.id))
    .reduce((sum, a) => sum + a.priceCents, 0);
  const total = tier.priceCents + addOnTotal;

  function toggleAddOn(id: AddOnId) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card className="p-5 md:p-6">
      <fieldset className="border-0 p-0">
        <legend className="mb-4 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
          How many stands
        </legend>

        <div className="flex flex-col gap-2">
          {standTiers.map((t) => {
            const economics = tierEconomics(t);
            const selected = t.id === tierId;
            return (
              <label
                key={t.id}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-md border p-4',
                  selected
                    ? 'border-gold bg-gold-tint'
                    : 'border-warm-300 bg-paper hover:border-warm-500',
                )}
              >
                <input
                  type="radio"
                  name="styleguide-tier"
                  value={t.id}
                  checked={selected}
                  onChange={() => setTierId(t.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full border',
                    selected ? 'border-gold bg-gold' : 'border-warm-400 bg-paper',
                  )}
                >
                  {selected ? <span className="h-1.5 w-1.5 rounded-full bg-ink" /> : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-bold tracking-tight">{t.name}</span>
                    {t.badge ? (
                      <Badge tone={t.badge.tone === 'popular' ? 'popular' : t.badge.tone === 'value' ? 'value' : 'scale'}>
                        {t.badge.label}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-warm-600">
                    {economics.savingsCents > 0 ? (
                      <span className="font-semibold text-gold-deep" data-numeric>
                        You save {formatMoney(economics.savingsCents, { compact: true })} ({economics.savingsPercent}%)
                      </span>
                    ) : (
                      t.shortLine
                    )}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <Price cents={t.priceCents} size="md" />
                  <span className="mt-0.5 block text-xs text-warm-600" data-numeric>
                    {formatMoney(economics.perUnitCents)} each
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-0 p-0">
        <legend className="mb-3 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
          Add to the order
        </legend>
        <div className="divide-y divide-warm-300 border-y border-warm-300">
          {buyBoxAddOns.map((addOn) => (
            <label key={addOn.id} className="flex cursor-pointer items-center gap-3 py-3">
              <input
                type="checkbox"
                checked={picked.has(addOn.id)}
                onChange={() => toggleAddOn(addOn.id)}
                className="h-4 w-4 shrink-0 accent-[#C9A961]"
              />
              <span aria-hidden="true" className="h-10 w-10 shrink-0 rounded-sm border border-warm-300 bg-warm-200" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{addOn.name}</span>
                <span className="block text-xs text-warm-600">{addOn.shortLine}</span>
              </span>
              <Price cents={addOn.priceCents} size="sm" display={false} />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex items-baseline justify-between">
        <span className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
          Total
        </span>
        <AnimatedTotal cents={total} className="text-2xl" />
      </div>
      <Button block size="lg" className="mt-3">
        Add to cart
      </Button>
      <p className="mt-3 text-center text-xs text-warm-600">
        Free shipping over {formatMoney(7500, { compact: true })}. Programmed to your link before it ships.
      </p>
    </Card>
  );
}
