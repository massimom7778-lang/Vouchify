'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PlatePlanBoard } from '@/components/ShopPlan';
import { AnimatedTotal, Button, Coverage, Eyebrow, Grid, PhotoBlock, Price } from '@/components/ui';
import { EVENTS, dollars, emit } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { formatMoney, pluralize } from '@/lib/format';
import { useCart } from '@/lib/cart';
import {
  DEFAULT_PLATE_TIER_ID,
  PLATE_UNIT_PRICE_CENTS,
  coreProduct,
  coveredPositions,
  getPlateTier,
  orderBump,
  plateProduct,
  platePlacements,
  plateTiers,
  tierEconomics,
  type PlateTier,
  type PlateTierId,
} from '@/data/products';
import { site } from '@/data/site';

/* -------------------------------------------------------------------------- */

function TierRow({
  tier,
  selected,
  onSelect,
}: {
  tier: PlateTier;
  selected: boolean;
  onSelect: () => void;
}) {
  const economics = tierEconomics(tier, PLATE_UNIT_PRICE_CENTS);
  const coverage = coveredPositions(tier, platePlacements);
  return (
    <label
      className={cn(
        'block cursor-pointer rounded-md border p-4',
        selected ? 'border-gold bg-gold-tint' : 'border-warm-300 bg-paper hover:border-warm-500',
      )}
    >
      <input
        type="radio"
        name="plate-tier"
        value={tier.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'grid h-5 w-5 shrink-0 place-items-center rounded-full border',
            selected ? 'border-gold bg-gold' : 'border-warm-400 bg-paper',
          )}
        >
          {selected ? <span className="h-1.5 w-1.5 rounded-full bg-ink" /> : null}
        </span>
        <span className="whitespace-nowrap font-display text-lg font-bold tracking-tight">
          {tier.qty} {pluralize(tier.qty, 'plate')}
        </span>
        <span className="ml-auto shrink-0 text-right">
          <Price cents={tier.priceCents} size="md" />
          <span data-numeric className="mt-0.5 block text-xs text-warm-600">
            {formatMoney(economics.perUnitCents)} each
          </span>
        </span>
      </span>

      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 pl-8">
        {coverage ? <Coverage {...coverage} /> : null}
        <span className="min-w-0 text-xs text-warm-700">{tier.coverage}</span>
        {economics.savingsCents > 0 ? (
          <span data-numeric className="basis-full text-xs font-semibold text-gold-deep">
            You save {formatMoney(economics.savingsCents, { compact: true })} ({economics.savingsPercent}%)
          </span>
        ) : null}
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */

export function PlateConfigurator({ initialTierId }: { initialTierId?: string }) {
  const startingTier =
    plateTiers.find((tier) => tier.id === initialTierId)?.id ?? DEFAULT_PLATE_TIER_ID;

  const [tierId, setTierId] = useState<PlateTierId>(startingTier);
  const [barVisible, setBarVisible] = useState(false);

  const add = useCart((s) => s.add);
  const buyButtonRef = useRef<HTMLDivElement>(null);

  const tier = plateTiers.find((t) => t.id === tierId) ?? plateTiers[0]!;
  const economics = tierEconomics(tier, PLATE_UNIT_PRICE_CENTS);
  const total = tier.priceCents;

  // The checkout order bump discounts one plate for a customer also buying a
  // stand — shown here as the reason to buy alongside a stand order instead
  // of on its own, the same discount the checkout bump actually charges.
  const bumpTier = getPlateTier(orderBump.sku);

  // The sticky bar appears only once the real Add to cart button has scrolled
  // away, so it never sits on top of the control it duplicates.
  useEffect(() => {
    const el = buyButtonRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function addToCart() {
    // One pack, one line: buying more plates means picking a bigger tier,
    // the same way a stand pack works — there is no free-quantity stepper.
    add(tier.id, 1);
    emit(EVENTS.addToCart, { sku: tier.id, qty: 1, value: dollars(tier.priceCents) });
  }

  return (
    <>
      <Grid className="gap-y-10">
        {/* Header block, spanning the grid asymmetrically */}
        <div className="col-span-4 md:col-span-7">
          <Eyebrow>The Plate</Eyebrow>
          <h1 className="mt-4 text-2xl md:text-3xl">{plateProduct.headline}</h1>
        </div>
        <div className="col-span-4 self-end md:col-span-4 md:col-start-9">
          <p className="text-base text-warm-700">{plateProduct.summary}</p>
        </div>

        {/* Gallery */}
        <div className="col-span-4 md:col-span-7">
          <PhotoBlock photo={plateProduct.photos.hero} vignette priority />
          <PhotoBlock photo={plateProduct.photos.phoneTap} className="mt-4" />

          <dl className="mt-8 grid grid-cols-2 gap-x-6 border-t border-warm-300 sm:grid-cols-3">
            {plateProduct.specs.map((spec) => (
              <div key={spec.label} className="border-b border-warm-300 py-3">
                <dt className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
                  {spec.label}
                </dt>
                <dd className="mt-1 text-sm">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Buy box */}
        <div className="col-span-4 md:col-span-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-warm-300 bg-warm-50 p-5 md:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <Eyebrow>Selected</Eyebrow>
                <p className="mt-1 font-display text-lg font-bold tracking-tight">
                  {tier.qty} {pluralize(tier.qty, 'plate')}
                </p>
              </div>
              <div className="text-right">
                <AnimatedTotal cents={total} className="text-xl" />
                <p data-numeric className="text-xs text-warm-600">
                  {formatMoney(economics.perUnitCents)} per plate
                </p>
              </div>
            </div>

            {/* Tiers */}
            <fieldset className="mt-6 border-0 p-0">
              <legend className="mb-3 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                How many
              </legend>
              <div className="flex flex-col gap-2">
                {plateTiers.map((t) => (
                  <TierRow
                    key={t.id}
                    tier={t}
                    selected={t.id === tierId}
                    onSelect={() => {
                      if (t.id === tierId) return; // re-clicking the current tier is not a choice
                      setTierId(t.id);
                      emit(EVENTS.tierSelected, { tierId: t.id });
                    }}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-warm-600">{tier.rationale}</p>
            </fieldset>

            <div ref={buyButtonRef} className="mt-6">
              <div className="flex items-baseline justify-between">
                <span className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                  Total
                </span>
                <AnimatedTotal cents={total} className="text-2xl" />
              </div>
              <Button block size="lg" className="mt-3" onClick={addToCart}>
                Add to cart
              </Button>
              <ul className="mt-4 space-y-1.5 text-xs text-warm-700">
                <li data-numeric>
                  Free shipping over {formatMoney(site.freeShippingThresholdCents, { compact: true })}, this order{' '}
                  {total >= site.freeShippingThresholdCents ? 'qualifies' : 'does not yet'}
                </li>
                <li>{site.shipping.processing} to program and pack, tested on iPhone and Android</li>
                <li>Link changes are free, for as long as you own the plate</li>
              </ul>
            </div>

            {/* The other, real way to buy this: alongside a stand order, where
                it is a genuine bundle discount rather than a marketing label —
                the same price the checkout order bump actually charges. */}
            {bumpTier?.bumpPriceCents !== undefined ? (
              <div className="mt-6 rounded-md border border-gold bg-gold-tint p-4">
                <p className="text-sm font-semibold text-ink">Also buying a stand?</p>
                <p className="mt-1 text-sm text-warm-700">
                  Add one review plate at checkout alongside any stand order and it drops from{' '}
                  {formatMoney(bumpTier.priceCents, { compact: true })} to{' '}
                  <span className="font-semibold">
                    {formatMoney(bumpTier.bumpPriceCents, { compact: true })}
                  </span>
                  . Same plate, same link, one order.
                </p>
                <Link
                  href={`/products/${coreProduct.slug}`}
                  className="mt-2 inline-block text-sm font-semibold text-gold-deep underline underline-offset-4"
                >
                  Shop stands
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </Grid>

      {/* The storefront plan: the tier selector, restated as placement coverage. */}
      <div className="mt-16 border-t border-warm-300 pt-12 md:mt-24 md:pt-16">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>Coverage</Eyebrow>
            <h2 className="mt-3 text-xl md:text-2xl">
              {tier.qty} {pluralize(tier.qty, 'plate')} {tier.qty === 1 ? 'covers' : 'cover'} this much of
              your storefront.
            </h2>
            <p className="mt-4 text-base text-warm-700">
              Placements are numbered in the order they earn their keep. Position 1 is the window,
              read by everyone deciding whether to walk in. By position 5 you are catching the door on
              the way out, the register, the menu, and the table.
            </p>
            <p className="mt-4 text-base text-warm-700">
              Each plate counts its own taps, so after a fortnight you can see which surface is doing
              the work and move the quiet one. The count is per plate and nothing else, no cookie on
              the customer’s phone, nothing that identifies them.
            </p>
            <p className="mt-4 text-sm text-warm-600">
              Change the quantity above and the plan follows.
            </p>
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <PlatePlanBoard count={tier.qty} />
          </div>
        </Grid>
      </div>

      {/* Sticky mobile buy bar */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-warm-300 bg-paper lg:hidden',
          barVisible ? 'block' : 'hidden',
        )}
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-2xs uppercase tracking-wide text-warm-600">
              {tier.qty} {pluralize(tier.qty, 'plate')}
            </p>
            <AnimatedTotal cents={total} className="text-xl" />
          </div>
          <Button size="lg" onClick={addToCart} className="shrink-0">
            Add to cart
          </Button>
        </div>
      </div>
    </>
  );
}
