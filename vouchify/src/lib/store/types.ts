/**
 * The forwarder's data model.
 *
 * A chip is encoded once, with a short Vouchify address, and never again. What
 * changes afterwards is the row in this store — which is the entire reason link
 * changes are free and why a stand can be re-pointed without touching it.
 *
 * Tap counts are stored as daily totals per stand and nothing else. There is no
 * per-visitor row to lose, correlate, or subpoena, which is exactly what the
 * privacy page promises.
 */

export interface Stand {
  /** The short code printed on the chip and the QR. Immutable. */
  readonly code: string;
  readonly orderId: string;
  /** Which placement this stand was packed for, e.g. "Checkout counter". */
  readonly placementLabel: string;
  readonly placementNumber: number;
  /** Where a tap goes. Empty until the owner supplies a review link. */
  readonly targetUrl: string;
  readonly color: 'black' | 'white';
  readonly createdAt: string;
  readonly targetUpdatedAt: string | null;
}

export interface OrderRecord {
  readonly id: string;
  /** Stripe Checkout Session id. Provisioning is idempotent on this. */
  readonly checkoutSessionId: string;
  /** The secret in the dashboard link printed on the card in the box. */
  readonly dashboardToken: string;
  readonly email: string | null;
  readonly createdAt: string;
}

export interface DailyCount {
  /** ISO date, YYYY-MM-DD, in UTC. */
  readonly day: string;
  readonly count: number;
}

export interface StandWithCounts extends Stand {
  readonly totalTaps: number;
  readonly recentTaps: number;
  readonly lastTapDay: string | null;
}

export interface ProvisionInput {
  readonly checkoutSessionId: string;
  readonly email: string | null;
  /** One entry per physical stand in the order. */
  readonly stands: readonly {
    readonly placementNumber: number;
    readonly placementLabel: string;
    readonly color: 'black' | 'white';
    readonly targetUrl: string;
  }[];
}

export interface ProvisionResult {
  readonly order: OrderRecord;
  /** False when this session had already been provisioned. Lets a caller send
   *  the confirmation email exactly once across webhook retries. */
  readonly created: boolean;
}

export interface StandStore {
  /** Creates the order and its stands. Safe to call repeatedly for one session. */
  provisionOrder(input: ProvisionInput): Promise<ProvisionResult>;
  getStandByCode(code: string): Promise<Stand | null>;
  getOrderByToken(token: string): Promise<OrderRecord | null>;
  getOrderByCheckoutSession(checkoutSessionId: string): Promise<OrderRecord | null>;
  listStands(orderId: string, recentDays: number): Promise<StandWithCounts[]>;
  /** Rejected unless the stand belongs to the order the token opens. */
  updateTarget(orderId: string, code: string, targetUrl: string): Promise<boolean>;
  /** Increments the stand's total for the given UTC day. */
  recordTap(code: string, day: string): Promise<void>;
  dailyCounts(code: string, days: number): Promise<DailyCount[]>;
}

export function utcDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
