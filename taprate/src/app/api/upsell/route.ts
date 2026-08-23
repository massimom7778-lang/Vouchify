import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, isStripeConfigured, siteOrigin } from '@/lib/stripe';
import { upsellRequestSchema } from '@/lib/schemas';
import { getStandTier, postPurchaseUpsell } from '@/data/products';
import { site } from '@/data/site';

export const runtime = 'nodejs';

const WINDOW_SECONDS = site.upsellWindowMinutes * 60;

/**
 * Post-purchase upsell.
 *
 * The offer window is measured against the Stripe Checkout Session's own
 * `created` timestamp, which the customer cannot influence — there is no
 * client-side clock involved, and no countdown that lies. A second request
 * after the window closes is refused even if the page still shows the offer.
 */
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

  const parsed = upsellRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Missing order reference.' }, { status: 400 });
  }

  const tier = getStandTier(postPurchaseUpsell.tierId);
  if (!tier) {
    return NextResponse.json({ ok: false, error: 'Offer unavailable.' }, { status: 500 });
  }

  const stripe = getStripe();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId, {
      expand: ['payment_intent'],
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'That order could not be found.' }, { status: 404 });
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ ok: false, error: 'That order has not been paid.' }, { status: 409 });
  }

  if (session.metadata?.upsellStatus === 'redeemed') {
    return NextResponse.json(
      { ok: false, error: 'This offer has already been added to your order.' },
      { status: 409 },
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds > session.created + WINDOW_SECONDS) {
    return NextResponse.json(
      { ok: false, expired: true, error: 'This offer has expired.' },
      { status: 410 },
    );
  }

  const paymentIntent = session.payment_intent;
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const paymentMethodId =
    paymentIntent && typeof paymentIntent !== 'string'
      ? typeof paymentIntent.payment_method === 'string'
        ? paymentIntent.payment_method
        : paymentIntent.payment_method?.id
      : undefined;

  // Priced from the catalog. The request body carries an order reference and
  // nothing else — there is no amount for a client to name.
  const amount = postPurchaseUpsell.priceCents;

  if (customerId && paymentMethodId) {
    try {
      const intent = await stripe.paymentIntents.create(
        {
          amount,
          currency: site.currency.toLowerCase(),
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          description: `${site.name} — ${tier.qty} extra stands added after checkout`,
          metadata: {
            kind: 'post-purchase-upsell',
            checkoutSession: session.id,
            sku: tier.id,
            reviewLink: session.metadata?.reviewLink ?? '',
          },
        },
        { idempotencyKey: `upsell_${session.id}` },
      );

      if (intent.status === 'succeeded' || intent.status === 'processing') {
        await stripe.checkout.sessions.update(session.id, {
          metadata: {
            ...(session.metadata ?? {}),
            upsellStatus: 'redeemed',
            upsellPaymentIntent: intent.id,
          },
        });
        return NextResponse.json({ ok: true, charged: true });
      }
    } catch (error) {
      // A saved card can still demand authentication. That is not a failure —
      // it is the one case where the customer has to confirm, so hand them a
      // Checkout Session instead of showing an error.
      const requiresAction =
        error instanceof Stripe.errors.StripeCardError &&
        error.code === 'authentication_required';
      if (!requiresAction) {
        console.error('[upsell] off-session charge failed', error);
      }
    }
  }

  try {
    const origin = siteOrigin();
    const fallback = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: site.currency.toLowerCase(),
            unit_amount: amount,
            product_data: {
              name: `${tier.qty} extra stands`,
              description: 'Added to an order already packed and programmed.',
            },
          },
        },
      ],
      metadata: {
        kind: 'post-purchase-upsell',
        checkoutSession: session.id,
        sku: tier.id,
      },
      success_url: `${origin}/thank-you?session_id=${session.id}&upsell=done`,
      cancel_url: `${origin}/thank-you?session_id=${session.id}`,
    });

    if (fallback.url) {
      return NextResponse.json({ ok: true, charged: false, url: fallback.url });
    }
  } catch (error) {
    console.error('[upsell] fallback session failed', error);
  }

  return NextResponse.json(
    { ok: false, error: 'That could not be added. Email us and we will sort it out.' },
    { status: 502 },
  );
}
