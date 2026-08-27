import type { Metadata } from 'next';
import { PlanDrawing } from '@/components/ShopPlan';
import { TierTable } from '@/components/TierTable';
import {
  ButtonLink,
  Coverage,
  Eyebrow,
  Grid,
  Price,
  Section,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatMoney, pluralize } from '@/lib/format';
import {
  DEFAULT_TIER_ID,
  coreProduct,
  coveredPositions,
  standTiers,
  tierEconomics,
} from '@/data/products';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Bundles',
  description:
    'Compare Vouchify stand bundles side by side: what each covers on a real floor, the per-stand price, and where the multi-location quote takes over.',
  alternates: { canonical: '/bundles' },
};

export default function BundlesPage() {
  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>Bundles</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl lg:text-4xl">
              Same stand.
              <br />
              More of your floor.
            </h1>
          </div>
          <div className="col-span-4 self-end md:col-span-4 md:col-start-9">
            <p className="text-base text-warm-700">
              The stand does not change between bundles, the coverage does. Below, each bundle is
              drawn on the same floor so you can see exactly which customers it catches and which it
              misses.
            </p>
          </div>
        </Grid>
      </Section>

      {/* Side-by-side coverage comparison */}
      <Section rhythm="tight">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {standTiers.map((tier) => {
            const economics = tierEconomics(tier);
            const coverage = coveredPositions(tier);
            const highlight = tier.id === DEFAULT_TIER_ID;
            return (
              <div
                key={tier.id}
                className={cn(
                  'flex flex-col rounded-md border p-4',
                  highlight ? 'border-gold bg-gold-tint' : 'border-warm-300 bg-paper',
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-bold tracking-tight" data-numeric>
                    {tier.qty}
                  </span>
                  <Price cents={tier.priceCents} size="sm" />
                </div>
                <p data-numeric className="mt-0.5 text-xs text-warm-600">
                  {formatMoney(economics.perUnitCents)} per stand
                </p>

                <div className="mt-4">
                  <PlanDrawing
                    location={1}
                    count={tier.qty}
                    title={`${tier.qty} ${pluralize(tier.qty, 'stand')}`}
                  />
                  {/* The second plan is drawn in every column, dimmed until the
                      bundle reaches it. Columns stay the same height, and the
                      floor a bundle does not cover is visible rather than absent. */}
                  <div className="mt-2">
                    <PlanDrawing
                      location={2}
                      count={tier.qty}
                      title={`${tier.qty} ${pluralize(tier.qty, 'stand')}, second location`}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-warm-700">{tier.coverage}</p>

                <div className="mt-auto pt-4">
                  {coverage ? (
                    <div className="mb-3">
                      <Coverage {...coverage} />
                    </div>
                  ) : null}
                  <ButtonLink
                    href={`/products/${coreProduct.slug}?tier=${tier.id}`}
                    variant={highlight ? 'primary' : 'outline'}
                    size="sm"
                    block
                  >
                    Choose
                  </ButtonLink>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-warm-600">
          Numbered dots are placement positions, filled in the order they earn their keep. From the
          10-pack up, both floor plans fill, because two locations is what that many stands are for.
        </p>
      </Section>

      <Section bordered>
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>The numbers</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">Every bundle, side by side.</h2>
          </div>
          <div className="col-span-4 md:col-span-12">
            <TierTable />
          </div>
        </Grid>
      </Section>

      <Section tone="ink" bordered>
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow tone="onDark">Past {site.multiLocationMinUnits}</Eyebrow>
            <h2 className="mt-4 text-2xl md:text-3xl">
              More than {site.multiLocationMinUnits} stands is a quote, not a checkout.
            </h2>
            <p className="mt-5 max-w-prose text-base text-warm-300">
              Above {site.multiLocationMinUnits} the order stops being a shopping cart problem. Each
              location needs its own review link, the boxes need labelling so staff put the right ones
              out, and the price should reflect the whole group rather than the biggest listed bundle.
            </p>
            <p className="mt-4 max-w-prose text-base text-warm-300">
              Tell us how many addresses and how many stands per address. You get a written quote
              back, not a sales call.
            </p>
          </div>
          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <div className="rounded-md border border-warm-800 bg-warm-900 p-6">
              <p className="font-display text-lg font-bold tracking-tight">What is in a quote</p>
              <ul className="mt-4 space-y-3 text-sm text-warm-300">
                <li className="border-b border-warm-800 pb-3">
                  Per-location review links, programmed and tested before shipping
                </li>
                <li className="border-b border-warm-800 pb-3">
                  Labelled boxes, one per address
                </li>
                <li className="border-b border-warm-800 pb-3">
                  Group pricing, written down, valid for 30 days
                </li>
                <li>Logo printing across the whole order at one setup charge</li>
              </ul>
              <ButtonLink href="/multi-location" size="lg" block className="mt-6">
                Get a quote
              </ButtonLink>
            </div>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
