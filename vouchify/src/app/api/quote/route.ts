import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { alertOperator } from '@/lib/notify';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { quoteRequestSchema } from '@/lib/schemas';
import { getStore } from '@/lib/store';
import { site } from '@/data/site';

export const runtime = 'nodejs';

/** Generous for a real buyer filling the form twice, tight enough that nobody
 *  can drive unbounded outbound email through it. */
const LIMIT = 5;
const WINDOW_SECONDS = 10 * 60;

function formatQuote(quote: ReturnType<typeof quoteRequestSchema.parse>): string {
  const total = quote.locations * quote.standsPerLocation;
  return [
    `Business: ${quote.business}`,
    `Contact: ${quote.name} <${quote.email}>${quote.phone ? ` · ${quote.phone}` : ''}`,
    `Locations: ${quote.locations}`,
    `Stands per location: ${quote.standsPerLocation}`,
    `Total stands: ${total}`,
    `Logo printing: ${quote.logoPrinting ? 'yes' : 'no'}`,
    quote.notes ? `Notes:\n${quote.notes}` : 'Notes: none',
  ].join('\n');
}

/**
 * Multi-location quote requests.
 *
 * The lead is written to the store first and emailed second. These are the
 * highest-value enquiries on the site, and when delivery was the only record a
 * mail outage lost them silently — the submitter saw success and the lead was
 * gone. Now the email is a notification, not the storage.
 */
export async function POST(request: Request) {
  const limit = rateLimit({
    key: `quote:${clientIp(request)}`,
    limit: LIMIT,
    windowSeconds: WINDOW_SECONDS,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Send JSON.' }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, fieldErrors }, { status: 400 });
  }

  const quote = parsed.data;
  const total = quote.locations * quote.standsPerLocation;

  const delivered = await sendEmail({
    to: site.supportEmail,
    replyTo: quote.email,
    subject: `Quote request — ${quote.business} (${total} stands)`,
    text: formatQuote(quote),
  });

  // Persisted whatever delivery did, so the lead survives a mail outage.
  try {
    await getStore().recordQuote({
      name: quote.name,
      business: quote.business,
      email: quote.email,
      phone: quote.phone ?? null,
      locations: quote.locations,
      standsPerLocation: quote.standsPerLocation,
      logoPrinting: quote.logoPrinting,
      notes: quote.notes ?? null,
      delivered,
    });
  } catch (error) {
    console.error('[quote] could not persist the lead', error);
    // Only alert when the email did not land either — otherwise the lead is
    // already sitting in the support inbox and nothing is lost.
    if (delivered !== 'email') {
      await alertOperator({
        subject: 'Quote lead may have been lost',
        lines: [
          'A multi-location quote could not be stored and its email did not send.',
          `Business: ${quote.business}`,
          `Contact: ${quote.name} <${quote.email}>`,
          `Total stands: ${total}`,
          `Delivery: ${delivered}`,
        ],
      });
    }
  }

  if (delivered === 'failed') {
    await alertOperator({
      subject: 'Quote notification failed to send',
      lines: [
        'The lead was stored but the notification email was rejected.',
        `Business: ${quote.business}`,
        `Contact: ${quote.name} <${quote.email}>`,
        `Total stands: ${total}`,
      ],
    });
  }

  return NextResponse.json({ ok: true, delivered });
}
