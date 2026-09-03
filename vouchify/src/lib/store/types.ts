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

/**
 * A stand is the physical counter unit; a plate is the flat NFC square that
 * mounts where a stand cannot. Both are one NTAG215 chip, one short code, and
 * one row in this table — a plate is not a lesser thing tracked elsewhere, it
 * is the same kind of record with a different label and no shop-placement
 * position. `kind` is what every reader (the dashboard, the packing list,
 * the CSV export) branches on to tell them apart.
 */
export type StandKind = 'stand' | 'plate';

export interface Stand {
  /** The short code printed on the chip and the QR. Immutable. */
  readonly code: string;
  readonly orderId: string;
  readonly kind: StandKind;
  /** Which placement this stand was packed for, e.g. "Checkout counter".
   *  For a plate this is just "Review plate" (or numbered, past the first) —
   *  plates do not have a position in the shop-placement sequence. */
  readonly placementLabel: string;
  readonly placementNumber: number;
  /** Where a tap goes. Empty until the owner supplies a review link. */
  readonly targetUrl: string;
  /** Meaningful for a stand's actual finish. A plate ships in one fixed blue
   *  and white finish regardless of this value — readers branch on `kind`
   *  before ever looking at `color`. */
  readonly color: 'black' | 'white';
  readonly createdAt: string;
  readonly targetUpdatedAt: string | null;
}

/**
 * The shipping address, flattened.
 *
 * Kept as columns rather than a JSON blob because the only thing that reads it
 * is a packing list, and a packing list wants to print fields.
 */
export interface ShippingAddress {
  readonly name: string | null;
  readonly line1: string | null;
  readonly line2: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly postalCode: string | null;
  readonly country: string | null;
  readonly phone: string | null;
}

export const EMPTY_ADDRESS: ShippingAddress = {
  name: null,
  line1: null,
  line2: null,
  city: null,
  region: null,
  postalCode: null,
  country: null,
  phone: null,
};

export interface OrderRecord {
  readonly id: string;
  /** Stripe Checkout Session id. Provisioning is idempotent on this. */
  readonly checkoutSessionId: string;
  /** The secret in the dashboard link printed on the card in the box. */
  readonly dashboardToken: string;
  readonly email: string | null;
  readonly createdAt: string;
  /** Where the box goes. Null on orders provisioned before this was captured. */
  readonly shipping: ShippingAddress;
  /** Set when the operator marks the order packed and encoded. */
  readonly fulfilledAt: string | null;
  /** Set the first time the order confirmation email is actually sent. Null
   *  means no one has sent it yet — see `markConfirmationSent`. */
  readonly confirmationSentAt: string | null;
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

/** One physical stand or plate to create. Shared by the initial order and
 *  later appends. `kind` defaults to 'stand' when omitted, so every existing
 *  call site that only ever built stands keeps compiling unchanged. */
export interface StandInput {
  readonly placementNumber: number;
  readonly placementLabel: string;
  readonly color: 'black' | 'white';
  readonly targetUrl: string;
  readonly kind?: StandKind;
}

export interface ProvisionInput {
  readonly checkoutSessionId: string;
  readonly email: string | null;
  readonly shipping?: ShippingAddress;
  /** One entry per physical stand in the order. */
  readonly stands: readonly StandInput[];
}

export interface ProvisionResult {
  readonly order: OrderRecord;
  /** False when this session had already been provisioned. Lets a caller send
   *  the confirmation email exactly once across webhook retries. */
  readonly created: boolean;
}

export interface AppendResult {
  readonly order: OrderRecord;
  /** The stands this call actually created. Empty when `ref` was already
   *  applied, which is what makes a retried upsell webhook safe. */
  readonly added: readonly Stand[];
  readonly created: boolean;
}

/** An order and its stands, for the packing list. */
export interface FulfillmentOrder extends OrderRecord {
  readonly stands: readonly Stand[];
}

export interface QuoteInput {
  readonly name: string;
  readonly business: string;
  readonly email: string;
  readonly phone: string | null;
  readonly locations: number;
  readonly standsPerLocation: number;
  readonly logoPrinting: boolean;
  readonly notes: string | null;
  /** Whether the notification email actually went out. */
  readonly delivered: string;
}

export interface StandStore {
  /** Creates the order and its stands. Safe to call repeatedly for one session. */
  provisionOrder(input: ProvisionInput): Promise<ProvisionResult>;
  /**
   * Adds stands to an order that already exists, continuing its placement
   * numbering. `ref` makes it exactly-once: a retried upsell charge or webhook
   * that reuses the same ref adds nothing the second time.
   */
  appendStands(
    orderId: string,
    ref: string,
    stands: readonly StandInput[],
  ): Promise<AppendResult | null>;
  getStandByCode(code: string): Promise<Stand | null>;
  getOrderByToken(token: string): Promise<OrderRecord | null>;
  getOrderByCheckoutSession(checkoutSessionId: string): Promise<OrderRecord | null>;
  listStands(orderId: string, recentDays: number): Promise<StandWithCounts[]>;
  /** The packing list: orders created in the window, each with its stands. */
  listRecentOrders(sinceDays: number): Promise<FulfillmentOrder[]>;
  /** Marks an order packed and encoded, or clears the mark. */
  setFulfilled(orderId: string, fulfilled: boolean): Promise<boolean>;
  /**
   * Atomically claims the right to send this order's confirmation email:
   * flips `confirmation_sent_at` from null to now() and reports whether THIS
   * call was the one that did it. Two callers racing on the same order (the
   * thank-you page's server render and the Stripe webhook) can both ask at
   * nearly the same moment — only one may win, so the email goes out once
   * regardless of which path actually created the order, or whether the
   * other path's request was killed before it got this far.
   */
  markConfirmationSent(orderId: string): Promise<boolean>;
  /** Rejected unless the stand belongs to the order the token opens. */
  updateTarget(orderId: string, code: string, targetUrl: string): Promise<boolean>;
  /** Increments the stand's total for the given UTC day. */
  recordTap(code: string, day: string): Promise<void>;
  dailyCounts(code: string, days: number): Promise<DailyCount[]>;
  /** Every quote submission, kept whether or not the email got through. */
  recordQuote(input: QuoteInput): Promise<void>;
}

export function utcDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
