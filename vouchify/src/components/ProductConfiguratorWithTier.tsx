'use client';

import { useSearchParams } from 'next/navigation';
import { ProductConfigurator } from '@/components/ProductConfigurator';

/**
 * Reads `?tier=` from the URL on the client, so the page itself never has to
 * await `searchParams` — that opted the whole stand PDP, the highest-traffic
 * route on the site, out of static rendering. Wrapped in Suspense by the page,
 * with a plain `<ProductConfigurator />` (default tier) as the fallback, so
 * the common case — no `?tier=` at all — has nothing to swap in and nothing
 * to flash.
 */
export function ProductConfiguratorWithTier() {
  const tier = useSearchParams().get('tier') ?? undefined;
  return <ProductConfigurator initialTierId={tier} />;
}
