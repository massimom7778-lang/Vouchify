import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isStripeConfigured, siteOrigin } from '@/lib/stripe';
import { priceOrder, type PricedOrder } from '@/lib/pricing';
import { checkoutRequestSchema } from '@/lib/schemas';
import { orderBump } from '@/data/products';
import { describeCounts } from '@/lib/format';
import { site } from '@/data/site';

export const runtime = 'nodejs';

/**
 * The pack a purchase is attributed to when the report asks "which tier sold".
 * A cart can hold several, so the largest one wins; a cart of add-ons only has
 * no tier and says so rather than pretending to be the single stand.
 */
function primaryTierId(order: PricedOrder): string {
  let best: { id: string; cents: number } | null = null;
  for (const line of order.lines) {
    if (line.item.kind !== 'stand-tier') continue;
    if (!best || line.unitCents > best.cents) best = { id: line.item.id, cents: line.unitCents };
  }
  return best?.id ?? 'none';
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Payments are not configured on this deployment yet.' },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Send JSON.' }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'That cart could not be read. Refresh and try again.' },
      { status: 400 },
    );
  }

  const order = priceOrder(parsed.data);
  if (order.lines.length === 0) {
    return NextResponse.json({ ok: false, error: 'The cart is empty.' }, { status: 400 });
  }

  const stripe = getStripe();
  const origin = siteOrigin();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.lines.map((line) => ({
    quantity: line.qty,
    price_data: {
      currency: site.currency.toLowerCase(),
      unit_amount: line.unitCents,
      product_data: {
        name: line.label,
        description: line.item.shortLine,
      },
    },
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // A customer plus a saved payment method is what makes the one-click
      // post-purchase upsell possible without asking for the card again.
      customer_creation: 'always',
      payment_intent_data: {
        setup_future_usage: 'off_session',
        description: `${site.name} order — ${describeCounts(order.standCount, order.plateCount)}`,
      },
      shipping_address_collection: { allowed_countries: ['CA', 'US'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name:
              order.shippingCents === 0 ? 'Free shipping' : 'Standard shipping',
            fixed_amount: {
              amount: order.shippingCents,
              currency: site.currency.toLowerCase(),
            },
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 9 },
            },
          },
        },
      ],
      customer_email: parsed.data.email,
      metadata: {
        reviewLink: parsed.data.reviewLink ?? '',
        standCount: String(order.standCount),
        // Read by provisioning to give every plate its own trackable code,
        // exactly like a stand — see plateCount in provision.ts.
        plateCount: String(order.plateCount),
        // The largest pack in the order, carried through so the thank-you page
        // can attribute the purchase to a tier without re-expanding line items.
        tierId: primaryTierId(order),
        // Provisioning reads this to label and colour the stand records.
        color: order.lines.find((line) => line.color)?.color ?? 'black',
        linkPlan: order.needsPerUnitLinks ? 'per-unit' : 'shared',
        orderBump: parsed.data.bump ? orderBump.sku : '',
      },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: 'Stripe did not return a checkout URL.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error('[checkout] session create failed', error);
    return NextResponse.json(
      { ok: false, error: 'Checkout could not start. Try again in a moment.' },
      { status: 502 },
    );
  }
}
