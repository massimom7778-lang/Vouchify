import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin-auth';
import { getStore, isStorePersistent, type FulfillmentOrder } from '@/lib/store';
import { describeCounts } from '@/lib/format';
import { site } from '@/data/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The daily packing list.
 *
 * Everything needed to encode and ship a day's orders on one screen: what to
 * encode (the codes), what to put in the box (quantity, colour), where it goes,
 * and which link each chip points at. Without it fulfilment means cross
 * referencing the Stripe dashboard against hand-written SQL for every order.
 *
 *   GET /admin/fulfillment?token=...              HTML
 *   GET /admin/fulfillment?token=...&format=csv   one row per stand
 *   GET /admin/fulfillment?token=...&days=14      window, default 7
 *   POST /admin/fulfillment                       mark packed / unpacked
 *
 * Deliberately noindex, no-store, and never linked from the site.
 */

const DEFAULT_DAYS = 7;
const MAX_DAYS = 90;

const SECURITY_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
} as const;

function windowDays(url: URL): number {
  const raw = Number(url.searchParams.get('days') ?? DEFAULT_DAYS);
  if (!Number.isFinite(raw)) return DEFAULT_DAYS;
  return Math.min(Math.max(Math.trunc(raw), 1), MAX_DAYS);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function csvCell(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function linkPlan(order: FulfillmentOrder): string {
  const targets = new Set(order.stands.map((stand) => stand.targetUrl));
  if (order.stands.length === 0) return 'no stands';
  if (targets.size === 1) {
    const only = order.stands[0]?.targetUrl ?? '';
    return only ? 'one shared link' : 'link not set yet';
  }
  return 'a link per stand';
}

function sharedTarget(order: FulfillmentOrder): string {
  const targets = new Set(order.stands.map((stand) => stand.targetUrl));
  return targets.size === 1 ? (order.stands[0]?.targetUrl ?? '') : '';
}

/** Plates have no shop-placement position and a fixed finish, so several
 *  facts on this page (colour, the shared "stand_count" column) only make
 *  sense computed over the stand-kind rows. */
function splitByKind(order: FulfillmentOrder): {
  standItems: FulfillmentOrder['stands'][number][];
  plateItems: FulfillmentOrder['stands'][number][];
} {
  const standItems = order.stands.filter((stand) => stand.kind !== 'plate');
  const plateItems = order.stands.filter((stand) => stand.kind === 'plate');
  return { standItems, plateItems };
}

function addressLines(order: FulfillmentOrder): string[] {
  const { shipping } = order;
  const region = [shipping.city, shipping.region, shipping.postalCode]
    .filter(Boolean)
    .join(' ');
  return [
    shipping.name,
    shipping.line1,
    shipping.line2,
    region || null,
    shipping.country,
    shipping.phone,
  ].filter((line): line is string => Boolean(line));
}

function toCsv(orders: FulfillmentOrder[]): string {
  const header = [
    'order_id',
    'created_at',
    'fulfilled_at',
    'email',
    'stand_count',
    'plate_count',
    'colour',
    'link_plan',
    'shared_target',
    'ship_name',
    'ship_line1',
    'ship_line2',
    'ship_city',
    'ship_region',
    'ship_postal',
    'ship_country',
    'ship_phone',
    'item_kind',
    'stand_code',
    'placement_number',
    'placement_label',
    'stand_target',
  ];

  const rows: string[] = [header.join(',')];
  for (const order of orders) {
    const { standItems } = splitByKind(order);
    const base = [
      order.id,
      order.createdAt,
      order.fulfilledAt ?? '',
      order.email ?? '',
      standItems.length,
      order.stands.length - standItems.length,
      standItems[0]?.color ?? '',
      linkPlan(order),
      sharedTarget(order),
      order.shipping.name ?? '',
      order.shipping.line1 ?? '',
      order.shipping.line2 ?? '',
      order.shipping.city ?? '',
      order.shipping.region ?? '',
      order.shipping.postalCode ?? '',
      order.shipping.country ?? '',
      order.shipping.phone ?? '',
    ];
    // One row per stand or plate: the encoding bench works unit by unit.
    if (order.stands.length === 0) {
      rows.push([...base, '', '', '', '', ''].map(csvCell).join(','));
      continue;
    }
    for (const stand of order.stands) {
      rows.push(
        [
          ...base,
          stand.kind,
          stand.code,
          stand.placementNumber,
          stand.placementLabel,
          stand.targetUrl,
        ]
          .map(csvCell)
          .join(','),
      );
    }
  }
  return rows.join('\n');
}

function renderHtml(orders: FulfillmentOrder[], days: number, token: string): string {
  const pending = orders.filter((order) => !order.fulfilledAt);
  const pendingStandCount = pending.reduce(
    (sum, order) => sum + splitByKind(order).standItems.length,
    0,
  );
  const pendingPlateCount = pending.reduce(
    (sum, order) => sum + splitByKind(order).plateItems.length,
    0,
  );

  const cards = orders
    .map((order) => {
      const done = Boolean(order.fulfilledAt);
      const address = addressLines(order);
      const target = sharedTarget(order);
      const { standItems, plateItems } = splitByKind(order);

      const standRows = order.stands
        .map(
          (stand) => `
            <tr>
              <td class="code">${escapeHtml(stand.code)}</td>
              <td>${escapeHtml(String(stand.placementNumber))}. ${escapeHtml(stand.placementLabel)}</td>
              <td class="muted">${stand.targetUrl ? escapeHtml(stand.targetUrl) : 'not set'}</td>
            </tr>`,
        )
        .join('');

      return `
      <article class="order ${done ? 'done' : ''}">
        <header>
          <div>
            <h2>${escapeHtml(order.id)}</h2>
            <p class="muted">
              ${escapeHtml(new Date(order.createdAt).toLocaleString('en-CA'))}
              · ${escapeHtml(order.email ?? 'no email')}
            </p>
          </div>
          <form method="post" action="/admin/fulfillment">
            <input type="hidden" name="token" value="${escapeHtml(token)}" />
            <input type="hidden" name="orderId" value="${escapeHtml(order.id)}" />
            <input type="hidden" name="days" value="${days}" />
            <input type="hidden" name="fulfilled" value="${done ? '0' : '1'}" />
            <button type="submit">${done ? 'Mark not packed' : 'Mark packed'}</button>
          </form>
        </header>

        <dl class="facts">
          <div><dt>Quantity</dt><dd>${escapeHtml(describeCounts(standItems.length, plateItems.length))}</dd></div>
          <div><dt>Colour</dt><dd>${escapeHtml(standItems[0]?.color ?? (plateItems.length ? 'n/a (plate only)' : '—'))}</dd></div>
          <div><dt>Link plan</dt><dd>${escapeHtml(linkPlan(order))}</dd></div>
          <div><dt>Shared link</dt><dd class="wrap">${target ? escapeHtml(target) : '—'}</dd></div>
        </dl>

        <div class="cols">
          <section>
            <h3>Encode</h3>
            <table>
              <thead><tr><th>Code</th><th>Placement</th><th>Points at</th></tr></thead>
              <tbody>${standRows || '<tr><td colspan="3" class="muted">Nothing to encode on this order.</td></tr>'}</tbody>
            </table>
          </section>
          <section>
            <h3>Ship to</h3>
            ${
              address.length
                ? `<address>${address.map((line) => escapeHtml(line)).join('<br />')}</address>`
                : '<p class="muted">No address captured. Check Stripe for this order.</p>'
            }
          </section>
        </div>
      </article>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Fulfillment — ${escapeHtml(site.name)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 1.5rem; background: #fafaf8; color: #15151a;
         font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }
  h1 { font-size: 1.5rem; margin: 0 0 .25rem; }
  .bar { display: flex; flex-wrap: wrap; gap: 1rem; align-items: baseline;
         justify-content: space-between; margin-bottom: 1.5rem; }
  .muted { color: #5b5a56; }
  .warn { background: #fff4d6; border: 1px solid #e0c477; padding: .75rem 1rem;
          border-radius: 8px; margin-bottom: 1.25rem; }
  .order { border: 1px solid #e3e0d8; border-radius: 10px; background: #fff;
           padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .order.done { opacity: .55; }
  .order > header { display: flex; gap: 1rem; align-items: flex-start;
                    justify-content: space-between; }
  h2 { font-size: 1rem; font-family: ui-monospace, monospace; margin: 0; }
  h3 { font-size: .75rem; text-transform: uppercase; letter-spacing: .08em;
       color: #5b5a56; margin: 0 0 .5rem; }
  .facts { display: flex; flex-wrap: wrap; gap: 1.5rem; margin: 1rem 0;
           padding: .75rem 0; border-block: 1px solid #e3e0d8; }
  .facts div { min-width: 0; }
  dt { font-size: .7rem; text-transform: uppercase; letter-spacing: .08em; color: #5b5a56; }
  dd { margin: .15rem 0 0; font-weight: 600; }
  .wrap { overflow-wrap: anywhere; font-weight: 400; font-size: .85rem; }
  .cols { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
  @media (min-width: 720px) { .cols { grid-template-columns: 2fr 1fr; } }
  table { width: 100%; border-collapse: collapse; font-size: .9rem; }
  th { text-align: left; font-size: .7rem; text-transform: uppercase;
       letter-spacing: .08em; color: #5b5a56; border-bottom: 1px solid #e3e0d8;
       padding: .35rem .5rem .35rem 0; }
  td { padding: .35rem .5rem .35rem 0; border-bottom: 1px solid #f0eee8;
       overflow-wrap: anywhere; }
  .code { font-family: ui-monospace, monospace; font-weight: 700; font-size: 1rem;
          letter-spacing: .05em; white-space: nowrap; }
  address { font-style: normal; }
  button { font: inherit; cursor: pointer; border: 1px solid #15151a;
           background: #15151a; color: #fff; padding: .4rem .8rem; border-radius: 6px; }
  .order.done button { background: #fff; color: #15151a; }
  a { color: #15151a; }
</style>
</head>
<body>
  <div class="bar">
    <div>
      <h1>Fulfillment</h1>
      <p class="muted">
        Last ${days} days · ${orders.length} orders ·
        <strong>${pending.length} to pack (${escapeHtml(describeCounts(pendingStandCount, pendingPlateCount))})</strong>
      </p>
    </div>
    <p class="muted">
      <a href="/admin/fulfillment?token=${encodeURIComponent(token)}&days=${days}&format=csv">Download CSV</a>
    </p>
  </div>
  ${
    isStorePersistent()
      ? ''
      : '<p class="warn"><strong>No database attached.</strong> This deployment is using the in-memory store, so this list is whatever this one instance happens to hold. Set DATABASE_URL.</p>'
  }
  ${cards || '<p class="muted">No orders in this window.</p>'}
</body>
</html>`;
}

export async function GET(request: Request) {
  const auth = checkAdmin(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: SECURITY_HEADERS },
    );
  }

  const url = new URL(request.url);
  const days = windowDays(url);
  const orders = await getStore().listRecentOrders(days);

  if (url.searchParams.get('format') === 'csv') {
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(toCsv(orders), {
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vouchify-fulfillment-${stamp}.csv"`,
      },
    });
  }

  const token = url.searchParams.get('token') ?? '';
  return new NextResponse(renderHtml(orders, days, token), {
    headers: { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/** Marks an order packed, or clears the mark, then returns to the list. */
export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get('token') ?? '');

  // The form posts the token in its body, so authorise against that.
  const authRequest = new Request(`${new URL(request.url).origin}/admin/fulfillment`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const auth = checkAdmin(authRequest);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status, headers: SECURITY_HEADERS },
    );
  }

  const orderId = String(form.get('orderId') ?? '');
  const fulfilled = String(form.get('fulfilled') ?? '') === '1';
  const days = Number(form.get('days') ?? DEFAULT_DAYS);

  if (orderId) await getStore().setFulfilled(orderId, fulfilled);

  const back = new URL('/admin/fulfillment', new URL(request.url).origin);
  back.searchParams.set('token', token);
  back.searchParams.set('days', String(Number.isFinite(days) ? days : DEFAULT_DAYS));
  return NextResponse.redirect(back, { status: 303, headers: SECURITY_HEADERS });
}
