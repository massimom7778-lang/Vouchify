import {
  getCatalogItem,
  orderBump,
  getAddOn,
  type CatalogItem,
} from '@/data/products';
import { site } from '@/data/site';
import type { CheckoutRequest } from '@/lib/schemas';

export interface PricedLine {
  readonly item: CatalogItem;
  readonly qty: number;
  readonly color?: 'black' | 'white';
  readonly unitCents: number;
  readonly totalCents: number;
  readonly label: string;
}

export interface PricedOrder {
  readonly lines: readonly PricedLine[];
  readonly subtotalCents: number;
  readonly shippingCents: number;
  readonly totalCents: number;
  readonly standCount: number;
}

/**
 * The only place an order total is calculated for payment. It reads the catalog,
 * never the request body, so a tampered client payload changes what is bought
 * but never what it costs.
 */
export function priceOrder(request: CheckoutRequest): PricedOrder {
  const lines: PricedLine[] = [];
  let standCount = 0;

  for (const requested of request.lines) {
    const item = getCatalogItem(requested.sku);
    if (!item) continue;
    const perOrder = item.kind === 'add-on' && item.perOrder;
    const qty = perOrder ? 1 : requested.qty;
    const color = item.kind === 'stand-tier' ? requested.color : undefined;

    if (item.kind === 'stand-tier') standCount += item.qty * qty;

    lines.push({
      item,
      qty,
      color,
      unitCents: item.priceCents,
      totalCents: item.priceCents * qty,
      label:
        item.kind === 'stand-tier'
          ? `${item.name}${color ? `, ${color}` : ''}`
          : item.name,
    });
  }

  if (request.bump) {
    const bumpItem = getAddOn(orderBump.addOnId);
    // The bump price lives in the catalog too — the client cannot name a price.
    if (bumpItem?.bumpPriceCents !== undefined) {
      lines.push({
        item: bumpItem,
        qty: 1,
        unitCents: bumpItem.bumpPriceCents,
        totalCents: bumpItem.bumpPriceCents,
        label: `${bumpItem.name} (added at checkout)`,
      });
    }
  }

  const subtotal = lines.reduce((sum, line) => sum + line.totalCents, 0);
  const shipping =
    subtotal >= site.freeShippingThresholdCents ? 0 : site.flatShippingCents;

  return {
    lines,
    subtotalCents: subtotal,
    shippingCents: shipping,
    totalCents: subtotal + shipping,
    standCount,
  };
}
