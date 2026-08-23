import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isStripeConfigured, siteOrigin } from '@/lib/stripe';
import { priceOrder } from '@/lib/pricing';
import { checkoutRequestSchema } from '@/lib/schemas';
import { site } from '@/data/site';

export const runtime = 'nodejs';

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
        description: `${site.name} order — ${order.standCount} stands`,
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
        orderBump: parsed.data.bump ? 'keychain' : '',
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
