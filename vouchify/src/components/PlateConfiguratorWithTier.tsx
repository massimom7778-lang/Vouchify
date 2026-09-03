'use client';

import { useSearchParams } from 'next/navigation';
import { PlateConfigurator } from '@/components/PlateConfigurator';

/**
 * Same trick as ProductConfiguratorWithTier, for the plate PDP: reads
 * `?tier=` client-side so the page can stay static instead of awaiting
 * `searchParams` on every request.
 */
export function PlateConfiguratorWithTier() {
  const tier = useSearchParams().get('tier') ?? undefined;
  return <PlateConfigurator initialTierId={tier} />;
}
