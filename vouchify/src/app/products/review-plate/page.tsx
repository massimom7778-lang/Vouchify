import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { PlateConfigurator } from '@/components/PlateConfigurator';
import { TierTable } from '@/components/TierTable';
import {
  ButtonLink,
  Eyebrow,
  Grid,
  PhotoBlock,
  Section,
} from '@/components/ui';
import {
  DEFAULT_PLATE_TIER_ID,
  PLATE_UNIT_PRICE_CENTS,
  coreProduct,
  plateProduct,
  platePlacements,
  platePriceRangeCents,
  plateTiers,
  priceRangeCents,
} from '@/data/products';
import { site } from '@/data/site';
import { formatMoney, priceForSchema } from '@/lib/format';

export const metadata: Metadata = {
  title: plateProduct.fullName,
  description: plateProduct.summary,
  alternates: { canonical: `/products/${plateProduct.slug}` },
  openGraph: {
    type: 'website',
    title: `${plateProduct.fullName}, ${site.name}`,
    description: plateProduct.summary,
    url: `/products/${plateProduct.slug}`,
  },
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: plateProduct.fullName,
  description: plateProduct.summary,
  brand: { '@type': 'Brand', name: site.name },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: site.currency,
    lowPrice: priceForSchema(platePriceRangeCents.low),
    highPrice: priceForSchema(platePriceRangeCents.high),
    offerCount: plateTiers.length,
    availability: 'https://schema.org/InStock',
    offers: plateTiers.map((tier) => ({
      '@type': 'Offer',
      sku: tier.id,
      name: tier.name,
      price: priceForSchema(tier.priceCents),
      priceCurrency: site.currency,
      availability: 'https://schema.org/InStock',
      url: `${site.url}/products/${plateProduct.slug}?tier=${tier.id}`,
    })),
  },
};

export default async function ReviewPlatePage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;

  return (
    // Bottom padding keeps the sticky mobile buy bar off the footer.
    <main id="main" className="pb-[calc(5rem_+_env(safe-area-inset-bottom))] lg:pb-0">
      <JsonLd data={productSchema} />

      <Section rhythm="tight" className="pb-0">
        <PlateConfigurator initialTierId={tier} />
      </Section>

      {/* Grid break: full-bleed studio photograph */}
      <div className="mt-16 border-y border-warm-300 md:mt-24">
        <PhotoBlock photo={plateProduct.photos.plinth} className="border-0" />
      </div>

      <Section bordered>
        <Grid className="gap-y-12">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow>In the box</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-2xl">What actually arrives.</h2>
            <p className="mt-4 max-w-prose text-base text-warm-700">
              Nothing to activate, no account to create before the plates work. They are encoded and
              tested here, so the first customer of the day can use one.
            </p>
            <ul className="mt-8 divide-y divide-warm-300 border-y border-warm-300">
              {plateProduct.inTheBox.map((entry) => (
                <li key={entry} className="flex gap-4 py-4">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold"
                  />
                  <span className="text-base text-warm-700">{entry}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <Eyebrow>What you pay</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-2xl">Once. That is the whole model.</h2>
            <p className="mt-4 text-base text-warm-700">
              A plate is a thing you buy, not a seat you rent. There is no plan behind it that we can
              put up later.
            </p>
            <dl className="mt-8 divide-y divide-warm-300 border-y border-warm-300">
              {plateProduct.ownership.map((term) => (
                <div key={term.label} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-4">
                  <dt className="w-28 shrink-0 text-2xs font-semibold uppercase tracking-wide text-warm-600">
                    {term.label}
                  </dt>
                  <dd className="flex-1 text-sm font-medium">{term.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-warm-600">
              The one thing we run for you is the forwarder that lets you change where the plates
              point. If we ever stopped running it, we would publish a way to reprogram your chips to
              point straight at your review page.
            </p>
          </div>
        </Grid>
      </Section>

      <Section tone="warm" bordered rhythm="tight">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>The numbers</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">Every plate bundle, side by side.</h2>
          </div>
          <div className="col-span-4 md:col-span-12">
            <TierTable
              tiers={plateTiers}
              unitWord="plate"
              unitPriceCents={PLATE_UNIT_PRICE_CENTS}
              defaultTierId={DEFAULT_PLATE_TIER_ID}
              placementList={platePlacements}
              hrefFor={(id) => `/products/${plateProduct.slug}?tier=${id}`}
              caption="Vouchify review plate bundles, prices and per-unit savings"
            />
          </div>
        </Grid>
      </Section>

      <Section bordered>
        <Grid className="items-center gap-y-8">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>Also</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-2xl">Need something for the counter itself?</h2>
            <p className="mt-4 max-w-prose text-base text-warm-700">
              The stand is the countertop version of the same chip, for the checkout, the pay
              terminal, the waiting area. Same link, same free changes, same dashboard.
            </p>
          </div>
          <div className="col-span-4 md:col-span-4 md:col-start-9">
            <Link
              href={`/products/${coreProduct.slug}`}
              className="flex flex-col justify-between rounded-md border border-ink bg-ink p-4 text-paper hover:bg-warm-900"
            >
              <div>
                <p className="font-display text-lg font-bold tracking-tight">The Stand</p>
                <p data-numeric className="mt-1 text-xs text-warm-400">
                  The one that sits on the counter. From {formatMoney(priceRangeCents.low, { compact: true })}.
                </p>
              </div>
              <span className="mt-6 text-sm font-semibold text-gold">Choose a bundle</span>
            </Link>
          </div>
        </Grid>
      </Section>

      <Section tone="ink" rhythm="tight">
        <Grid className="items-center gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <h2 className="text-xl md:text-2xl">
              More than {site.multiLocationMinUnits}, or more than one address?
            </h2>
            <p className="mt-3 max-w-prose text-base text-warm-300">
              We price the whole group, program each location to its own review page, and label the
              boxes so your staff put the right ones out.
            </p>
          </div>
          <div className="col-span-4 md:col-span-4 md:col-start-9 md:justify-self-end">
            <ButtonLink href="/multi-location" size="lg">
              Get a quote
            </ButtonLink>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
