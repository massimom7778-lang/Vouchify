'use client';

import Link from 'next/link';
import { Button, ButtonLink, Eyebrow, Grid, Price } from '@/components/ui';
import { formatMoney, pluralize } from '@/lib/format';
import {
  resolveLines,
  shippingCents,
  shippingState,
  standCount,
  subtotalCents,
  useCart,
  useCartReady,
} from '@/lib/cart';
import { coreProduct } from '@/data/products';
import { site } from '@/data/site';

export function CartContents() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const add = useCart((s) => s.add);
  const reviewLink = useCart((s) => s.reviewLink);
  const setReviewLink = useCart((s) => s.setReviewLink);
  const ready = useCartReady();

  if (!ready) {
    return (
      <p className="py-16 text-base text-warm-600" aria-live="polite">
        Loading your cart…
      </p>
    );
  }

  const resolved = resolveLines(lines);
  const subtotal = subtotalCents(lines);
  const shipping = shippingState(lines);
  const stands = standCount(lines);

  if (resolved.length === 0) {
    return (
      <div className="py-16">
        <h2 className="text-2xl md:text-3xl">Your cart is empty.</h2>
        <p className="mt-4 max-w-prose text-base text-warm-700">
          Most single-location shops start with three stands: counter, pay terminal, waiting area.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`/products/${coreProduct.slug}`} size="lg">
            Choose your bundle
          </ButtonLink>
          <ButtonLink href="/bundles" variant="outline" size="lg">
            Compare bundles
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <Grid className="gap-y-10">
      <div className="col-span-4 md:col-span-7">
        <ul className="divide-y divide-warm-300 border-y border-warm-300">
          {resolved.map(({ key, line, item, totalCents }) => {
            const perOrder = item.kind === 'add-on' && item.perOrder;
            return (
              <li key={key} className="flex gap-4 py-5 sm:gap-6">
                <span
                  aria-hidden="true"
                  className="h-20 w-20 shrink-0 rounded-sm border border-warm-300 bg-warm-200 sm:h-24 sm:w-24"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold tracking-tight">{item.name}</p>
                      <p className="mt-1 text-sm text-warm-700">
                        {line.color ? `${line.color === 'black' ? 'Black' : 'White'} · ` : ''}
                        {item.kind === 'stand-tier'
                          ? `${item.qty} ${pluralize(item.qty, 'stand')} per pack`
                          : item.shortLine}
                      </p>
                    </div>
                    <Price cents={totalCents} size="md" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {perOrder ? (
                      <span className="text-2xs uppercase tracking-wide text-warm-600">
                        Charged once per order
                      </span>
                    ) : (
                      <div className="inline-flex items-center rounded-sm border border-warm-300">
                        <button
                          type="button"
                          onClick={() => setQty(key, line.qty - 1)}
                          aria-label={`Remove one ${item.name}`}
                          className="grid h-10 w-10 cursor-pointer place-items-center text-lg leading-none text-warm-700 hover:bg-warm-200"
                        >
                          <span aria-hidden="true">−</span>
                        </button>
                        <span data-numeric className="w-10 text-center text-sm font-semibold">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(key, line.qty + 1)}
                          aria-label={`Add one ${item.name}`}
                          className="grid h-10 w-10 cursor-pointer place-items-center text-lg leading-none text-warm-700 hover:bg-warm-200"
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(key)}
                      className="cursor-pointer text-sm text-warm-600 underline decoration-warm-400 underline-offset-4 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <label className="block max-w-prose">
            <span className="block text-sm font-semibold">Your Google review link</span>
            <span className="mt-0.5 block text-xs text-warm-600">
              We program every chip to this before shipping. Leave it blank and we will email you for
              it after checkout.
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
      </div>

      <div className="col-span-4 md:col-span-4 md:col-start-9">
        <div className="rounded-md border border-warm-300 bg-warm-50 p-5 md:p-6">
          <Eyebrow>Summary</Eyebrow>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">
                {shipping.qualifies ? (
                  <span className="font-semibold text-signal-deep">Free shipping applied</span>
                ) : (
                  <>
                    <span data-numeric className="font-semibold">
                      {formatMoney(shipping.remainingCents)}
                    </span>{' '}
                    to free shipping
                  </>
                )}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-warm-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(shipping.progress * 100)}
              aria-label="Progress to free shipping"
            >
              <div
                className="h-full bg-signal transition-[width] duration-200"
                style={{ width: `${Math.round(shipping.progress * 100)}%` }}
              />
            </div>
            {shipping.suggestion ? (
              <button
                type="button"
                onClick={() => add(shipping.suggestion!.id)}
                className="mt-3 flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm border border-warm-300 bg-paper px-3 py-2 text-left hover:border-ink"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">
                    Add {shipping.suggestion.name.toLowerCase()} to close the gap
                  </span>
                  <span className="block text-2xs text-warm-600">{shipping.suggestion.shortLine}</span>
                </span>
                <Price cents={shipping.suggestion.priceCents} size="xs" display={false} />
              </button>
            ) : null}
          </div>

          <dl className="mt-6 space-y-2 border-t border-warm-300 pt-4">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-warm-700">Subtotal</dt>
              <dd>
                <Price cents={subtotal} size="sm" display={false} />
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-warm-700">Shipping</dt>
              <dd data-numeric className="text-sm font-semibold">
                {shipping.qualifies ? 'Free' : formatMoney(site.flatShippingCents)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-warm-300 pt-3">
              <dt className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                Total before tax
              </dt>
              <dd>
                <Price cents={subtotal + shippingCents(lines)} size="md" />
              </dd>
            </div>
          </dl>

          {stands >= site.multiLocationMinUnits ? (
            <p className="mt-4 rounded-sm border border-warm-300 bg-paper px-3 py-2 text-xs text-warm-700">
              {stands} stands is quote territory.{' '}
              <Link href="/multi-location" className="font-semibold text-signal-deep underline underline-offset-4">
                Ask for a multi-location price
              </Link>{' '}
              before you pay this.
            </p>
          ) : null}

          <ButtonLink href="/checkout" size="lg" block className="mt-6">
            Checkout
          </ButtonLink>
          <Button
            variant="quiet"
            size="sm"
            block
            className="mt-2"
            onClick={() => {
              window.location.href = `/products/${coreProduct.slug}`;
            }}
          >
            Keep shopping
          </Button>
        </div>
      </div>
    </Grid>
  );
}
