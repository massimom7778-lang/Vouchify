import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isStripeConfigured, siteOrigin } from '@/lib/stripe';
import { provisionFromCheckoutSession } from '@/lib/provision';
import { orderConfirmationText, sendEmail } from '@/lib/email';
import { site } from '@/data/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook.
 *
 * This is what makes an order real. The thank-you page also provisions, but a
 * customer who pays and closes the tab never loads it — before this route
 * existed that order had money against it, no stand records, and no way for
 * its owner to reach the dashboard link. Here that cannot happen.
 *
 * Both paths call the same idempotent function, so whichever arrives first
 * wins and the other is a no-op. `created` is what stops a retried webhook
 * sending the confirmation twice.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhook
 */

const HANDLED = new Set<string>([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
]);

async function fulfil(session: Stripe.Checkout.Session): Promise<void> {
  const result = await provisionFromCheckoutSession(session);
  if (!result) {
    console.warn('[webhook] session %s was not provisionable', session.id);
    return;
  }

  // Only the first time. A Stripe retry, or the customer refreshing the
  // thank-you page, must not send a second confirmation.
  if (!result.created) return;

  const to = session.customer_details?.email ?? result.order.email;
  if (!to) {
    console.warn('[webhook] no email on session %s, confirmation not sent', session.id);
    return;
  }

  const delivery = await sendEmail({
    to,
    subject: `Your ${site.name} order`,
    replyTo: site.supportEmail,
    text: orderConfirmationText({
      dashboardUrl: `${siteOrigin()}/dashboard/${result.order.dashboardToken}`,
      standCount: Number(session.metadata?.standCount ?? 0),
      reviewLink: session.metadata?.reviewLink ?? '',
      perUnitLinks: session.metadata?.linkPlan === 'per-unit',
    }),
  });

  console.info('[webhook] provisioned %s, confirmation %s', session.id, delivery);
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: 'Stripe is not configured.' }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set; refusing unverified events');
    return NextResponse.json({ ok: false, error: 'Webhook is not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ ok: false, error: 'Missing signature.' }, { status: 400 });
  }

  // The raw body is required — parsing it first would break the signature.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch (error) {
    console.error('[webhook] signature verification failed', error);
    return NextResponse.json({ ok: false, error: 'Bad signature.' }, { status: 400 });
  }

  if (!HANDLED.has(event.type)) {
    // Acknowledged, not acted on. Returning 200 stops Stripe retrying events
    // this endpoint will never care about.
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  try {
    await fulfil(event.data.object as Stripe.Checkout.Session);
  } catch (error) {
    // A 500 asks Stripe to retry, which is what we want for a transient
    // database or mail failure — provisioning is idempotent, so a retry is safe.
    console.error('[webhook] handling %s failed', event.id, error);
    return NextResponse.json({ ok: false, error: 'Handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
