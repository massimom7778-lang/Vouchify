import 'server-only';
import { site } from '@/data/site';
import { describeCounts } from '@/lib/format';

/**
 * 'email'  — accepted by Resend.
 * 'logged' — no key configured, so it was written to the log on purpose.
 * 'failed' — a key IS configured and the send was rejected or threw. This is
 *            the one that means a customer did not get their mail, and it is
 *            deliberately distinct from 'logged' so alerting can tell them
 *            apart.
 */
export type Delivery = 'email' | 'logged' | 'failed';

export interface OutboundEmail {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly replyTo?: string;
}

function fromAddress(): string {
  return process.env.QUOTE_FROM_EMAIL ?? `orders@${new URL(site.url).hostname}`;
}

/**
 * Sends mail through Resend when a key is configured, and logs it server-side
 * when one is not.
 *
 * Delivery degrades rather than failing: a fresh clone with no key still runs
 * the whole checkout, and the operator can see in the logs exactly what would
 * have gone out. Callers get told which happened so they can say so honestly.
 */
export async function sendEmail(message: OutboundEmail): Promise<Delivery> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info(
      '[email] no RESEND_API_KEY set, logging instead\nTo: %s\nSubject: %s\n\n%s',
      message.to,
      message.subject,
      message.text,
    );
    return 'logged';
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [message.to],
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        subject: message.subject,
        text: message.text,
      }),
    });

    if (!response.ok) {
      console.error(
        '[email] resend rejected the send: %s\nTo: %s\nSubject: %s\n\n%s',
        response.status,
        message.to,
        message.subject,
        message.text,
      );
      return 'failed';
    }
  } catch (error) {
    console.error('[email] resend request failed', error, '\n', message.text);
    return 'failed';
  }

  return 'email';
}

/**
 * The order confirmation. Its real job is delivering the dashboard link, that
 * link is the only key to the stands, and until this email exists a customer
 * who closes the tab on the thank-you page has no way back to it.
 */
export function orderConfirmationText({
  dashboardUrl,
  standCount,
  plateCount,
  reviewLink,
  perUnitLinks,
}: {
  /** Null when there is nothing to manage from a dashboard yet — an order
   *  with no stand or plate in it, for instance. */
  dashboardUrl: string | null;
  standCount: number;
  plateCount: number;
  reviewLink: string;
  perUnitLinks: boolean;
}): string {
  const items = describeCounts(standCount, plateCount);

  const body: string[] = [
    `Thanks, your order is in.`,
    ``,
    `We program and pack in ${site.shipping.processing}. Everything with a chip in it is tapped on both an iPhone and an Android handset before it goes in the box.`,
  ];

  if (dashboardUrl) {
    body.push(
      ``,
      `YOUR DASHBOARD`,
      dashboardUrl,
      ``,
      `That link changes where each stand or plate points and shows how many taps each one is getting. It is also printed on a card in your box. Anyone who has it can re-point them, so keep it somewhere only staff you trust can reach.`,
      ``,
      perUnitLinks
        ? `You asked for a separate link per stand. Open the dashboard and set each one, or reply to this email with the links and we will do it before we program them.`
        : reviewLink
          ? `We are programming ${items} to:\n${reviewLink}`
          : `We do not have your Google review link yet. Reply to this email with it, or paste it into the dashboard, and we will program ${items} to it.`,
    );
  } else {
    body.push(
      ``,
      reviewLink
        ? `We are programming your order to:\n${reviewLink}`
        : `We do not have your Google review link yet. Reply to this email with it and we will program your order to it before it ships.`,
    );
  }

  body.push(
    ``,
    `Questions about this order? Reply to this email, a person answers.`,
    ``,
    `${site.name}`,
    site.url,
  );

  return body.join('\n');
}
