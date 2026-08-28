'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addOns,
  getCatalogItem,
  getStandTier,
  standTiers,
  type AddOn,
  type CatalogItem,
  type LinkMode,
  type Sku,
  type StandTier,
} from '@/data/products';
import { site } from '@/data/site';

export type StandColor = 'black' | 'white';

/**
 * A cart line stores what was chosen, never what it cost. Prices are looked up
 * from the catalog on every render and again on the server at checkout, so a
 * stale localStorage cart can never charge a stale price.
 */
export interface CartLine {
  readonly sku: Sku;
  readonly qty: number;
  readonly color?: StandColor;
  /** Stand packs only: one review link for the pack, or one per stand. */
  readonly linkMode?: LinkMode;
}

/** Two packs of the same size differ if their colour or link plan differs. */
export function lineKey(line: Pick<CartLine, 'sku' | 'color' | 'linkMode'>): string {
  return `${line.sku}:${line.color ?? '-'}:${line.linkMode ?? '-'}`;
}

interface CartState {
  lines: CartLine[];
  /** The customer's Google review page. Collected once, used to program every chip. */
  reviewLink: string;
  drawerOpen: boolean;
  add: (sku: Sku, qty?: number, options?: { color?: StandColor; linkMode?: LinkMode }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setReviewLink: (value: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      reviewLink: '',
      drawerOpen: false,

      // Does not open the drawer itself — a caller on /cart adding a
      // shipping-gap suggestion does not want the drawer popping open over
      // the page it is already looking at. Callers that do want it call
      // openDrawer() themselves after add().
      add: (sku, qty = 1, options) =>
        set((state) => {
          const item = getCatalogItem(sku);
          if (!item) return state;
          // Per-order services are charged once however many times they are added.
          const perOrder = item.kind === 'add-on' && item.perOrder;
          const color = options?.color;
          const linkMode = options?.linkMode;
          const key = lineKey({ sku, color, linkMode });
          const existing = state.lines.find((line) => lineKey(line) === key);
          if (existing) {
            if (perOrder) return state;
            return {
              ...state,
              lines: state.lines.map((line) =>
                lineKey(line) === key ? { ...line, qty: line.qty + qty } : line,
              ),
            };
          }
          return {
            ...state,
            lines: [...state.lines, { sku, qty: perOrder ? 1 : qty, color, linkMode }],
          };
        }),

      setQty: (key, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((line) => lineKey(line) !== key)
              : state.lines.map((line) => (lineKey(line) === key ? { ...line, qty } : line)),
        })),

      remove: (key) =>
        set((state) => ({ lines: state.lines.filter((line) => lineKey(line) !== key) })),

      clear: () => set({ lines: [] }),
      setReviewLink: (value) => set({ reviewLink: value }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: 'vouchify-cart-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines, reviewLink: state.reviewLink }),
      // Rehydration is deliberately manual. The server and the first client
      // render both start from an empty cart, so there is no mismatch; the
      // stored cart is read in an effect and components hold back counts and
      // totals until `useCartReady()` reports true.
      skipHydration: true,
    },
  ),
);

export function useCartReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const result = useCart.persist.rehydrate();
    if (result instanceof Promise) void result.then(() => setReady(true));
    else setReady(true);
  }, []);
  return ready;
}

/* -------------------------------------------------------------------------- */
/* Derived values — pure functions over lines, never stored                    */
/* -------------------------------------------------------------------------- */

export interface ResolvedLine {
  readonly key: string;
  readonly line: CartLine;
  readonly item: CatalogItem;
  readonly unitCents: number;
  readonly totalCents: number;
  readonly standCount: number;
}

export function resolveLines(lines: readonly CartLine[]): ResolvedLine[] {
  const resolved: ResolvedLine[] = [];
  for (const line of lines) {
    const item = getCatalogItem(line.sku);
    if (!item) continue; // A SKU pulled from the catalog is simply dropped.
    resolved.push({
      key: lineKey(line),
      line,
      item,
      unitCents: item.priceCents,
      totalCents: item.priceCents * line.qty,
      standCount: item.kind === 'stand-tier' ? item.qty * line.qty : 0,
    });
  }
  return resolved;
}

/** One sentence describing what a cart line actually is. Shared by the drawer,
 *  the cart page and the checkout summary so they cannot describe it differently. */
export function describeLine(line: CartLine, item: CatalogItem): string {
  const parts: string[] = [];
  if (line.color) parts.push(line.color === 'black' ? 'Black' : 'White');
  if (item.kind === 'stand-tier') {
    parts.push(`${item.qty} stand${item.qty === 1 ? '' : 's'} per pack`);
    if (line.linkMode === 'per-unit') parts.push('separate link per stand');
    else if (item.qty > 1) parts.push('one shared link');
  } else {
    parts.push(item.shortLine);
  }
  return parts.join(' · ');
}

/** True when any pack in the cart needs a different link encoded per stand. */
export function hasPerUnitLinks(lines: readonly CartLine[]): boolean {
  return lines.some((line) => line.linkMode === 'per-unit');
}

export function subtotalCents(lines: readonly CartLine[]): number {
  return resolveLines(lines).reduce((sum, line) => sum + line.totalCents, 0);
}

export function standCount(lines: readonly CartLine[]): number {
  return resolveLines(lines).reduce((sum, line) => sum + line.standCount, 0);
}

export function itemCount(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

/** Add more of a stackable add-on, or one unit of a per-order service, to
 *  close the gap. Never costs more than the shipping fee it would save,
 *  or it is not a saving at all. */
export interface AddOnSuggestion {
  readonly kind: 'add-on';
  readonly addOn: AddOn;
  readonly qty: number;
  readonly totalCents: number;
}

/** Move the cart's one stand-tier line up to a bigger pack that clears the
 *  threshold on its own. Allowed to cost more than the shipping saved,
 *  since the customer is buying more stands, not just dodging a fee. */
export interface TierUpgradeSuggestion {
  readonly kind: 'tier-upgrade';
  readonly fromLine: CartLine;
  readonly tier: StandTier;
  readonly extraCents: number;
}

export type ShippingSuggestion = AddOnSuggestion | TierUpgradeSuggestion | null;

export interface ShippingState {
  readonly qualifies: boolean;
  readonly remainingCents: number;
  readonly progress: number;
  readonly suggestion: ShippingSuggestion;
}

export function shippingState(lines: readonly CartLine[]): ShippingState {
  const subtotal = subtotalCents(lines);
  const threshold = site.freeShippingThresholdCents;
  const remaining = Math.max(0, threshold - subtotal);
  const shippingSaved = site.flatShippingCents;

  let suggestion: ShippingSuggestion = null;

  if (remaining > 0) {
    const inCart = new Set(lines.map((line) => line.sku));

    // (a) The cheapest add-on that closes the gap without costing more than
    // the shipping fee it saves. A per-order service can only be added once,
    // a stackable one (the plate) can be topped up by the unit.
    let bestAddOn: AddOnSuggestion | null = null;
    for (const addOn of addOns) {
      if (addOn.perOrder && inCart.has(addOn.id)) continue;
      const qty = addOn.perOrder ? 1 : Math.max(1, Math.ceil(remaining / addOn.priceCents));
      const totalCents = addOn.priceCents * qty;
      if (totalCents < remaining) continue; // does not close the gap
      if (totalCents > shippingSaved) continue; // costs more than it saves
      if (!bestAddOn || totalCents < bestAddOn.totalCents) {
        bestAddOn = { kind: 'add-on', addOn, qty, totalCents };
      }
    }

    // (b) Moving to a bigger pack, when the cart holds exactly one pack of
    // one tier, so there is no ambiguity about what "upgrade" means.
    const tierLines = lines.filter((line) => getCatalogItem(line.sku)?.kind === 'stand-tier');
    const [fromLine] = tierLines;
    let tierUpgrade: TierUpgradeSuggestion | null = null;
    if (tierLines.length === 1 && fromLine && fromLine.qty === 1) {
      const fromTier = getStandTier(fromLine.sku);
      if (fromTier) {
        const next = standTiers
          .filter((tier) => tier.priceCents > fromTier.priceCents)
          .sort((a, b) => a.priceCents - b.priceCents)
          .find((tier) => subtotal - fromTier.priceCents + tier.priceCents >= threshold);
        if (next) {
          tierUpgrade = {
            kind: 'tier-upgrade',
            fromLine,
            tier: next,
            extraCents: next.priceCents - fromTier.priceCents,
          };
        }
      }
    }

    // Prefer whichever leaves the customer better off: the smaller amount
    // spent beyond what free shipping actually saves them.
    if (bestAddOn && tierUpgrade) {
      const addOnNet = bestAddOn.totalCents - shippingSaved;
      const tierNet = tierUpgrade.extraCents - shippingSaved;
      suggestion = addOnNet <= tierNet ? bestAddOn : tierUpgrade;
    } else {
      suggestion = bestAddOn ?? tierUpgrade;
    }
  }

  return {
    qualifies: remaining === 0,
    remainingCents: remaining,
    progress: Math.min(1, subtotal / threshold),
    suggestion,
  };
}

export function shippingCents(lines: readonly CartLine[]): number {
  return shippingState(lines).qualifies ? 0 : site.flatShippingCents;
}
