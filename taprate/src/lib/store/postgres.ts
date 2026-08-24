import postgres from 'postgres';
import { newDashboardToken, newOrderId, newStandCode } from './codes';
import type {
  DailyCount,
  OrderRecord,
  ProvisionInput,
  Stand,
  StandStore,
  StandWithCounts,
} from './types';

/**
 * Postgres adapter, used whenever DATABASE_URL is set.
 *
 * Apply src/lib/store/schema.sql before first use.
 *
 * NOT YET RUN AGAINST A LIVE DATABASE — it was written and type-checked but
 * this session had no Postgres to point it at. Treat the first deploy as the
 * test: provision an order, tap a code, edit a link, and check the three tables.
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
}

interface StandRow {
  code: string;
  order_id: string;
  placement_number: number;
  placement_label: string;
  target_url: string;
  color: string;
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
  };
}

function toStand(row: StandRow): Stand {
  return {
    code: row.code,
    orderId: row.order_id,
    placementLabel: row.placement_label,
    placementNumber: row.placement_number,
    targetUrl: row.target_url,
    color: row.color === 'white' ? 'white' : 'black',
    createdAt: row.created_at.toISOString(),
    targetUpdatedAt: row.target_updated_at ? row.target_updated_at.toISOString() : null,
  };
}

export function createPostgresStore(): StandStore {
  return {
    async provisionOrder(input: ProvisionInput): Promise<OrderRecord> {
      const client = db();
      return client.begin(async (tx) => {
        // Idempotent on the Stripe session: a retried webhook or a refreshed
        // thank-you page must not mint a second set of codes.
        const existing = await tx<OrderRow[]>`
          SELECT * FROM orders WHERE checkout_session_id = ${input.checkoutSessionId}
        `;
        const found = existing[0];
        if (found) return toOrder(found);

        const id = newOrderId();
        const token = newDashboardToken();
        const inserted = await tx<OrderRow[]>`
          INSERT INTO orders (id, checkout_session_id, dashboard_token, email)
          VALUES (${id}, ${input.checkoutSessionId}, ${token}, ${input.email})
          RETURNING *
        `;

        for (const stand of input.stands) {
          // Retry on the vanishingly unlikely code collision rather than fail
          // the whole order.
          for (let attempt = 0; attempt < 5; attempt += 1) {
            const code = newStandCode();
            const rows = await tx`
              INSERT INTO stands (code, order_id, placement_number, placement_label, target_url, color)
              VALUES (${code}, ${id}, ${stand.placementNumber}, ${stand.placementLabel},
                      ${stand.targetUrl}, ${stand.color})
              ON CONFLICT (code) DO NOTHING
              RETURNING code
            `;
            if (rows.length > 0) break;
          }
        }

        return toOrder(inserted[0]!);
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
  };
}
