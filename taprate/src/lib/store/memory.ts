import { newDashboardToken, newOrderId, newStandCode } from './codes';
import type {
  DailyCount,
  OrderRecord,
  ProvisionInput,
  Stand,
  StandStore,
  StandWithCounts,
} from './types';

interface MemoryState {
  orders: Map<string, OrderRecord>;
  stands: Map<string, Stand>;
  /** `${code}:${day}` -> count */
  taps: Map<string, number>;
}

/**
 * Development and test adapter. State lives in the process, so a serverless
 * deployment loses it between invocations — that is why getStore() refuses to
 * hand this out in production without an explicit override.
 *
 * The map survives hot reloads by hanging off globalThis, which matters when
 * you are provisioning a fake order and then clicking through the dashboard.
 */
const globalState = globalThis as typeof globalThis & { __taprateStore?: MemoryState };

function state(): MemoryState {
  if (!globalState.__taprateStore) {
    globalState.__taprateStore = { orders: new Map(), stands: new Map(), taps: new Map() };
  }
  return globalState.__taprateStore;
}

export function createMemoryStore(): StandStore {
  return {
    async provisionOrder(input: ProvisionInput): Promise<OrderRecord> {
      const store = state();
      const existing = [...store.orders.values()].find(
        (order) => order.checkoutSessionId === input.checkoutSessionId,
      );
      if (existing) return existing;

      const order: OrderRecord = {
        id: newOrderId(),
        checkoutSessionId: input.checkoutSessionId,
        dashboardToken: newDashboardToken(),
        email: input.email,
        createdAt: new Date().toISOString(),
      };
      store.orders.set(order.id, order);

      for (const stand of input.stands) {
        let code = newStandCode();
        while (store.stands.has(code)) code = newStandCode();
        store.stands.set(code, {
          code,
          orderId: order.id,
          placementLabel: stand.placementLabel,
          placementNumber: stand.placementNumber,
          targetUrl: stand.targetUrl,
          color: stand.color,
          createdAt: order.createdAt,
          targetUpdatedAt: null,
        });
      }
      return order;
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
  };
}
