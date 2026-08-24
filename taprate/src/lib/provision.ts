import 'server-only';
import type Stripe from 'stripe';
import { getStore } from '@/lib/store';
import type { OrderRecord, ProvisionInput } from '@/lib/store/types';
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
 * Idempotent on the Checkout Session id, so a refreshed thank-you page, a
 * retried webhook and a customer who opens the receipt twice all converge on
 * one set of codes.
 */
export async function provisionFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<OrderRecord | null> {
  if (session.payment_status !== 'paid') return null;

  const store = getStore();
  const existing = await store.getOrderByCheckoutSession(session.id);
  if (existing) return existing;

  const { count, color } = standsFromSession(session);
  if (count === 0) return null;

  // A shared link plan points every stand at the one link the customer gave us.
  // A per-unit plan leaves the targets blank on purpose: the owner fills them in
  // from the dashboard, or replies to the email asking for them.
  const perUnit = session.metadata?.linkPlan === 'per-unit';
  const sharedTarget = perUnit ? '' : (session.metadata?.reviewLink ?? '').trim();

  const input: ProvisionInput = {
    checkoutSessionId: session.id,
    email: session.customer_details?.email ?? null,
    stands: Array.from({ length: count }, (_, index) => {
      const placement = placementFor(index);
      return {
        placementNumber: placement.number,
        placementLabel: placement.label,
        color,
        targetUrl: sharedTarget,
      };
    }),
  };

  return store.provisionOrder(input);
}

/**
 * Development helper: builds an order without going through Stripe, so the
 * forwarder and the dashboard can be exercised end to end on a fresh clone.
 * Guarded by the caller — see /api/dev/seed.
 */
export async function provisionDemoOrder(standCount = 5): Promise<OrderRecord> {
  const tier = getStandTier('stand-5');
  const count = Math.min(Math.max(standCount, 1), tier ? PLACEMENTS_PER_LOCATION * 2 : 10);
  return getStore().provisionOrder({
    checkoutSessionId: `demo_${Date.now()}`,
    email: 'demo@example.com',
    stands: Array.from({ length: count }, (_, index) => {
      const placement = placementFor(index);
      return {
        placementNumber: placement.number,
        placementLabel: placement.label,
        color: 'black' as const,
        targetUrl: 'https://www.google.com/search?q=leave+a+review',
      };
    }),
  });
}
