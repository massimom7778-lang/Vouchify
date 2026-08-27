import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { appendStandsToOrder, provisionFromCheckoutSession } from '@/lib/provision';
import { alertOperator, sendOrderConfirmation } from '@/lib/notify';
import { getStore } from '@/lib/store';

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
 * wins and the other is a no-op. Confirmation is sent by whichever path
 * actually created the order, not by this one specifically.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhook
 */

const HANDLED = new Set<string>([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'charge.refunded',
  'charge.dispute.created',
]);

/**
 * The upsell's card-authentication fallback creates its own Checkout Session
 * carrying `upsellFor` (the original session id) and `upsellStands`. Those
 * stands belong on the ORIGINAL order — provisioning it as a new order would
 * give the customer a second dashboard, a second set of codes, and no
 * connection to the box being packed.
 */
async function appendUpsell(session: Stripe.Checkout.Session): Promise<boolean> {
  const originalSessionId = session.metadata?.upsellFor;
  const count = Number(session.metadata?.upsellStands ?? 0);
  if (!originalSessionId || !Number.isFinite(count) || count <= 0) return false;

  const order = await getStore().getOrderByCheckoutSession(originalSessionId);
  if (!order) {
    await alertOperator({
      subject: 'Upsell paid but the original order is missing',
      lines: [
        'A customer paid the upsell through the fallback checkout, but the order it',
        'attaches to has not been provisioned, so the extra stands could not be added.',
        `Fallback session: ${session.id}`,
        `Original session: ${originalSessionId}`,
        `Stands owed: ${count}`,
      ],
    });
    // Returning true stops this being treated as a normal order. A 200 is
    // correct: retrying will not find the order either, and the alert is out.
    return true;
  }

  // Idempotent on the fallback session id, so a Stripe retry adds stands once.
  const result = await appendStandsToOrder({ order, ref: session.id, count });
  if (result?.created) {
    console.info(
      '[webhook] upsell added %d stands to %s via fallback %s',
      result.added.length,
      order.id,
      session.id,
    );
  }
  return true;
}

async function fulfil(session: Stripe.Checkout.Session): Promise<void> {
  // The upsell fallback is not a new order; it tops up an existing one.
  if (await appendUpsell(session)) return;

  const result = await provisionFromCheckoutSession(session);
  if (!result) {
    // Paid, but nothing was created. Before alerting existed this returned a
    // silent 200 and the order was simply lost.
    if (session.payment_status === 'paid') {
      await alertOperator({
        subject: 'Paid session could not be provisioned',
        lines: [
          'Stripe reports this session as paid, but no stands were created for it.',
          'Someone has paid and will receive nothing unless this is handled by hand.',
          `Session: ${session.id}`,
          `Email: ${session.customer_details?.email ?? 'unknown'}`,
          `Amount: ${session.amount_total ?? 'unknown'} ${session.currency ?? ''}`,
          `standCount metadata: ${session.metadata?.standCount ?? '(missing)'}`,
        ],
      });
    } else {
      console.warn('[webhook] session %s was not provisionable', session.id);
    }
    return;
  }

  // Only the path that actually created the order sends the confirmation.
  // A Stripe retry, or the thank-you page having got there first, must not
  // send a second one.
  if (!result.created) return;

  await sendOrderConfirmation({ order: result.order, session });
}

/**
 * A delayed-notification payment method (the async twin of the succeeded
 * event this endpoint already handles) resolved to a failure. Nothing was
 * ever provisioned for this session — provisioning only runs once payment
 * is confirmed — so there is nothing to undo. This exists purely so support
 * can follow up with a customer who is expecting stands that are not coming.
 */
async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session): Promise<void> {
  await alertOperator({
    subject: 'Order payment failed',
    lines: [
      'A checkout session using a delayed payment method did not complete.',
      'Nothing was charged and nothing was provisioned. The customer may be',
      'expecting an order that is not coming unless they try again.',
      `Session: ${session.id}`,
      `Email: ${session.customer_details?.email ?? 'unknown'}`,
      `Amount: ${session.amount_total ?? 'unknown'} ${session.currency ?? ''}`,
    ],
  });
}

/**
 * Finds the order a Charge belongs to by following its PaymentIntent back to
 * the Checkout Session that created it. Charge events carry a PaymentIntent
 * id, never a Checkout Session id directly, and the store only indexes
 * orders by session — this is the one hop between them Stripe's API allows.
 */
async function findOrderByCharge(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return null;

  const sessions = await getStripe().checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  const session = sessions.data[0];
  if (!session) return null;

  return getStore().getOrderByCheckoutSession(session.id);
}

/**
 * A refund never un-provisions anything automatically. Stand codes may
 * already be encoded, packed, or in a box on a truck by the time this
 * arrives, and reversing that is a physical action, not a database one.
 * This alert exists so a human decides whether the order still ships.
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const order = await findOrderByCharge(charge);
  await alertOperator({
    subject: order?.fulfilledAt
      ? 'Refund issued on an order already marked fulfilled'
      : 'Refund issued on an order',
    lines: [
      `Charge: ${charge.id}`,
      `Amount refunded: ${charge.amount_refunded} ${charge.currency}`,
      order
        ? `Order: ${order.id} (${order.fulfilledAt ? `fulfilled ${order.fulfilledAt}` : 'not yet marked fulfilled'})`
        : 'Order: could not be matched to a stored order — check by hand.',
      `Email: ${order?.email ?? charge.billing_details?.email ?? 'unknown'}`,
      'This charge was refunded in Stripe. Nothing here was changed automatically —',
      'decide by hand whether the stands should still ship, and update the dashboard',
      'or fulfillment record accordingly.',
    ],
  });
}

/** A chargeback is time-sensitive and often has a response deadline in
 *  Stripe, so this alerts unconditionally rather than only on a mismatch. */
async function handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id;
  const order =
    typeof dispute.charge !== 'string'
      ? await findOrderByCharge(dispute.charge)
      : await (async () => {
          const charge = await getStripe().charges.retrieve(chargeId);
          return findOrderByCharge(charge);
        })();

  await alertOperator({
    subject: 'Dispute opened on an order',
    lines: [
      `Dispute: ${dispute.id} (reason: ${dispute.reason})`,
      `Charge: ${chargeId}`,
      `Amount: ${dispute.amount} ${dispute.currency}`,
      order
        ? `Order: ${order.id} (${order.fulfilledAt ? `fulfilled ${order.fulfilledAt}` : 'not yet marked fulfilled'})`
        : 'Order: could not be matched to a stored order — check by hand.',
      'Respond in the Stripe dashboard before the evidence deadline shown there.',
    ],
  });
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
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfil(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.async_payment_failed':
        await handleAsyncPaymentFailed(event.data.object as Stripe.Checkout.Session);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute);
        break;
    }
  } catch (error) {
    // A 500 asks Stripe to retry, which is what we want for a transient
    // database or mail failure — provisioning is idempotent, so a retry is safe.
    console.error('[webhook] handling %s failed', event.id, error);
    await alertOperator({
      subject: 'Webhook handler threw',
      lines: [
        'A Stripe event could not be handled. Stripe will retry, but if the retries',
        'also fail this will need to be handled by hand.',
        `Event: ${event.id} (${event.type})`,
        '',
        String(error instanceof Error ? error.stack ?? error.message : error),
      ],
    });
    return NextResponse.json({ ok: false, error: 'Handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
