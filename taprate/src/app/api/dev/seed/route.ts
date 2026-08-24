import { NextResponse } from 'next/server';
import { provisionDemoOrder } from '@/lib/provision';
import { siteOrigin } from '@/lib/stripe';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Provisions a demo order so the forwarder and the dashboard can be exercised
 * without going through Stripe.
 *
 * Off unless ENABLE_DEV_SEED=1, and refused outright in production even then —
 * this mints working dashboard tokens, and a public endpoint that does that is
 * a way to fill someone's database with junk orders.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEV_SEED !== '1') {
    return NextResponse.json({ ok: false, error: 'Not available.' }, { status: 404 });
  }

  const url = new URL(request.url);
  const requested = Number(url.searchParams.get('stands') ?? 5);
  const count = Number.isFinite(requested) ? requested : 5;

  const order = await provisionDemoOrder(count);
  const stands = await getStore().listStands(order.id, 30);
  const origin = siteOrigin();

  return NextResponse.json({
    ok: true,
    dashboard: `${origin}/dashboard/${order.dashboardToken}`,
    stands: stands.map((stand) => ({
      code: stand.code,
      placement: stand.placementLabel,
      tapUrl: `${origin}/r/${stand.code}`,
    })),
  });
}
