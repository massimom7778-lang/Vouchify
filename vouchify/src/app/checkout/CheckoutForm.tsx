'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink, Eyebrow, Grid, Price } from '@/components/ui';
import { EVENTS, dollars, emit } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import {
  describeLine,
  hasPerUnitLinks,
  resolveLines,
  shippingState,
  standCount,
  useCart,
  useCartReady,
} from '@/lib/cart';
import { coreProduct, getAddOn, orderBump } from '@/data/products';
import { site } from '@/data/site';

export function CheckoutForm() {
  const lines = useCart((s) => s.lines);
  const reviewLink = useCart((s) => s.reviewLink);
  const setReviewLink = useCart((s) => s.setReviewLink);
  const ready = useCartReady();

  const [bump, setBump] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'starting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const bumpItem = getAddOn(orderBump.addOnId);
  const bumpPrice = bumpItem?.bumpPriceCents ?? 0;
  // The bump offers the same SKU at a discount, so it makes no sense once
  // the customer has already added it at full price.
  const bumpAlreadyInCart = lines.some((line) => line.sku === orderBump.addOnId);

  // `bump_shown` has to be emitted from above the early returns below, because
  // a hook cannot sit after them. It re-derives the same condition the JSX uses
  // for the bump box and fires once per mount, so the toggle rate has a real
  // denominator — customers who could not see the offer are not counted against
  // it. The ref is what stops a keystroke in the email field re-firing it.
  const bumpTracked = useRef(false);
  useEffect(() => {
    if (bumpTracked.current || !ready) return;
    const visible = resolveLines(lines).length > 0 && Boolean(bumpItem) && !bumpAlreadyInCart;
    if (!visible) return;
    bumpTracked.current = true;
    emit(EVENTS.bumpShown, { sku: orderBump.addOnId });
  }, [ready, lines, bumpItem, bumpAlreadyInCart]);

  if (!ready) {
    return (
      <p className="py-16 text-base text-warm-600" aria-live="polite">
        Loading your order…
      </p>
    );
  }

  const resolved = resolveLines(lines);
  if (resolved.length === 0) {
    return (
      <div className="py-16">
        <h2 className="text-2xl">There is nothing to check out.</h2>
        <p className="mt-4 max-w-prose text-base text-warm-700">
          Add a bundle first, the 3-pack covers the counter, the pay terminal and the waiting area.
        </p>
        <ButtonLink href={`/products/${coreProduct.slug}`} size="lg" className="mt-8">
          Choose your bundle
        </ButtonLink>
      </div>
    );
  }

  const perUnitLinks = hasPerUnitLinks(lines);
  const itemsTotal = resolved.reduce((sum, line) => sum + line.totalCents, 0);
  const withBump = itemsTotal + (bump ? bumpPrice : 0);
  const shipping = shippingState(
    bump ? [...lines, { sku: orderBump.addOnId, qty: 1 }] : lines,
  );
  const shippingAmount = withBump >= site.freeShippingThresholdCents ? 0 : site.flatShippingCents;
  const total = withBump + shippingAmount;

  async function startCheckout() {
    setStatus('starting');
    setError(null);
    // Emitted before the request, not after: this measures the customer
    // choosing to pay, so a Stripe outage should show as begin_checkout without
    // a purchase rather than as no intent at all.
    emit(EVENTS.beginCheckout, { value: dollars(total), standCount: standCount(lines) });
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: lines.map((line) => ({
            sku: line.sku,
            qty: line.qty,
            color: line.color,
            linkMode: line.linkMode,
          })),
          bump,
          reviewLink: reviewLink || undefined,
          email: email || undefined,
        }),
      });
      const result: { ok?: boolean; url?: string; error?: string } = await response.json();
      if (!response.ok || !result.ok || !result.url) {
        setError(result.error ?? 'Checkout could not start.');
        setStatus('error');
        return;
      }
      window.location.href = result.url;
    } catch {
      setError('Checkout could not start. Check your connection and try again.');
      setStatus('error');
    }
  }

  return (
    <Grid className="gap-y-10">
      <div className="col-span-4 md:col-span-6">
        <h2 className="text-xl">Your order</h2>
        <ul className="mt-5 divide-y divide-warm-300 border-y border-warm-300">
          {resolved.map(({ key, line, item, totalCents }) => (
            <li key={key} className="flex items-baseline justify-between gap-4 py-4">
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.name}</span>
                <span className="block text-xs text-warm-600">
                  {line.qty > 1 ? `${line.qty} × ` : ''}
                  {describeLine(line, item)}
                </span>
              </span>
              <Price cents={totalCents} size="sm" display={false} />
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-1 gap-5">
          <label className="block">
            <span className="block text-sm font-semibold">Email for the receipt</span>
            <span className="mt-0.5 block text-xs text-warm-600">
              Optional here, Stripe will ask for it on the next screen either way.
            </span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="dana@reyesbarbers.ca"
              className="mt-2 h-11 w-full rounded-sm border border-warm-300 bg-warm-50 px-3 text-sm placeholder:text-warm-500"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold">
              {perUnitLinks ? 'Your main Google review link' : 'Your Google review link'}
            </span>
            <span className="mt-0.5 block text-xs text-warm-600">
              {perUnitLinks
                ? 'You picked a separate link per stand, we will email you for the rest, then label each box.'
                : 'Leave it blank and we will email you for it before programming.'}
            </span>
            <input
              type="url"
              inputMode="url"
              value={reviewLink}
              onChange={(event) => setReviewLink(event.target.value)}
              placeholder="https://g.page/r/..."
              className="mt-2 h-11 w-full rounded-sm border border-warm-300 bg-warm-50 px-3 text-sm placeholder:text-warm-500"
            />
          </label>
        </div>

        <p className="mt-6 text-xs text-warm-600">
          Card details are entered on Stripe’s payment page, not here. We never see them.
        </p>
      </div>

      <div className="col-span-4 md:col-span-5 md:col-start-8">
        <div className="rounded-md border border-warm-300 bg-warm-50 p-5 md:p-6">
          <Eyebrow>Summary</Eyebrow>

          <dl className="mt-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-warm-700">Items</dt>
              <dd>
                <Price cents={withBump} size="sm" display={false} />
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-warm-700">Shipping</dt>
              <dd data-numeric className="text-sm font-semibold">
                {shippingAmount === 0 ? 'Free' : formatMoney(shippingAmount)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-warm-300 pt-3">
              <dt className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                Total before tax
              </dt>
              <dd>
                <Price cents={total} size="md" />
              </dd>
            </div>
          </dl>

          {!shipping.qualifies ? (
            <p data-numeric className="mt-3 text-xs text-warm-600">
              {formatMoney(site.freeShippingThresholdCents - withBump)} more would make shipping free.
            </p>
          ) : null}

          {/* Order bump. One box, one sentence, a real before-and-after price. */}
          {bumpItem && !bumpAlreadyInCart ? (
            <div
              className={cn(
                'mt-6 rounded-md border-2 p-4',
                bump ? 'border-gold bg-gold-tint' : 'border-warm-400 bg-paper',
              )}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={bump}
                  onChange={(event) => {
                    setBump(event.target.checked);
                    emit(EVENTS.bumpToggled, {
                      sku: orderBump.addOnId,
                      accepted: event.target.checked,
                    });
                  }}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#C9A961]"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-semibold">Add a {bumpItem.name.toLowerCase()}</span>
                    <span data-numeric className="text-sm">
                      <span className="text-warm-600 line-through">
                        {formatMoney(bumpItem.priceCents, { compact: true })}
                      </span>{' '}
                      <span className="font-semibold text-gold-deep">
                        {formatMoney(bumpPrice, { compact: true })}
                      </span>
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-warm-700">{orderBump.copy}</span>
                </span>
              </label>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 rounded-sm border border-warm-300 bg-paper px-3 py-2 text-sm text-warm-700">
              {error}
            </p>
          ) : null}

          <Button
            block
            size="lg"
            className="mt-6"
            onClick={startCheckout}
            disabled={status === 'starting'}
          >
            {status === 'starting' ? 'Opening Stripe…' : 'Pay with Stripe'}
          </Button>

          <p className="mt-3 text-center text-xs text-warm-600">
            {site.shipping.processing} to program and pack.{' '}
            <Link href="/legal/returns" className="underline underline-offset-4">
              {site.returns.windowDays}-day returns
            </Link>
            .
          </p>
        </div>
      </div>
    </Grid>
  );
}
