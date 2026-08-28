import 'server-only';
import type Stripe from 'stripe';
import { orderConfirmationText, sendEmail } from '@/lib/email';
import { siteOrigin } from '@/lib/stripe';
import { getStore } from '@/lib/store';
import type { OrderRecord } from '@/lib/store/types';
import { site } from '@/data/site';

/**
 * Everything that has to reach a human after money moves.
 *
 * Two audiences: the customer, who needs the dashboard link, and the operator,
 * who needs to know when a paid order did not turn into stands.
 */

/**
 * Alerts the operator that something in the paid path failed.
 *
 * The honest limitation: this sends mail to report that mail or provisioning
 * broke, so a total Resend outage takes the alert with it. It still logs at
 * error level in that case, which is what a log drain or Vercel alert can hook
 * onto. It is not a substitute for a real monitor, it is the difference between
 * finding out today and finding out when the customer emails.
 */
export async function alertOperator({
  subject,
  lines,
}: {
  subject: string;
  lines: readonly string[];
}): Promise<void> {
  const body = [
    ...lines,
    '',
    `Site: ${site.url}`,
    `Time: ${new Date().toISOString()}`,
  ].join('\n');

  console.error('[alert] %s\n%s', subject, body);

  try {
    const delivery = await sendEmail({
      to: site.supportEmail,
      subject: `[${site.name} alert] ${subject}`,
      text: body,
    });
    if (delivery !== 'email') {
      console.error('[alert] could not email the alert either (%s)', delivery);
    }
  } catch (error) {
    // Never let alerting throw into a payment path.
    console.error('[alert] alert send threw', error);
  }
}

/**
 * The order confirmation. Both the thank-you page and the webhook call this
 * unconditionally on every visit/delivery, not just the one that created the
 * order.
 *
 * This used to be gated on `created`: only the path that created the order
 * sent the email. That meant a customer whose browser died right after the
 * thank-you page's server render created the order — but before this
 * function finished — got nothing: the webhook arrived later, saw
 * `created: false`, and (under the old rule) skipped sending too. The
 * dashboard link, the only credential for what they just paid for, was gone
 * for good.
 *
 * `markConfirmationSent` is what makes calling this unconditionally safe: it
 * atomically flips `orders.confirmation_sent_at` from null to now() and
 * reports whether THIS call won that flip. Only the winner sends. Whichever
 * path runs — the thank-you request, a retry of it, or the webhook arriving
 * seconds or minutes later — gets a real chance to be the one that does,
 * which is what makes the webhook the durable path: Stripe keeps retrying it
 * until it succeeds, independent of whether the customer's browser ever
 * loads the thank-you page again.
 */
export async function sendOrderConfirmation({
  order,
  session,
}: {
  order: OrderRecord;
  session: Stripe.Checkout.Session;
}): Promise<void> {
  const to = session.customer_details?.email ?? order.email;
  if (!to) {
    await alertOperator({
      subject: 'Order has no email address',
      lines: [
        'An order was provisioned but there is no address to send the dashboard link to.',
        `Checkout session: ${session.id}`,
        `Order: ${order.id}`,
        `Dashboard: ${siteOrigin()}/dashboard/${order.dashboardToken}`,
      ],
    });
    return;
  }

  const claimed = await getStore().markConfirmationSent(order.id);
  if (!claimed) return; // Already sent — by the other path, or a previous call.

  const standCount = Number(session.metadata?.standCount ?? 0);
  const plateCount = Number(session.metadata?.plateCount ?? 0);

  const delivery = await sendEmail({
    to,
    subject: `Your ${site.name} order`,
    replyTo: site.supportEmail,
    text: orderConfirmationText({
      // Nothing trackable in this order — a per-order service bought with no
      // stand or plate, which the current UI never actually produces on its
      // own — means there's nothing to manage from a dashboard, so the email
      // skips that block rather than pointing at one with nothing in it.
      dashboardUrl:
        standCount > 0 || plateCount > 0
          ? `${siteOrigin()}/dashboard/${order.dashboardToken}`
          : null,
      standCount,
      plateCount,
      reviewLink: session.metadata?.reviewLink ?? '',
      perUnitLinks: session.metadata?.linkPlan === 'per-unit',
    }),
  });

  // 'logged' means no key is configured, which is a deliberate local setup.
  // 'failed' means a key IS configured and the customer did not get their
  // dashboard link — that is a real incident.
  if (delivery === 'failed') {
    await alertOperator({
      subject: 'Order confirmation failed to send',
      lines: [
        'The order is provisioned but the customer did not receive the dashboard link.',
        `Checkout session: ${session.id}`,
        `Order: ${order.id}`,
        `To: ${to}`,
        `Dashboard: ${siteOrigin()}/dashboard/${order.dashboardToken}`,
        '',
        'Send this link to them by hand.',
      ],
    });
  }
}
