import {
  getCatalogItem,
  orderBump,
  getAddOn,
  PLATE_SKU,
  type CatalogItem,
  type LinkMode,
} from '@/data/products';
import { site } from '@/data/site';
import type { CheckoutRequest } from '@/lib/schemas';

export interface PricedLine {
  readonly item: CatalogItem;
  readonly qty: number;
  readonly color?: 'black' | 'white';
  readonly linkMode?: LinkMode;
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
  /** Review plates in the order — the checkout order-bump line included.
   *  Tracked separately from standCount because a plate is provisioned as
   *  its own trackable unit, not folded into a stand pack. */
  readonly plateCount: number;
  /** True when any pack in the order needs a link encoded per stand. */
  readonly needsPerUnitLinks: boolean;
}

/**
 * The only place an order total is calculated for payment. It reads the catalog,
 * never the request body, so a tampered client payload changes what is bought
 * but never what it costs.
 */
export function priceOrder(request: CheckoutRequest): PricedOrder {
  const lines: PricedLine[] = [];
  let standCount = 0;
  let plateCount = 0;
  let needsPerUnitLinks = false;

  for (const requested of request.lines) {
    const item = getCatalogItem(requested.sku);
    if (!item) continue;
    const perOrder = item.kind === 'add-on' && item.perOrder;
    const qty = perOrder ? 1 : requested.qty;
    const color = item.kind === 'stand-tier' ? requested.color : undefined;
    const linkMode = item.kind === 'stand-tier' ? requested.linkMode : undefined;

    if (item.kind === 'stand-tier') standCount += item.qty * qty;
    if (item.id === PLATE_SKU) plateCount += qty;
    if (linkMode === 'per-unit') needsPerUnitLinks = true;

    lines.push({
      item,
      qty,
      color,
      linkMode,
      unitCents: item.priceCents,
      totalCents: item.priceCents * qty,
      label:
        item.kind === 'stand-tier'
          ? `${item.name}${color ? `, ${color}` : ''}${
              linkMode === 'per-unit' ? ', separate link per stand' : ''
            }`
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
      if (bumpItem.id === PLATE_SKU) plateCount += 1;
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
    plateCount,
    needsPerUnitLinks,
  };
}
