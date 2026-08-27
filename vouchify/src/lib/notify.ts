import 'server-only';
import type Stripe from 'stripe';
import { orderConfirmationText, sendEmail } from '@/lib/email';
import { siteOrigin } from '@/lib/stripe';
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
 * The order confirmation, sent from whichever path actually created the order.
 *
 * This used to live only in the webhook, gated on `created`. When the thank-you
 * page won the race it created the order, the webhook then saw `created: false`
 * and returned early, and no confirmation was ever sent — leaving the customer
 * with the dashboard link on a page they were about to navigate away from.
 * Both callers now go through here.
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

  const standCount = Number(session.metadata?.standCount ?? 0);

  const delivery = await sendEmail({
    to,
    subject: `Your ${site.name} order`,
    replyTo: site.supportEmail,
    text: orderConfirmationText({
      // No stand tier in this order means there is nothing to manage from a
      // dashboard yet — a review-plate-only order, say — so the email skips
      // the dashboard block rather than pointing at one with nothing in it.
      dashboardUrl:
        standCount > 0 ? `${siteOrigin()}/dashboard/${order.dashboardToken}` : null,
      standCount,
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
