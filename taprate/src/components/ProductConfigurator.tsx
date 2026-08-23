'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ShopPlan } from '@/components/ShopPlan';
import { AnimatedTotal, Badge, Button, Eyebrow, Grid, PhotoBlock, Price } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatMoney, pluralize } from '@/lib/format';
import { useCart, type StandColor } from '@/lib/cart';
import {
  DEFAULT_TIER_ID,
  buyBoxAddOns,
  coreProduct,
  orderOptions,
  standTiers,
  tierEconomics,
  type AddOn,
  type AddOnId,
  type StandTier,
  type StandTierId,
} from '@/data/products';
import { site } from '@/data/site';

/* -------------------------------------------------------------------------- */

function TierRow({
  tier,
  selected,
  onSelect,
}: {
  tier: StandTier;
  selected: boolean;
  onSelect: () => void;
}) {
  const economics = tierEconomics(tier);
  return (
    // Two rows rather than three columns: at 375px a narrow middle column made
    // the reasoning wrap to three lines while the price column sat half empty.
    <label
      className={cn(
        'block cursor-pointer rounded-md border p-4',
        selected ? 'border-signal bg-signal-tint' : 'border-warm-300 bg-paper hover:border-warm-500',
      )}
    >
      <input
        type="radio"
        name="stand-tier"
        value={tier.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      {/* Line 1 is always [select] [quantity] ... [price]. The badge sits with
          the reasoning on line 2 so that "10 stands / For multi-location / $249"
          cannot overflow a 375px row. */}
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'grid h-5 w-5 shrink-0 place-items-center rounded-full border',
            selected ? 'border-signal bg-signal' : 'border-warm-400 bg-paper',
          )}
        >
          {selected ? <span className="h-1.5 w-1.5 rounded-full bg-ink" /> : null}
        </span>
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

      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 pl-8">
        {tier.badge ? (
          <Badge tone={tier.badge.tone === 'popular' ? 'popular' : tier.badge.tone === 'value' ? 'value' : 'scale'}>
            {tier.badge.label}
          </Badge>
        ) : null}
        <span className="min-w-0 text-xs text-warm-700">{tier.coverage}</span>
        {economics.savingsCents > 0 ? (
          <span data-numeric className="basis-full text-xs font-semibold text-signal-deep">
            You save {formatMoney(economics.savingsCents, { compact: true })} ({economics.savingsPercent}%)
          </span>
        ) : null}
      </span>
    </label>
  );
}

function AddOnRow({
  addOn,
  checked,
  onToggle,
}: {
  addOn: AddOn;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 accent-[#FF4D14]"
      />
      <span
        aria-hidden="true"
        className="h-11 w-11 shrink-0 rounded-sm border border-warm-300 bg-warm-200"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{addOn.name}</span>
        <span className="block text-xs text-warm-600">{addOn.shortLine}</span>
      </span>
      <Price cents={addOn.priceCents} size="sm" display={false} />
    </label>
  );
}

function OptionRow({
  addOn,
  checked,
  onToggle,
}: {
  addOn: AddOn;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 accent-[#FF4D14]"
      />
      <span className="min-w-0 flex-1">
        <span className="text-sm font-medium">{addOn.name}</span>
        <span className="ml-2 text-xs text-warm-600">{addOn.shortLine}</span>
      </span>
      <Price cents={addOn.priceCents} size="xs" display={false} />
    </label>
  );
}

/* -------------------------------------------------------------------------- */

export function ProductConfigurator({ initialTierId }: { initialTierId?: string }) {
  const startingTier =
    standTiers.find((tier) => tier.id === initialTierId)?.id ?? DEFAULT_TIER_ID;

  const [tierId, setTierId] = useState<StandTierId>(startingTier);
  const [color, setColor] = useState<StandColor>('black');
  const [picked, setPicked] = useState<Set<AddOnId>>(() => new Set());
  const [barVisible, setBarVisible] = useState(false);

  const add = useCart((s) => s.add);
  const buyButtonRef = useRef<HTMLDivElement>(null);

  const tier = standTiers.find((t) => t.id === tierId) ?? standTiers[0]!;
  const economics = tierEconomics(tier);

  const selectedAddOns = useMemo(
    () => [...buyBoxAddOns, ...orderOptions].filter((addOn) => picked.has(addOn.id)),
    [picked],
  );
  const total = selectedAddOns.reduce((sum, addOn) => sum + addOn.priceCents, tier.priceCents);

  // The sticky bar appears only once the real Add to cart button has scrolled
  // away, so it never sits on top of the control it duplicates.
  useEffect(() => {
    const el = buyButtonRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setBarVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function toggle(id: AddOnId) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addToCart() {
    add(tier.id, 1, color);
    for (const addOn of selectedAddOns) add(addOn.id, 1);
  }

  return (
    <>
      <Grid className="gap-y-10">
        {/* Header block, spanning the grid asymmetrically */}
        <div className="col-span-4 md:col-span-7">
          <Eyebrow>The Stand</Eyebrow>
          <h1 className="mt-4 text-2xl md:text-3xl">{coreProduct.headline}</h1>
        </div>
        <div className="col-span-4 self-end md:col-span-4 md:col-start-9">
          <p className="text-base text-warm-700">{coreProduct.summary}</p>
        </div>

        {/* Gallery */}
        <div className="col-span-4 md:col-span-7">
          <PhotoBlock photo={coreProduct.photos.hero} vignette />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <PhotoBlock photo={coreProduct.photos.pair} />
            <PhotoBlock photo={coreProduct.photos.inHand} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 border-t border-warm-300 sm:grid-cols-3">
            {coreProduct.specs.map((spec) => (
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
                  {tier.qty} {pluralize(tier.qty, 'stand')}, {color === 'black' ? 'black' : 'white'}
                </p>
              </div>
              <div className="text-right">
                <AnimatedTotal cents={total} className="text-xl" />
                <p data-numeric className="text-xs text-warm-600">
                  {formatMoney(economics.perUnitCents)} per stand
                </p>
              </div>
            </div>

            {/* Colour */}
            <fieldset className="mt-6 border-0 p-0">
              <legend className="mb-2 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                Colour
              </legend>
              <div className="flex gap-2">
                {coreProduct.colors.map((option) => {
                  const active = color === option.id;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        'flex flex-1 cursor-pointer items-center gap-2 rounded-sm border px-3 py-2',
                        active ? 'border-ink bg-paper' : 'border-warm-300 bg-paper hover:border-warm-500',
                      )}
                    >
                      <input
                        type="radio"
                        name="stand-color"
                        value={option.id}
                        checked={active}
                        onChange={() => setColor(option.id as StandColor)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-full border border-warm-400"
                        style={{ backgroundColor: option.swatch }}
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Tiers */}
            <fieldset className="mt-6 border-0 p-0">
              <legend className="mb-3 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                How many
              </legend>
              <div className="flex flex-col gap-2">
                {standTiers.map((t) => (
                  <TierRow
                    key={t.id}
                    tier={t}
                    selected={t.id === tierId}
                    onSelect={() => setTierId(t.id)}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-warm-600">{tier.rationale}</p>
            </fieldset>

            {/* Add-ons */}
            <fieldset className="mt-6 border-0 p-0">
              <legend className="mb-1 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                Add to the order
              </legend>
              <div className="divide-y divide-warm-300 border-y border-warm-300">
                {buyBoxAddOns.map((addOn) => (
                  <AddOnRow
                    key={addOn.id}
                    addOn={addOn}
                    checked={picked.has(addOn.id)}
                    onToggle={() => toggle(addOn.id)}
                  />
                ))}
              </div>
              <div className="divide-y divide-warm-300">
                {orderOptions.map((addOn) => (
                  <OptionRow
                    key={addOn.id}
                    addOn={addOn}
                    checked={picked.has(addOn.id)}
                    onToggle={() => toggle(addOn.id)}
                  />
                ))}
              </div>
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
                  Free shipping over {formatMoney(site.freeShippingThresholdCents, { compact: true })} — this order{' '}
                  {total >= site.freeShippingThresholdCents ? 'qualifies' : 'does not yet'}
                </li>
                <li>{site.shipping.processing} to program and pack, tested on iPhone and Android</li>
                <li>Link changes are free, for as long as you own the stand</li>
              </ul>
            </div>
          </div>
        </div>
      </Grid>

      {/* The shop plan: the tier selector, restated as floor coverage. */}
      <div className="mt-16 border-t border-warm-300 pt-12 md:mt-24 md:pt-16">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>Coverage</Eyebrow>
            <h2 className="mt-3 text-xl md:text-2xl">
              {tier.qty} {pluralize(tier.qty, 'stand')} {tier.qty === 1 ? 'covers' : 'cover'} this much of
              your floor.
            </h2>
            <p className="mt-4 text-base text-warm-700">
              Placements are numbered in the order they earn their keep. Position 1 catches everyone
              who pays. By position 5 you are catching the people who never walk past the counter at
              all — the ones sitting in a chair, or paying at the table.
            </p>
            <p className="mt-4 text-sm text-warm-600">
              Change the quantity above and the plan follows.
            </p>
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <ShopPlan count={tier.qty} />
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
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-2xs uppercase tracking-wide text-warm-600">
              {tier.qty} {pluralize(tier.qty, 'stand')}
              {selectedAddOns.length > 0
                ? ` + ${selectedAddOns.length} ${pluralize(selectedAddOns.length, 'extra')}`
                : ''}
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
