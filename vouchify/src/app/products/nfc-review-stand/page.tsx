import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { ProductConfigurator } from '@/components/ProductConfigurator';
import {
  ButtonLink,
  Eyebrow,
  Grid,
  PhotoBlock,
  Price,
  Reveal,
  Section,
} from '@/components/ui';
import { productFaqs } from '@/data/faq';
import {
  addOnPages,
  coreProduct,
  priceRangeCents,
  standTiers,
} from '@/data/products';
import { setupSteps } from '@/data/steps';
import { site } from '@/data/site';
import { priceForSchema } from '@/lib/format';

export const metadata: Metadata = {
  title: coreProduct.fullName,
  description: coreProduct.summary,
  alternates: { canonical: `/products/${coreProduct.slug}` },
  openGraph: {
    type: 'website',
    title: `${coreProduct.fullName} — ${site.name}`,
    description: coreProduct.summary,
    url: `/products/${coreProduct.slug}`,
  },
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: coreProduct.fullName,
  description: coreProduct.summary,
  brand: { '@type': 'Brand', name: site.name },
  material: 'Cast acrylic',
  size: coreProduct.dimensions,
  color: coreProduct.colors.map((c) => c.label),
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: site.currency,
    lowPrice: priceForSchema(priceRangeCents.low),
    highPrice: priceForSchema(priceRangeCents.high),
    offerCount: standTiers.length,
    availability: 'https://schema.org/InStock',
    offers: standTiers.map((tier) => ({
      '@type': 'Offer',
      sku: tier.id,
      name: `${tier.qty} stand${tier.qty === 1 ? '' : 's'}`,
      price: priceForSchema(tier.priceCents),
      priceCurrency: site.currency,
      availability: 'https://schema.org/InStock',
      url: `${site.url}/products/${coreProduct.slug}?tier=${tier.id}`,
    })),
  },
};

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;

  return (
    // Bottom padding keeps the sticky mobile buy bar off the footer.
    <main id="main" className="pb-20 lg:pb-0">
      <JsonLd data={productSchema} />

      <Section rhythm="tight" className="pb-0">
        <ProductConfigurator initialTierId={tier} />
      </Section>

      {/* Grid break: full-bleed counter photograph */}
      <div className="mt-16 border-y border-warm-300 md:mt-24">
        <PhotoBlock photo={coreProduct.photos.counter} square className="border-0" />
      </div>

      <Section bordered>
        <Grid className="gap-y-12">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow>In the box</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-2xl">What actually arrives.</h2>
            <p className="mt-4 max-w-prose text-base text-warm-700">
              Nothing to activate, no account to create before the stands work. They are encoded and
              tested here, so the first customer of the day can use one.
            </p>
            <ul className="mt-8 divide-y divide-warm-300 border-y border-warm-300">
              {coreProduct.inTheBox.map((entry) => (
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
              A stand is a thing you buy, not a seat you rent. There is no plan behind it that we can
              put up later.
            </p>
            <dl className="mt-8 divide-y divide-warm-300 border-y border-warm-300">
              {coreProduct.ownership.map((term) => (
                <div key={term.label} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-4">
                  <dt className="w-28 shrink-0 text-2xs font-semibold uppercase tracking-wide text-warm-600">
                    {term.label}
                  </dt>
                  <dd className="flex-1 text-sm font-medium">{term.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-warm-600">
              The one thing we run for you is the forwarder that lets you change where the stands
              point. If we ever stopped running it, we would publish a way to reprogram your chips to
              point straight at your review page.
            </p>
          </div>
        </Grid>
      </Section>

      <Section tone="warm">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>Setup</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">Three steps, then it is done.</h2>
          </div>
          <ol className="col-span-4 md:col-span-8 md:col-start-5">
            {setupSteps.map((step) => (
              <Reveal as="li" key={step.n} delay={step.n * 60} className="flex gap-5 border-b border-warm-300 py-6 first:border-t">
                <span
                  data-numeric
                  className="font-display text-2xl font-extrabold leading-none tracking-tight text-gold-deep"
                >
                  {step.n}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-bold tracking-tight">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-base text-warm-700">{step.body}</span>
                  <span className="mt-2 block text-sm text-warm-600">{step.detail}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </Grid>
      </Section>

      <Section bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>Also useful</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-2xl">For the customers who never reach the counter.</h2>
            <p className="mt-4 text-sm text-warm-700">
              Delivery orders, tableside payments, and anyone who walks straight out. All three carry
              the same link as your stands.
            </p>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-8 md:col-start-5">
            {addOnPages.map((addOn) => (
              <Link
                key={addOn.id}
                href={`/products/${addOn.slug}`}
                className="group rounded-md border border-warm-300 bg-paper p-4 hover:border-ink"
              >
                <PhotoBlock photo={addOn.photo} className="mb-4" />
                <p className="font-display text-lg font-bold tracking-tight group-hover:text-gold-deep">
                  {addOn.name}
                </p>
                <p className="mt-1 text-xs text-warm-600">{addOn.shortLine}</p>
                <p className="mt-3">
                  <Price cents={addOn.priceCents} size="sm" display={false} />
                </p>
              </Link>
            ))}
          </div>
        </Grid>
      </Section>

      <Section bordered>
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">Before you order.</h2>
            <p className="mt-4 text-sm text-warm-700">
              Anything not covered here, email{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-semibold text-gold-deep underline underline-offset-4"
              >
                {site.supportEmail}
              </a>
              . A person answers.
            </p>
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <FaqList entries={productFaqs} />
          </div>
        </Grid>
      </Section>

      <Section tone="ink" rhythm="tight">
        <Grid className="items-center gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <h2 className="text-xl md:text-2xl">Ten or more, or more than one address?</h2>
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
