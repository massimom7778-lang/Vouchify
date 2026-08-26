'use client';

import { track } from '@vercel/analytics';
import type { Sku, StandTierId } from '@/data/products';

/**
 * Every custom event the storefront emits, in one place.
 *
 * The point of this module is that no component ever writes an event name or a
 * property key as a bare string. `emit` is the only exported way to send one,
 * and it is typed against `EventPayloads`, so a renamed event or a mistyped
 * property is a compile error rather than a silently missing funnel step.
 *
 * Constraints this file exists to keep:
 *   - Nothing here runs on the server. `emit` returns early when there is no
 *     `window`, so importing it from a component that also renders on the
 *     server is harmless, and no page's static rendering changes.
 *   - No PII. Emails, review links, addresses and Stripe session ids are never
 *     sent — only SKUs, counts and order values. Vercel Analytics is
 *     cookieless, which is why this ships with no consent banner.
 *   - Property values are flat scalars, because that is all the transport
 *     accepts. A cart of several lines is several `add_to_cart` events, not one
 *     event carrying an array.
 */

export const EVENTS = {
  tierSelected: 'tier_selected',
  addToCart: 'add_to_cart',
  cartOpened: 'cart_opened',
  beginCheckout: 'begin_checkout',
  bumpShown: 'bump_shown',
  bumpToggled: 'bump_toggled',
  upsellShown: 'upsell_shown',
  upsellAccepted: 'upsell_accepted',
  purchase: 'purchase',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * `value` is always dollars, never cents, and always the amount the customer
 * would actually be charged for the thing the event is about. Mixing the two
 * units across events is the fastest way to make a funnel report meaningless,
 * so the conversion lives in one function and prices are stored as cents
 * everywhere else.
 */
export function dollars(cents: number): number {
  return Math.round(cents) / 100;
}

export interface EventPayloads {
  [EVENTS.tierSelected]: { tierId: StandTierId };
  [EVENTS.addToCart]: { sku: Sku; qty: number; value: number };
  [EVENTS.cartOpened]: { itemCount: number; subtotal: number };
  [EVENTS.beginCheckout]: { value: number; standCount: number };
  [EVENTS.bumpShown]: { sku: Sku };
  [EVENTS.bumpToggled]: { sku: Sku; accepted: boolean };
  [EVENTS.upsellShown]: { tierId: StandTierId; value: number };
  [EVENTS.upsellAccepted]: { tierId: StandTierId; value: number };
  [EVENTS.purchase]: { value: number; standCount: number; tierId: StandTierId | 'none' };
}

/**
 * `track()` calls `window.va?.(...)` and silently drops the event when that is
 * still undefined. `<Analytics />` defines it from its own mount effect, and it
 * is rendered after `{children}` in the root layout, so every event fired from
 * a child's mount effect — `bump_shown`, `upsell_shown`, `purchase`, the three
 * that matter most — lost the race and recorded nothing.
 *
 * This is the pre-queue from Vercel's own manual install snippet: define the
 * stub if nothing has yet, and the real script replays `window.vaq` when it
 * arrives. Cheap, and it makes the events independent of effect ordering
 * rather than dependent on where a component sits in the tree.
 */
function ensureQueue(): void {
  // `va` and `vaq` are declared on Window by @vercel/analytics itself.
  if (window.va) return;
  window.va = function queued(event, properties) {
    if (!window.vaq) window.vaq = [];
    window.vaq.push([event, properties]);
  };
}

export function emit<E extends EventName>(event: E, payload: EventPayloads[E]): void {
  // Belt and braces: `track` is already a no-op outside the browser, but an
  // explicit guard means this module can be imported anywhere without a
  // reviewer having to go and check that.
  if (typeof window === 'undefined') return;
  try {
    ensureQueue();
    track(event, payload);
  } catch {
    // Analytics must never be able to break a checkout.
  }
}

/**
 * Fire-once guard for events that describe a page state rather than a click.
 *
 * `purchase` is the one that matters: the thank-you page is a normal URL the
 * customer can refresh, bookmark or reopen from their receipt, and every one of
 * those would otherwise be another sale in the report. Keyed on the Stripe
 * session id and held in localStorage, so it survives a refresh, a new tab and
 * a browser restart on the same device.
 *
 * It cannot survive a different device or a cleared store, so treat the
 * purchase count as a floor that can over-report in rare cases, and Stripe as
 * the source of truth for revenue.
 */
export function onceForKey(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const storageKey = `vouchify-analytics:${key}`;
  try {
    if (window.localStorage.getItem(storageKey)) return false;
    window.localStorage.setItem(storageKey, '1');
    return true;
  } catch {
    // Private mode, or storage disabled. Better to send the event than to
    // silently drop every conversion for that visitor.
    return true;
  }
}
