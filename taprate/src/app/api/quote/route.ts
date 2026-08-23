import { NextResponse } from 'next/server';
import { quoteRequestSchema } from '@/lib/schemas';
import { site } from '@/data/site';

export const runtime = 'nodejs';

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
 * Multi-location quote requests. Delivery degrades on purpose: with a Resend key
 * the quote is emailed, without one it is validated and logged so the form still
 * works on a fresh clone. Either way the submitter gets the same answer.
 */
export async function POST(request: Request) {
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
  const body = formatQuote(quote);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info('[quote] no RESEND_API_KEY set, logging instead\n%s', body);
    return NextResponse.json({ ok: true, delivered: 'logged' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.QUOTE_FROM_EMAIL ?? `quotes@${new URL(site.url).hostname}`,
        to: [site.supportEmail],
        reply_to: quote.email,
        subject: `Quote request — ${quote.business} (${quote.locations * quote.standsPerLocation} stands)`,
        text: body,
      }),
    });

    if (!response.ok) {
      console.error('[quote] resend rejected the send: %s\n%s', response.status, body);
      return NextResponse.json({ ok: true, delivered: 'logged' });
    }
  } catch (error) {
    console.error('[quote] resend request failed', error, '\n', body);
    return NextResponse.json({ ok: true, delivered: 'logged' });
  }

  return NextResponse.json({ ok: true, delivered: 'email' });
}
