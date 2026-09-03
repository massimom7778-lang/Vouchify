'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button, ButtonLink, Eyebrow, Grid, Price } from '@/components/ui';
import { EVENTS, dollars, emit } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import {
  describeLine,
  hasPerUnitLinks,
  resolveLines,
  standCount,
  useCart,
  useCartReady,
} from '@/lib/cart';
import { coreProduct, getCatalogItem, orderBump } from '@/data/products';
import { site } from '@/data/site';

/** A field-specific message (see schemas.ts — an unparsable email, a review
 *  link with no scheme) already reads like a person wrote it for the customer
 *  who typed it, and is used untouched. A generic server error is a fact
 *  about our infrastructure, not the customer's mistake — "Payments are not
 *  configured on this deployment yet." should never reach a buyer — so it is
 *  replaced with one honest line. Either way, none of these three call sites
 *  used to offer a way to still get the order in, so every path ends with one
 *  now. */
const knownCustomerSafeErrors = new Set(['The cart is empty.']);

function checkoutErrorMessage(fieldMessage: string | undefined, serverError?: string): string {
  const headline =
    fieldMessage ??
    (serverError && knownCustomerSafeErrors.has(serverError) ? serverError : 'Checkout could not start.');
  return `${headline} If this keeps happening, email ${site.supportEmail} and we will take the order by hand.`;
}

export function CheckoutForm() {
  const lines = useCart((s) => s.lines);
  const reviewLink = useCart((s) => s.reviewLink);
  const setReviewLink = useCart((s) => s.setReviewLink);
  const ready = useCartReady();

  const [bump, setBump] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'starting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const bumpItem = getCatalogItem(orderBump.sku);
  const bumpPrice = bumpItem?.bumpPriceCents ?? 0;
  // The bump offers the same SKU at a discount, so it makes no sense once
  // the customer has already added it at full price.
  const bumpAlreadyInCart = lines.some((line) => line.sku === orderBump.sku);

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
    emit(EVENTS.bumpShown, { sku: orderBump.sku });
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
  // The bump is priced at bumpPrice here, not the full catalog price — this
  // is the one figure the free-shipping hint below must also use. Passing a
  // synthetic full-price cart line into shippingState() (the old approach)
  // overstated the subtotal by the bump's discount, so for a subtotal in the
  // resulting gap that inflated total falsely cleared the free-shipping
  // threshold: the hint disappeared while shippingAmount, computed correctly
  // from this same withBump, was still charging the flat fee — with nothing
  // on the page explaining why.
  const withBump = itemsTotal + (bump ? bumpPrice : 0);
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
          // From `resolved`, not the raw `lines` state: a cart saved before a
          // catalog change (a retired or renamed SKU sitting in localStorage)
          // resolves to nothing and is already invisible in the order list
          // above, but the raw `lines` array still carried it to the server,
          // which correctly rejected the whole request over one phantom line
          // the customer could not even see, let alone remove.
          lines: resolved.map(({ line }) => ({
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
      const result: {
        ok?: boolean;
        url?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      } = await response.json();
      if (!response.ok || !result.ok || !result.url) {
        // A field failure (an unparsable email, a review link with no
        // scheme) has a specific, actionable message from the server —
        // "That cart could not be read" told a customer with a genuine typo
        // that the whole cart was broken. Prefer whichever field actually
        // failed; email and reviewLink are the only ones this form collects
        // input for, `lines` covers a stale/tampered cart.
        const fieldMessage =
          result.fieldErrors?.email ??
          result.fieldErrors?.reviewLink ??
          result.fieldErrors?.lines ??
          Object.values(result.fieldErrors ?? {})[0];
        setError(checkoutErrorMessage(fieldMessage, result.error));
        setStatus('error');
        return;
      }
      window.location.href = result.url;
    } catch {
      setError(checkoutErrorMessage('Checkout could not start. Check your connection and try again.'));
      setStatus('error');
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void startCheckout();
  }

  return (
    // A real <form>, submitted rather than clicked, so the browser actually
    // runs constraint validation on the type="url"/type="email" inputs below
    // before startCheckout ever fires — previously the pay control was an
    // onClick handler with no enclosing form, so a scheme-less review link
    // like "reyesbarbers.ca" sailed straight past the input's own validity
    // check and only the server-side rule (now added — see schemas.ts) ever
    // caught it.
    <form onSubmit={handleSubmit}>
      <Grid className="gap-y-10">
        <div className="col-span-4 md:col-span-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl">Your order</h2>
            <Link href="/cart" className="text-xs font-semibold underline underline-offset-4">
              Edit order
            </Link>
          </div>
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
            <p className="mt-1 text-right text-xs text-warm-600">All prices in CAD</p>

            {shippingAmount > 0 ? (
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
                        sku: orderBump.sku,
                        accepted: event.target.checked,
                      });
                    }}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#C9A961]"
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold">Add a {orderBump.bumpLabel}</span>
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
              type="submit"
              block
              size="lg"
              className="mt-6"
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
    </form>
  );
}
