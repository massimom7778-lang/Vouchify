import { newDashboardToken, newOrderId, newQuoteId, newStandCode } from './codes';
import {
  EMPTY_ADDRESS,
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

interface MemoryState {
  orders: Map<string, OrderRecord>;
  stands: Map<string, Stand>;
  /** `${code}:${day}` -> count */
  taps: Map<string, number>;
  /** Append refs already applied, so a retry adds nothing. */
  appends: Set<string>;
  quotes: (QuoteInput & { id: string; createdAt: string })[];
}

/**
 * Development and test adapter. State lives in the process, so a serverless
 * deployment loses it between invocations — that is why getStore() refuses to
 * hand this out in production without an explicit override.
 *
 * The map survives hot reloads by hanging off globalThis, which matters when
 * you are provisioning a fake order and then clicking through the dashboard.
 */
const globalState = globalThis as typeof globalThis & { __vouchifyStore?: MemoryState };

function state(): MemoryState {
  if (!globalState.__vouchifyStore) {
    globalState.__vouchifyStore = {
      orders: new Map(),
      stands: new Map(),
      taps: new Map(),
      appends: new Set(),
      quotes: [],
    };
  }
  return globalState.__vouchifyStore;
}

function insertStands(
  store: MemoryState,
  orderId: string,
  createdAt: string,
  stands: readonly StandInput[],
): Stand[] {
  const added: Stand[] = [];
  for (const stand of stands) {
    let code = newStandCode();
    let attempts = 0;
    while (store.stands.has(code)) {
      code = newStandCode();
      attempts += 1;
      // Matches the Postgres adapter: never silently create fewer stands than
      // were paid for.
      if (attempts >= 5) {
        throw new Error(`Could not allocate a unique stand code for order ${orderId}.`);
      }
    }
    const record: Stand = {
      code,
      orderId,
      kind: stand.kind ?? 'stand',
      placementLabel: stand.placementLabel,
      placementNumber: stand.placementNumber,
      targetUrl: stand.targetUrl,
      color: stand.color,
      createdAt,
      targetUpdatedAt: null,
    };
    store.stands.set(code, record);
    added.push(record);
  }
  return added;
}

export function createMemoryStore(): StandStore {
  return {
    async provisionOrder(input: ProvisionInput): Promise<ProvisionResult> {
      const store = state();
      const existing = [...store.orders.values()].find(
        (order) => order.checkoutSessionId === input.checkoutSessionId,
      );
      if (existing) return { order: existing, created: false };

      const order: OrderRecord = {
        id: newOrderId(),
        checkoutSessionId: input.checkoutSessionId,
        dashboardToken: newDashboardToken(),
        email: input.email,
        createdAt: new Date().toISOString(),
        shipping: input.shipping ?? EMPTY_ADDRESS,
        fulfilledAt: null,
        confirmationSentAt: null,
      };
      store.orders.set(order.id, order);
      insertStands(store, order.id, order.createdAt, input.stands);
      return { order, created: true };
    },

    async appendStands(orderId, ref, stands): Promise<AppendResult | null> {
      const store = state();
      const order = store.orders.get(orderId);
      if (!order) return null;

      if (store.appends.has(ref)) return { order, added: [], created: false };
      store.appends.add(ref);

      const added = insertStands(store, order.id, new Date().toISOString(), stands);
      return { order, added, created: true };
    },

    async getStandByCode(code) {
      return state().stands.get(code) ?? null;
    },

    async getOrderByToken(token) {
      return [...state().orders.values()].find((order) => order.dashboardToken === token) ?? null;
    },

    async getOrderByCheckoutSession(checkoutSessionId) {
      return (
        [...state().orders.values()].find(
          (order) => order.checkoutSessionId === checkoutSessionId,
        ) ?? null
      );
    },

    async listStands(orderId, recentDays): Promise<StandWithCounts[]> {
      const store = state();
      const cutoff = new Date(Date.now() - recentDays * 86_400_000).toISOString().slice(0, 10);
      const stands = [...store.stands.values()]
        .filter((stand) => stand.orderId === orderId)
        .sort((a, b) => a.placementNumber - b.placementNumber);

      return stands.map((stand) => {
        let total = 0;
        let recent = 0;
        let lastTapDay: string | null = null;
        for (const [key, count] of store.taps) {
          const [code, day] = key.split(':');
          if (code !== stand.code || !day) continue;
          total += count;
          if (day >= cutoff) recent += count;
          if (!lastTapDay || day > lastTapDay) lastTapDay = day;
        }
        return { ...stand, totalTaps: total, recentTaps: recent, lastTapDay };
      });
    },

    async listRecentOrders(sinceDays): Promise<FulfillmentOrder[]> {
      const store = state();
      const cutoff = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
      return [...store.orders.values()]
        .filter((order) => order.createdAt >= cutoff)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((order) => ({
          ...order,
          stands: [...store.stands.values()]
            .filter((stand) => stand.orderId === order.id)
            .sort((a, b) => a.placementNumber - b.placementNumber),
        }));
    },

    async setFulfilled(orderId, fulfilled) {
      const store = state();
      const order = store.orders.get(orderId);
      if (!order) return false;
      store.orders.set(orderId, {
        ...order,
        fulfilledAt: fulfilled ? new Date().toISOString() : null,
      });
      return true;
    },

    async markConfirmationSent(orderId) {
      const store = state();
      const order = store.orders.get(orderId);
      // A single-threaded process means this read-then-write is already
      // atomic with respect to any other call in the same process — the
      // Postgres adapter is what actually needs a real database-level claim.
      if (!order || order.confirmationSentAt) return false;
      store.orders.set(orderId, { ...order, confirmationSentAt: new Date().toISOString() });
      return true;
    },

    async updateTarget(orderId, code, targetUrl) {
      const store = state();
      const stand = store.stands.get(code);
      // The order id comes from the token lookup, never from the request body.
      if (!stand || stand.orderId !== orderId) return false;
      store.stands.set(code, {
        ...stand,
        targetUrl,
        targetUpdatedAt: new Date().toISOString(),
      });
      return true;
    },

    async recordTap(code, day) {
      const store = state();
      const key = `${code}:${day}`;
      store.taps.set(key, (store.taps.get(key) ?? 0) + 1);
    },

    async dailyCounts(code, days): Promise<DailyCount[]> {
      const store = state();
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
      const out: DailyCount[] = [];
      for (const [key, count] of store.taps) {
        const [tapCode, day] = key.split(':');
        if (tapCode !== code || !day || day < cutoff) continue;
        out.push({ day, count });
      }
      return out.sort((a, b) => a.day.localeCompare(b.day));
    },

    async recordQuote(input) {
      state().quotes.push({ ...input, id: newQuoteId(), createdAt: new Date().toISOString() });
    },
  };
}
