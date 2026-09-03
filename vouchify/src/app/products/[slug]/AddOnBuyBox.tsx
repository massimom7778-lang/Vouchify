'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { EVENTS, dollars, emit } from '@/lib/analytics';
import { useCart } from '@/lib/cart';
import type { AddOn } from '@/data/products';

/**
 * The buy box for a standalone add-on's own product page.
 *
 * A per-unit product (the review plate) gets a real quantity stepper, exactly
 * like the stand's own buy box, because it is bought the same way: on its
 * own, in whatever count the shop needs. A per-order service (there are none
 * with their own page today, but the type allows it) is bought once per
 * order regardless, so it keeps a plain single-click button instead of a
 * quantity control that would imply otherwise.
 */
export function AddOnBuyBox({ addOn }: { addOn: AddOn }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const stackable = !addOn.perOrder;

  function handleAdd() {
    const addedQty = stackable ? qty : 1;
    add(addOn.id, addedQty);
    emit(EVENTS.addToCart, {
      sku: addOn.id,
      qty: addedQty,
      value: dollars(addOn.priceCents * addedQty),
    });
    openDrawer();
    if (stackable) setQty(1);
  }

  return (
    <div className="mt-6">
      {stackable ? (
        <div className="mb-3 flex items-center gap-3">
          <span className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
            Quantity
          </span>
          <div className="flex items-center rounded-sm border border-warm-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="grid h-9 w-9 place-items-center text-lg leading-none text-warm-700 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setQty((current) => Math.max(1, current - 1))}
              disabled={qty <= 1}
            >
              −
            </button>
            <span data-numeric className="w-8 text-center text-sm font-semibold">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="grid h-9 w-9 place-items-center text-lg leading-none text-warm-700 hover:text-ink"
              onClick={() => setQty((current) => Math.min(99, current + 1))}
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <Button size="lg" block onClick={handleAdd}>
        {stackable && qty > 1 ? `Add ${qty} to cart` : 'Add to cart'}
      </Button>
    </div>
  );
}
