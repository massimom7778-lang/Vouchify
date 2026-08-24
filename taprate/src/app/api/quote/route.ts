import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
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
  const total = quote.locations * quote.standsPerLocation;

  const delivered = await sendEmail({
    to: site.supportEmail,
    replyTo: quote.email,
    subject: `Quote request — ${quote.business} (${total} stands)`,
    text: formatQuote(quote),
  });

  return NextResponse.json({ ok: true, delivered });
}
