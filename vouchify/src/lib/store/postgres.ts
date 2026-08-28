import postgres from 'postgres';
import { newDashboardToken, newOrderId, newQuoteId, newStandCode } from './codes';
import {
  type AppendResult,
  type DailyCount,
  type FulfillmentOrder,
  type OrderRecord,
  type ProvisionInput,
  type ProvisionResult,
  type QuoteInput,
  type Stand,
  type StandInput,
  type StandStore,
  type StandWithCounts,
} from './types';

/**
 * Postgres adapter, used whenever DATABASE_URL is set.
 *
 * Apply src/lib/store/schema.sql before first use. That file is re-runnable,
 * so it is also the migration for a database created before the shipping
 * address, fulfilment flag, append log and quotes table existed.
 *
 * NOT YET RUN AGAINST A LIVE DATABASE — it was written and type-checked but
 * this session had no Postgres to point it at. Treat the first deploy as the
 * test: provision an order, tap a code, edit a link, and check the tables.
 */

let sql: ReturnType<typeof postgres> | null = null;

function db() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set.');
    sql = postgres(url, { max: 3, idle_timeout: 20, prepare: false });
  }
  return sql;
}

interface OrderRow {
  id: string;
  checkout_session_id: string;
  dashboard_token: string;
  email: string | null;
  created_at: Date;
  ship_name: string | null;
  ship_line1: string | null;
  ship_line2: string | null;
  ship_city: string | null;
  ship_region: string | null;
  ship_postal_code: string | null;
  ship_country: string | null;
  ship_phone: string | null;
  fulfilled_at: Date | null;
  confirmation_sent_at: Date | null;
}

interface StandRow {
  code: string;
  order_id: string;
  placement_number: number;
  placement_label: string;
  target_url: string;
  color: string;
  kind: string;
  created_at: Date;
  target_updated_at: Date | null;
}

function toOrder(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    checkoutSessionId: row.checkout_session_id,
    dashboardToken: row.dashboard_token,
    email: row.email,
    createdAt: row.created_at.toISOString(),
    shipping: {
      name: row.ship_name,
      line1: row.ship_line1,
      line2: row.ship_line2,
      city: row.ship_city,
      region: row.ship_region,
      postalCode: row.ship_postal_code,
      country: row.ship_country,
      phone: row.ship_phone,
    },
    fulfilledAt: row.fulfilled_at ? row.fulfilled_at.toISOString() : null,
    confirmationSentAt: row.confirmation_sent_at ? row.confirmation_sent_at.toISOString() : null,
  };
}

function toStand(row: StandRow): Stand {
  return {
    code: row.code,
    orderId: row.order_id,
    kind: row.kind === 'plate' ? 'plate' : 'stand',
    placementLabel: row.placement_label,
    placementNumber: row.placement_number,
    targetUrl: row.target_url,
    color: row.color === 'white' ? 'white' : 'black',
    createdAt: row.created_at.toISOString(),
    targetUpdatedAt: row.target_updated_at ? row.target_updated_at.toISOString() : null,
  };
}

/**
 * Inserts stands inside an open transaction, retrying only the code collision.
 *
 * Throws when it runs out of attempts. It used to break out of the loop having
 * inserted nothing, which committed an order with fewer stands than the
 * customer paid for and reported success — silent under-shipping with no
 * signal anywhere. Failing here rolls the transaction back and, on the webhook
 * path, returns a 500 that Stripe will retry.
 */
async function insertStands(
  tx: postgres.TransactionSql,
  orderId: string,
  stands: readonly StandInput[],
): Promise<Stand[]> {
  const added: Stand[] = [];
  for (const stand of stands) {
    let placed = false;
    for (let attempt = 0; attempt < 5 && !placed; attempt += 1) {
      const code = newStandCode();
      const rows = await tx<StandRow[]>`
        INSERT INTO stands (code, order_id, placement_number, placement_label, target_url, color, kind)
        VALUES (${code}, ${orderId}, ${stand.placementNumber}, ${stand.placementLabel},
                ${stand.targetUrl}, ${stand.color}, ${stand.kind ?? 'stand'})
        ON CONFLICT (code) DO NOTHING
        RETURNING *
      `;
      const row = rows[0];
      if (row) {
        added.push(toStand(row));
        placed = true;
      }
    }
    if (!placed) {
      throw new Error(
        `Could not allocate a unique stand code for order ${orderId} after 5 attempts. ` +
          'Nothing was committed; retry the webhook.',
      );
    }
  }
  return added;
}

export function createPostgresStore(): StandStore {
  return {
    async provisionOrder(input: ProvisionInput): Promise<ProvisionResult> {
      const client = db();
      return client.begin(async (tx): Promise<ProvisionResult> => {
        // Idempotent on the Stripe session: a retried webhook or a refreshed
        // thank-you page must not mint a second set of codes.
        const existing = await tx<OrderRow[]>`
          SELECT * FROM orders WHERE checkout_session_id = ${input.checkoutSessionId}
        `;
        const found = existing[0];
        if (found) return { order: toOrder(found), created: false };

        const id = newOrderId();
        const token = newDashboardToken();
        const ship = input.shipping;
        const inserted = await tx<OrderRow[]>`
          INSERT INTO orders (
            id, checkout_session_id, dashboard_token, email,
            ship_name, ship_line1, ship_line2, ship_city,
            ship_region, ship_postal_code, ship_country, ship_phone
          )
          VALUES (
            ${id}, ${input.checkoutSessionId}, ${token}, ${input.email},
            ${ship?.name ?? null}, ${ship?.line1 ?? null}, ${ship?.line2 ?? null},
            ${ship?.city ?? null}, ${ship?.region ?? null}, ${ship?.postalCode ?? null},
            ${ship?.country ?? null}, ${ship?.phone ?? null}
          )
          RETURNING *
        `;

        await insertStands(tx, id, input.stands);

        return { order: toOrder(inserted[0]!), created: true };
      });
    },

    async appendStands(orderId, ref, stands): Promise<AppendResult | null> {
      const client = db();
      return client.begin(async (tx): Promise<AppendResult | null> => {
        const orders = await tx<OrderRow[]>`SELECT * FROM orders WHERE id = ${orderId}`;
        const order = orders[0];
        if (!order) return null;

        // The primary key is the idempotency guard: a retried upsell webhook
        // reusing the same ref inserts nothing and adds no stands.
        const claim = await tx`
          INSERT INTO provision_events (ref, order_id, stand_count)
          VALUES (${ref}, ${orderId}, ${stands.length})
          ON CONFLICT (ref) DO NOTHING
          RETURNING ref
        `;
        if (claim.length === 0) {
          return { order: toOrder(order), added: [], created: false };
        }

        const added = await insertStands(tx, orderId, stands);
        return { order: toOrder(order), added, created: true };
      });
    },

    async getStandByCode(code) {
      const rows = await db()<StandRow[]>`SELECT * FROM stands WHERE code = ${code}`;
      return rows[0] ? toStand(rows[0]) : null;
    },

    async getOrderByToken(token) {
      const rows = await db()<OrderRow[]>`SELECT * FROM orders WHERE dashboard_token = ${token}`;
      return rows[0] ? toOrder(rows[0]) : null;
    },

    async getOrderByCheckoutSession(checkoutSessionId) {
      const rows = await db()<OrderRow[]>`
        SELECT * FROM orders WHERE checkout_session_id = ${checkoutSessionId}
      `;
      return rows[0] ? toOrder(rows[0]) : null;
    },

    async listStands(orderId, recentDays): Promise<StandWithCounts[]> {
      const rows = await db()<(StandRow & {
        total_taps: string | null;
        recent_taps: string | null;
        last_tap_day: Date | null;
      })[]>`
        SELECT s.*,
               COALESCE(SUM(t.count), 0)                                  AS total_taps,
               COALESCE(SUM(t.count) FILTER (
                 WHERE t.day >= CURRENT_DATE - ${recentDays}::int
               ), 0)                                                      AS recent_taps,
               MAX(t.day)                                                 AS last_tap_day
        FROM stands s
        LEFT JOIN tap_counts t ON t.stand_code = s.code
        WHERE s.order_id = ${orderId}
        GROUP BY s.code
        ORDER BY s.placement_number
      `;
      return rows.map((row) => ({
        ...toStand(row),
        totalTaps: Number(row.total_taps ?? 0),
        recentTaps: Number(row.recent_taps ?? 0),
        lastTapDay: row.last_tap_day ? row.last_tap_day.toISOString().slice(0, 10) : null,
      }));
    },

    async listRecentOrders(sinceDays): Promise<FulfillmentOrder[]> {
      const client = db();
      const orderRows = await client<OrderRow[]>`
        SELECT * FROM orders
        WHERE created_at >= now() - ${sinceDays}::int * INTERVAL '1 day'
        ORDER BY created_at DESC
      `;
      if (orderRows.length === 0) return [];

      const ids = orderRows.map((row) => row.id);
      const standRows = await client<StandRow[]>`
        SELECT * FROM stands
        WHERE order_id IN ${client(ids)}
        ORDER BY order_id, placement_number
      `;

      const byOrder = new Map<string, Stand[]>();
      for (const row of standRows) {
        const list = byOrder.get(row.order_id) ?? [];
        list.push(toStand(row));
        byOrder.set(row.order_id, list);
      }

      return orderRows.map((row) => ({
        ...toOrder(row),
        stands: byOrder.get(row.id) ?? [],
      }));
    },

    async setFulfilled(orderId, fulfilled) {
      const client = db();
      const rows = fulfilled
        ? await client`UPDATE orders SET fulfilled_at = now() WHERE id = ${orderId} RETURNING id`
        : await client`UPDATE orders SET fulfilled_at = NULL WHERE id = ${orderId} RETURNING id`;
      return rows.length > 0;
    },

    async markConfirmationSent(orderId) {
      // The WHERE clause is the claim: only a row that is still null can be
      // flipped, so of two concurrent callers exactly one gets a row back.
      const rows = await db()<{ id: string }[]>`
        UPDATE orders
        SET confirmation_sent_at = now()
        WHERE id = ${orderId} AND confirmation_sent_at IS NULL
        RETURNING id
      `;
      return rows.length > 0;
    },

    async updateTarget(orderId, code, targetUrl) {
      // order_id is in the WHERE clause on purpose: the token decides which
      // stands a request may touch, and the database enforces it too.
      const rows = await db()`
        UPDATE stands
        SET target_url = ${targetUrl}, target_updated_at = now()
        WHERE code = ${code} AND order_id = ${orderId}
        RETURNING code
      `;
      return rows.length > 0;
    },

    async recordTap(code, day) {
      await db()`
        INSERT INTO tap_counts (stand_code, day, count)
        VALUES (${code}, ${day}::date, 1)
        ON CONFLICT (stand_code, day) DO UPDATE SET count = tap_counts.count + 1
      `;
    },

    async dailyCounts(code, days): Promise<DailyCount[]> {
      const rows = await db()<{ day: Date; count: number }[]>`
        SELECT day, count FROM tap_counts
        WHERE stand_code = ${code} AND day >= CURRENT_DATE - ${days}::int
        ORDER BY day
      `;
      return rows.map((row) => ({ day: row.day.toISOString().slice(0, 10), count: row.count }));
    },

    async recordQuote(input: QuoteInput) {
      await db()`
        INSERT INTO quotes (
          id, name, business, email, phone, locations,
          stands_per_location, total_stands, logo_printing, notes, delivered
        )
        VALUES (
          ${newQuoteId()}, ${input.name}, ${input.business}, ${input.email},
          ${input.phone}, ${input.locations}, ${input.standsPerLocation},
          ${input.locations * input.standsPerLocation}, ${input.logoPrinting},
          ${input.notes}, ${input.delivered}
        )
      `;
    },
  };
}
