'use client';

import { Button } from '@/components/ui';
import { EVENTS, dollars, emit } from '@/lib/analytics';
import { useCart } from '@/lib/cart';
import { getCatalogItem, type Sku } from '@/data/products';

export function AddToCartButton({
  sku,
  children,
  block = false,
}: {
  sku: Sku;
  children: React.ReactNode;
  block?: boolean;
}) {
  const add = useCart((s) => s.add);
  return (
    <Button
      size="lg"
      block={block}
      onClick={() => {
        add(sku, 1);
        emit(EVENTS.addToCart, {
          sku,
          qty: 1,
          value: dollars(getCatalogItem(sku)?.priceCents ?? 0),
        });
      }}
    >
      {children}
    </Button>
  );
}
