import { NextResponse } from 'next/server';
import { getStore, utcDay } from '@/lib/store';
import { normaliseCode } from '@/lib/store/codes';
import { siteOrigin } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The forwarder. Every chip and every printed QR points here.
 *
 * A tap is one lookup, one counter increment, and a redirect. The chip is never
 * re-encoded, which is the whole reason changing a review link is free.
 *
 * What is recorded: the stand's counter for today, in UTC. Not the visitor, not
 * their address, not their agent, not a cookie. That is the commitment on the
 * privacy page and this is the only code that could break it.
 */

/** Link unfurlers and crawlers fetch these URLs. Their visits are not taps. */
function looksAutomated(request: Request): boolean {
  const agent = (request.headers.get('user-agent') ?? '').toLowerCase();
  if (!agent) return true;
  return /bot|crawler|spider|preview|facebookexternalhit|slackbot|whatsapp|discord|curl|wget|headless|monitor|python-requests|axios|lighthouse/.test(
    agent,
  );
}

/** Only ever redirect to a normal web page — never to a scheme that can act. */
function safeRedirectTarget(raw: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const origin = siteOrigin();
  const { code: rawCode } = await params;
  const code = normaliseCode(rawCode);

  if (!code) {
    return NextResponse.redirect(`${origin}/stand/unknown`, { status: 302 });
  }

  let target: string | null = null;
  let found = false;

  try {
    const store = getStore();
    const stand = await store.getStandByCode(code);
    if (stand) {
      found = true;
      target = safeRedirectTarget(stand.targetUrl);
      if (target && !looksAutomated(request)) {
        // Counting must never cost the customer their redirect.
        try {
          await store.recordTap(code, utcDay());
        } catch (error) {
          console.error('[forwarder] tap not recorded for %s', code, error);
        }
      }
    }
  } catch (error) {
    console.error('[forwarder] lookup failed for %s', code, error);
  }

  if (!found) {
    return NextResponse.redirect(`${origin}/stand/unknown`, { status: 302 });
  }

  if (!target) {
    return NextResponse.redirect(`${origin}/stand/not-set-up?code=${code}`, { status: 302 });
  }

  const response = NextResponse.redirect(target, { status: 302 });
  // A stand's target can change at any time; nothing about this may be cached.
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
