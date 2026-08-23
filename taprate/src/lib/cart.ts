'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addOns,
  getCatalogItem,
  type AddOn,
  type CatalogItem,
  type Sku,
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
}

export function lineKey(line: Pick<CartLine, 'sku' | 'color'>): string {
  return `${line.sku}:${line.color ?? '-'}`;
}

interface CartState {
  lines: CartLine[];
  /** The customer's Google review page. Collected once, used to program every chip. */
  reviewLink: string;
  drawerOpen: boolean;
  add: (sku: Sku, qty?: number, color?: StandColor) => void;
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

      add: (sku, qty = 1, color) =>
        set((state) => {
          const item = getCatalogItem(sku);
          if (!item) return state;
          // Per-order services are charged once however many times they are added.
          const perOrder = item.kind === 'add-on' && item.perOrder;
          const key = lineKey({ sku, color });
          const existing = state.lines.find((line) => lineKey(line) === key);
          if (existing) {
            if (perOrder) return { ...state, drawerOpen: true };
            return {
              ...state,
              drawerOpen: true,
              lines: state.lines.map((line) =>
                lineKey(line) === key ? { ...line, qty: line.qty + qty } : line,
              ),
            };
          }
          return {
            ...state,
            drawerOpen: true,
            lines: [...state.lines, { sku, qty: perOrder ? 1 : qty, color }],
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
      name: 'taprate-cart-v1',
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

export function subtotalCents(lines: readonly CartLine[]): number {
  return resolveLines(lines).reduce((sum, line) => sum + line.totalCents, 0);
}

export function standCount(lines: readonly CartLine[]): number {
  return resolveLines(lines).reduce((sum, line) => sum + line.standCount, 0);
}

export function itemCount(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export interface ShippingState {
  readonly qualifies: boolean;
  readonly remainingCents: number;
  readonly progress: number;
  /** The cheapest add-on not already in the cart that would close the gap. */
  readonly suggestion: AddOn | null;
}

export function shippingState(lines: readonly CartLine[]): ShippingState {
  const subtotal = subtotalCents(lines);
  const threshold = site.freeShippingThresholdCents;
  const remaining = Math.max(0, threshold - subtotal);
  const inCart = new Set(lines.map((line) => line.sku));

  const suggestion =
    remaining === 0
      ? null
      : (addOns
          .filter((addOn) => !inCart.has(addOn.id) && addOn.priceCents >= remaining)
          .sort((a, b) => a.priceCents - b.priceCents)[0] ?? null);

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
