'use client';

import { Button } from '@/components/ui';
import { useCart } from '@/lib/cart';
import type { Sku } from '@/data/products';

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
    <Button size="lg" block={block} onClick={() => add(sku, 1)}>
      {children}
    </Button>
  );
}
