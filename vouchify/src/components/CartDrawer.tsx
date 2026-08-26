'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import { Button, ButtonLink, Price } from '@/components/ui';
import { EVENTS, dollars, emit } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { formatMoney, pluralize } from '@/lib/format';
import {
  describeLine,
  hasPerUnitLinks,
  itemCount,
  lineKey,
  resolveLines,
  shippingState,
  standCount,
  subtotalCents,
  useCart,
  useCartReady,
} from '@/lib/cart';
import { coreProduct } from '@/data/products';
import { site } from '@/data/site';

function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-sm border border-warm-300">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label={`Remove one ${label}`}
        className="grid h-9 w-9 cursor-pointer place-items-center text-lg leading-none text-warm-700 hover:bg-warm-200"
      >
        <span aria-hidden="true">−</span>
      </button>
      <span data-numeric className="w-8 text-center text-sm font-semibold">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Add one ${label}`}
        className="grid h-9 w-9 cursor-pointer place-items-center text-lg leading-none text-warm-700 hover:bg-warm-200"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}

export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const add = useCart((s) => s.add);
  const reviewLink = useCart((s) => s.reviewLink);
  const setReviewLink = useCart((s) => s.setReviewLink);
  const ready = useCartReady();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => closeDrawer(), [closeDrawer]);

  // One event per opening, on the closed -> open edge. The drawer stays mounted
  // and merely hidden, so without the ref every re-render while it is open —
  // a quantity step, a review link keystroke — would count as another opening.
  // It waits for `ready` so the counts describe the rehydrated cart rather
  // than the empty one the first client render starts from.
  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (wasOpen.current || !ready) return;
    wasOpen.current = true;
    emit(EVENTS.cartOpened, {
      itemCount: itemCount(lines),
      subtotal: dollars(subtotalCents(lines)),
    });
  }, [open, ready, lines]);

  // Focus trap, escape to close, scroll lock, focus restored on the way out.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function focusables(): HTMLElement[] {
      if (!panel) return [];
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open, close]);

  const resolved = ready ? resolveLines(lines) : [];
  const subtotal = ready ? subtotalCents(lines) : 0;
  const stands = ready ? standCount(lines) : 0;
  const shipping = shippingState(ready ? lines : []);
  const empty = resolved.length === 0;
  const perUnitLinks = ready && hasPerUnitLinks(lines);

  return (
    <div
      className={cn('fixed inset-0 z-50', open ? 'block' : 'pointer-events-none hidden')}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col border-l border-warm-300 bg-paper"
      >
        <div className="flex items-center justify-between border-b border-warm-300 px-5 py-4">
          <h2 className="text-lg md:text-lg">
            Cart
            {stands > 0 ? (
              <span className="ml-2 font-sans text-xs font-medium text-warm-600" data-numeric>
                {stands} {pluralize(stands, 'stand')}
              </span>
            ) : null}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border border-warm-300 text-warm-700 hover:bg-warm-200"
          >
            <span className="sr-only">Close cart</span>
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Free shipping progress. Real dollars, real threshold, no fake urgency. */}
        {!empty ? (
          <div className="border-b border-warm-300 px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium">
                {shipping.qualifies ? (
                  <span className="font-semibold text-gold-deep">Free shipping applied</span>
                ) : (
                  <>
                    <span data-numeric className="font-semibold">
                      {formatMoney(shipping.remainingCents)}
                    </span>{' '}
                    to free shipping
                  </>
                )}
              </span>
              <span className="text-2xs uppercase tracking-wide text-warm-600" data-numeric>
                over {formatMoney(site.freeShippingThresholdCents, { compact: true })}
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
                className="h-full bg-gold transition-[width] duration-200"
                style={{ width: `${Math.round(shipping.progress * 100)}%` }}
              />
            </div>
            {shipping.suggestion?.kind === 'add-on' ? (
              <button
                type="button"
                onClick={() => {
                  const s = shipping.suggestion;
                  if (s?.kind !== 'add-on') return;
                  add(s.addOn.id, s.qty);
                  emit(EVENTS.addToCart, {
                    sku: s.addOn.id,
                    qty: s.qty,
                    value: dollars(s.totalCents),
                  });
                }}
                className="mt-3 flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm border border-warm-300 px-3 py-2 text-left hover:border-ink"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">
                    Add {shipping.suggestion.qty > 1 ? `${shipping.suggestion.qty} ` : ''}
                    {shipping.suggestion.addOn.name.toLowerCase()} to close the gap
                  </span>
                  <span className="block text-2xs text-warm-600">
                    {shipping.suggestion.addOn.shortLine}
                  </span>
                </span>
                <Price cents={shipping.suggestion.totalCents} size="xs" display={false} />
              </button>
            ) : null}

            {shipping.suggestion?.kind === 'tier-upgrade' ? (
              <button
                type="button"
                onClick={() => {
                  const upgrade = shipping.suggestion;
                  if (upgrade?.kind !== 'tier-upgrade') return;
                  remove(lineKey(upgrade.fromLine));
                  add(upgrade.tier.id, 1, {
                    color: upgrade.fromLine.color,
                    linkMode: upgrade.fromLine.linkMode,
                  });
                  emit(EVENTS.addToCart, {
                    sku: upgrade.tier.id,
                    qty: 1,
                    value: dollars(upgrade.tier.priceCents),
                  });
                }}
                className="mt-3 flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm border border-warm-300 px-3 py-2 text-left hover:border-ink"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">
                    Move up to {shipping.suggestion.tier.name.toLowerCase()} to clear the gap
                  </span>
                  <span className="block text-2xs text-warm-600">
                    {shipping.suggestion.tier.shortLine}
                  </span>
                </span>
                <Price cents={shipping.suggestion.extraCents} size="xs" display={false} />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 [-webkit-overflow-scrolling:touch]">
          {empty ? (
            <div className="py-14">
              <p className="font-display text-lg font-bold tracking-tight">Nothing in the cart yet.</p>
              <p className="mt-2 text-sm text-warm-700">
                Pick how many stands your floor needs. Most single-location shops take three.
              </p>
              <ButtonLink
                href={`/products/${coreProduct.slug}`}
                variant="solid"
                size="md"
                className="mt-5"
                onClick={close}
              >
                Choose a bundle
              </ButtonLink>
            </div>
          ) : (
            <ul className="divide-y divide-warm-300">
              {resolved.map(({ key, line, item, totalCents }) => {
                const perOrder = item.kind === 'add-on' && item.perOrder;
                return (
                  <li key={key} className="flex gap-4 py-4">
                    <span
                      aria-hidden="true"
                      className="h-16 w-16 shrink-0 rounded-sm border border-warm-300 bg-warm-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-warm-600">{describeLine(line, item)}</p>
                        </div>
                        <Price cents={totalCents} size="sm" display={false} />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        {perOrder ? (
                          <span className="text-2xs uppercase tracking-wide text-warm-600">
                            Once per order
                          </span>
                        ) : (
                          <QtyStepper
                            value={line.qty}
                            label={item.name}
                            onChange={(next) => setQty(key, next)}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="cursor-pointer text-xs text-warm-600 underline decoration-warm-400 underline-offset-4 hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!empty ? (
          <div
            className="border-t border-warm-300 px-5 py-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <label className="block">
              <span className="block text-xs font-semibold">
                {perUnitLinks ? 'Your main Google review link' : 'Your Google review link'}
              </span>
              <span className="mt-0.5 block text-2xs text-warm-600">
                {perUnitLinks
                  ? 'You picked a separate link per stand, we will email you for the rest before programming.'
                  : 'We program every chip to this before shipping. You can add it after checkout instead.'}
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

            <dl className="mt-4 space-y-1.5">
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-warm-700">Subtotal</dt>
                <dd>
                  <Price cents={subtotal} size="sm" display={false} />
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-warm-700">Shipping</dt>
                <dd className="text-sm font-semibold" data-numeric>
                  {shipping.qualifies ? 'Free' : formatMoney(site.flatShippingCents)}
                </dd>
              </div>
            </dl>

            <Button
              block
              size="lg"
              className="mt-4"
              onClick={() => {
                close();
                window.location.href = '/checkout';
              }}
            >
              Checkout
            </Button>
            <p className="mt-2 text-center text-2xs text-warm-600">
              Taxes calculated at checkout. {site.shipping.processing} processing.
            </p>

            {stands > site.multiLocationMinUnits ? (
              <p className="mt-3 rounded-sm border border-warm-300 bg-warm-100 px-3 py-2 text-xs text-warm-700">
                Buying for more than one address? We can quote the group.{' '}
                <Link href="/multi-location" className="font-semibold text-gold-deep underline underline-offset-4">
                  Get a multi-location quote
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
