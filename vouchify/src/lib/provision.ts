import 'server-only';
import type Stripe from 'stripe';
import { getStore } from '@/lib/store';
import type {
  AppendResult,
  OrderRecord,
  ProvisionInput,
  ProvisionResult,
  ShippingAddress,
  StandInput,
} from '@/lib/store/types';
import { PLACEMENTS_PER_LOCATION, getStandTier, placements } from '@/data/products';

/**
 * Turns a paid order into physical stand records.
 *
 * Stands are labelled with the placement they were packed for, drawn from the
 * same ordered list the shop plan renders. That is what lets the dashboard say
 * "the waiting-area stand is doing nothing" rather than "stand 3 is doing
 * nothing", and it is why the boxes can be labelled before they ship.
 */

function placementFor(index: number): { number: number; label: string } {
  const placement = placements[index % placements.length];
  if (!placement) return { number: index + 1, label: `Stand ${index + 1}` };
  // Past ten stands the sequence repeats, so name the round it belongs to.
  const round = Math.floor(index / placements.length);
  const suffix = round > 0 ? ` (location ${round + 1})` : '';
  return { number: index + 1, label: `${placement.label}${suffix}` };
}

/**
 * Builds `count` stand inputs starting at `startIndex`.
 *
 * Appends pass the existing stand count as `startIndex`, so extra stands
 * continue the placement sequence rather than restarting at "Checkout counter".
 */
export function buildStands({
  count,
  color,
  targetUrl,
  startIndex = 0,
}: {
  count: number;
  color: 'black' | 'white';
  targetUrl: string;
  startIndex?: number;
}): StandInput[] {
  return Array.from({ length: count }, (_, offset) => {
    const placement = placementFor(startIndex + offset);
    return {
      placementNumber: placement.number,
      placementLabel: placement.label,
      color,
      targetUrl,
    };
  });
}

/** How many stands a paid session bought, and in what colour. */
function standsFromSession(session: Stripe.Checkout.Session): {
  count: number;
  color: 'black' | 'white';
} {
  const fromMetadata = Number(session.metadata?.standCount ?? 0);
  const count = Number.isFinite(fromMetadata) && fromMetadata > 0 ? fromMetadata : 0;
  const color = session.metadata?.color === 'white' ? 'white' : 'black';
  return { count, color };
}

/**
 * The shipping address Stripe collected at checkout.
 *
 * Without this the packing list has codes and no destination, and every box
 * means going back to the Stripe dashboard to find out where it goes.
 */
export function shippingFromSession(session: Stripe.Checkout.Session): ShippingAddress {
  // `collected_information.shipping_details` is where current API versions put
  // this; `shipping_details` is the older top-level field. Read whichever the
  // account's version sends.
  const withShipping = session as Stripe.Checkout.Session & {
    shipping_details?: { name?: string | null; address?: Stripe.Address | null } | null;
    collected_information?: {
      shipping_details?: { name?: string | null; address?: Stripe.Address | null } | null;
    } | null;
  };

  const details =
    withShipping.collected_information?.shipping_details ??
    withShipping.shipping_details ??
    null;

  const address = details?.address ?? session.customer_details?.address ?? null;

  return {
    name: details?.name ?? session.customer_details?.name ?? null,
    line1: address?.line1 ?? null,
    line2: address?.line2 ?? null,
    city: address?.city ?? null,
    region: address?.state ?? null,
    postalCode: address?.postal_code ?? null,
    country: address?.country ?? null,
    phone: session.customer_details?.phone ?? null,
  };
}

/**
 * Idempotent on the Checkout Session id, so a refreshed thank-you page, a
 * retried webhook and a customer who opens the receipt twice all converge on
 * one set of codes.
 */
export async function provisionFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<ProvisionResult | null> {
  if (session.payment_status !== 'paid') return null;

  const store = getStore();
  const existing = await store.getOrderByCheckoutSession(session.id);
  if (existing) return { order: existing, created: false };

  const { count, color } = standsFromSession(session);
  // `count` can legitimately be 0 — an order for a review plate with no stand
  // tier in it, say. Every paid Checkout Session had a non-empty cart
  // (enforced client- and server-side before Stripe was ever called), so an
  // order record is created here regardless of what was bought. Bailing out
  // on count === 0 used to mean a paid, stand-less order left no trace
  // anywhere but Stripe: no row in the store, no dashboard token, no
  // confirmation email, nothing to look up if the customer wrote in asking
  // where their order was.

  // A shared link plan points every stand at the one link the customer gave us.
  // A per-unit plan leaves the targets blank on purpose: the owner fills them in
  // from the dashboard, or replies to the email asking for them.
  const perUnit = session.metadata?.linkPlan === 'per-unit';
  const sharedTarget = perUnit ? '' : (session.metadata?.reviewLink ?? '').trim();

  const input: ProvisionInput = {
    checkoutSessionId: session.id,
    email: session.customer_details?.email ?? null,
    shipping: shippingFromSession(session),
    stands: buildStands({ count, color, targetUrl: sharedTarget }),
  };

  return store.provisionOrder(input);
}

/**
 * Adds stands to an order that already exists.
 *
 * This is what the post-purchase upsell needs: the customer has paid for more
 * stands against an order that is already provisioned, and those stands have to
 * become real codes on the same order, continuing the same placement sequence,
 * pointing at the same review link.
 *
 * `ref` is the idempotency key — the upsell PaymentIntent id, or the fallback
 * Checkout Session id. Calling twice with the same ref adds stands once.
 */
export async function appendStandsToOrder({
  order,
  ref,
  count,
  color,
  targetUrl,
}: {
  order: OrderRecord;
  ref: string;
  count: number;
  color?: 'black' | 'white';
  targetUrl?: string;
}): Promise<AppendResult | null> {
  if (count <= 0) return null;

  const store = getStore();
  const existing = await store.listStands(order.id, 1);

  // Continue the placement sequence, and inherit colour and target from the
  // stands already on the order so the new ones match what is being packed.
  const last = existing[existing.length - 1];
  const inheritedColor = color ?? last?.color ?? 'black';
  const inheritedTarget = targetUrl ?? last?.targetUrl ?? '';

  return store.appendStands(
    order.id,
    ref,
    buildStands({
      count,
      color: inheritedColor,
      targetUrl: inheritedTarget,
      startIndex: existing.length,
    }),
  );
}

/**
 * Development helper: builds an order without going through Stripe, so the
 * forwarder and the dashboard can be exercised end to end on a fresh clone.
 * Guarded by the caller — see /api/dev/seed.
 */
export async function provisionDemoOrder(standCount = 5): Promise<OrderRecord> {
  const tier = getStandTier('stand-5');
  const count = Math.min(Math.max(standCount, 1), tier ? PLACEMENTS_PER_LOCATION * 2 : 10);
  const { order } = await getStore().provisionOrder({
    checkoutSessionId: `demo_${Date.now()}`,
    email: 'demo@example.com',
    stands: buildStands({
      count,
      color: 'black',
      targetUrl: 'https://www.google.com/search?q=leave+a+review',
    }),
  });
  return order;
}
