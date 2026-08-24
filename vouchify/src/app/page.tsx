import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { ShopPlan } from '@/components/ShopPlan';
import { StandElevation } from '@/components/StandElevation';
import { TierTable } from '@/components/TierTable';
import {
  ButtonLink,
  Container,
  Grid,
  Reveal,
  Section,
} from '@/components/ui';
import { homepageFaqs } from '@/data/faq';
import { coreProduct, placements, priceRangeCents, standTiers, tierEconomics } from '@/data/products';
import { site } from '@/data/site';
import { setupSteps } from '@/data/steps';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: '/' },
};

/** TODO: replace with real customer logos once each has given written permission. */
const industries = [
  'Restaurants', 'Salons', 'Barbershops', 'Detailers',
  'Med spas', 'Dental clinics', 'Contractors',
];

const heroSpecs = [
  { label: 'Footprint', value: coreProduct.dimensions },
  { label: 'Power', value: 'None. Passive chip' },
  { label: 'Reads', value: 'iPhone and Android' },
  { label: 'Link changes', value: 'Free, forever' },
];

export default function HomePage() {
  const three = standTiers.find((t) => t.qty === 3);
  const threeEconomics = three ? tierEconomics(three) : null;

  return (
    <main id="main">
      {/* ---------------------------------------------------------------
          HERO. Full bleed ink, type led, with the floor plan as the image.
          The plan is the thesis of the business, so it opens the page.
      ---------------------------------------------------------------- */}
      <section className="border-b border-warm-800 bg-ink text-paper">
        <Container className="pt-16 pb-14 md:pt-24 md:pb-20">
          <Grid className="items-center gap-y-14">
            <div className="col-span-4 md:col-span-6">
              <p className="font-sans text-2xs font-semibold uppercase tracking-[0.2em] text-gold">
                NFC review stands
              </p>
              <h1 className="mt-6 text-2xl md:text-3xl lg:text-4xl">
                Three stands
                <br />
                cover a shop.
              </h1>
              <p className="mt-7 max-w-[46ch] text-lg text-warm-300">
                One on the counter, one at the pay terminal, one in the waiting area.
                Customers tap their phone, your Google review page opens, and nobody
                has to remember to ask.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href={`/products/${coreProduct.slug}?tier=stand-3`} size="lg">
                  Choose your bundle
                </ButtonLink>
                <ButtonLink href="/how-it-works" variant="onDark" size="lg">
                  How it works
                </ButtonLink>
              </div>

              <p className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-warm-400">
                <span data-numeric className="font-display text-lg font-bold tracking-tight text-paper">
                  {formatMoney(priceRangeCents.low, { compact: true })}
                </span>
                <span>for one.</span>
                {three && threeEconomics ? (
                  <>
                    <span data-numeric className="font-display text-lg font-bold tracking-tight text-gold">
                      {formatMoney(three.priceCents, { compact: true })}
                    </span>
                    <span data-numeric>
                      for three, at {formatMoney(threeEconomics.perUnitCents)} each.
                    </span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="col-span-4 md:col-span-5 md:col-start-8">
              <ShopPlan count={3} showLegend={false} locations={1} tone="ink" />
              <p className="mt-4 font-sans text-2xs uppercase tracking-[0.16em] text-warm-500">
                Typical single location, three placements filled
              </p>
            </div>
          </Grid>
        </Container>

        {/* Specification band. Dense, tabular, hairline ruled. */}
        <div className="border-t border-warm-800">
          <Container>
            <dl className="grid grid-cols-2 md:grid-cols-4">
              {heroSpecs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`py-5 md:py-6 ${index % 2 === 1 ? 'border-l border-warm-800 pl-5' : 'md:border-l md:border-warm-800 md:pl-5'} ${index < 2 ? 'border-b border-warm-800 md:border-b-0' : ''} ${index === 0 ? 'md:border-l-0 md:pl-0' : ''}`}
                >
                  <dt className="font-sans text-2xs font-semibold uppercase tracking-[0.16em] text-warm-500">
                    {spec.label}
                  </dt>
                  <dd data-numeric className="mt-2 text-sm font-medium text-paper">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      </section>

      {/* Thin trade band. One line, no heading, no eyebrow. */}
      <div className="border-b border-warm-300 bg-paper">
        <Container className="flex flex-wrap items-baseline gap-x-6 gap-y-2 py-5">
          <span className="font-sans text-2xs font-semibold uppercase tracking-[0.16em] text-warm-600">
            Built for
          </span>
          <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            {industries.map((industry) => (
              <li key={industry} className="text-sm font-medium text-warm-700">
                {industry}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* ---------------------------------------------------------------
          PROBLEM. Offset editorial. Deliberately not heading left, body right.
      ---------------------------------------------------------------- */}
      <Section rhythm="loose">
        <Grid>
          <div className="col-span-4 md:col-span-9 md:col-start-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl">
              Happy customers forget.
              <br />
              A tap does not.
            </h2>
          </div>
        </Grid>
        <Grid className="mt-12 gap-y-8 md:mt-16">
          <div className="col-span-4 md:col-span-4 md:col-start-6">
            <p className="text-lg text-warm-700">
              Nobody walks out of a good haircut planning to write a review. They mean it
              when they say it was great, and then they are back in the car thinking about
              lunch.
            </p>
          </div>
          <div className="col-span-4 md:col-span-3 md:col-start-10">
            <p className="text-base text-warm-700">
              The ask only works while they are still standing in front of you. A stand on
              the counter makes it at that moment, without your staff saying a word.
            </p>
          </div>
        </Grid>
      </Section>

      {/* ---------------------------------------------------------------
          SPECIFICATION. Drawing led. Replaces a photograph with real data.
      ---------------------------------------------------------------- */}
      <Section tone="warm" bordered>
        <Grid className="items-center gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <StandElevation tone="paper" />
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <h2 className="text-2xl md:text-3xl">A piece of acrylic that does one job.</h2>
            <p className="mt-5 max-w-prose text-base text-warm-700">
              There is no clever part. A chip inside holds a web address. A phone held
              against it opens that address. The QR code on the face covers the phones
              that will not tap.
            </p>

            <dl className="mt-9 border-t border-warm-300">
              {coreProduct.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-warm-300 py-3.5"
                >
                  <dt className="w-32 shrink-0 font-sans text-2xs font-semibold uppercase tracking-[0.14em] text-warm-600">
                    {spec.label}
                  </dt>
                  <dd data-numeric className="flex-1 text-sm font-medium">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Grid>
      </Section>

      {/* ---------------------------------------------------------------
          PLACEMENTS. The plan at scale, with the numbered sequence beside it.
      ---------------------------------------------------------------- */}
      <Section bordered rhythm="loose">
        <Grid className="gap-y-12">
          <div className="col-span-4 md:col-span-4">
            <h2 className="text-2xl md:text-3xl">One stand covers one spot.</h2>
            <p className="mt-5 text-base text-warm-700">
              Every stand covers exactly the customers who walk past it. That is why shops
              buy more than one. Not the price break, the coverage.
            </p>

            <ol className="mt-9 border-t border-warm-300">
              {placements.slice(0, 4).map((placement) => {
                const placed = placement.n <= 3;
                return (
                  <li key={placement.n} className="flex gap-5 border-b border-warm-300 py-4">
                    <span
                      data-numeric
                      className={
                        placed
                          ? 'font-display text-lg font-extrabold leading-tight tracking-tight text-gold-deep'
                          : 'font-display text-lg font-extrabold leading-tight tracking-tight text-warm-400'
                      }
                    >
                      {String(placement.n).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {placement.label}
                        {placed ? null : (
                          <span className="ml-2 font-sans text-2xs uppercase tracking-[0.14em] text-warm-500">
                            next
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm text-warm-700">{placement.note}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <ShopPlan count={3} showLegend={false} locations={1} />
            <p className="mt-4 font-sans text-2xs uppercase tracking-[0.16em] text-warm-600">
              Each stand also counts its own taps, so you can move the quiet one
            </p>
          </div>
        </Grid>
      </Section>

      {/* ---------------------------------------------------------------
          PRICING. Full bleed ink. The high contrast moment of the page.
      ---------------------------------------------------------------- */}
      <Section tone="ink" id="pricing">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-12 lg:col-span-5">
            <h2 className="text-2xl md:text-3xl">Per stand, it gets cheaper.</h2>
            <p className="mt-5 max-w-prose text-base text-warm-300">
              A stand is a thing you buy, not a seat you rent.
            </p>
            <dl className="mt-8 border-t border-warm-800">
              {coreProduct.ownership.map((term) => (
                <div
                  key={term.label}
                  className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-warm-800 py-3"
                >
                  <dt className="w-24 shrink-0 font-sans text-2xs font-semibold uppercase tracking-[0.14em] text-warm-500">
                    {term.label}
                  </dt>
                  <dd className="flex-1 text-sm font-medium text-warm-300">{term.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-warm-400">
              More than one address?{' '}
              <Link href="/multi-location" className="font-semibold text-gold underline underline-offset-4">
                Ask for a multi-location quote
              </Link>
            </p>
          </div>

          <div className="col-span-4 md:col-span-12 lg:col-span-7 lg:col-start-6">
            <TierTable tone="ink" />
          </div>
        </Grid>
      </Section>

      {/* ---------------------------------------------------------------
          SETUP. Horizontal, so it does not repeat the vertical list rhythm.
      ---------------------------------------------------------------- */}
      <Section bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <h2 className="text-xl md:text-2xl">Three steps, then it runs itself.</h2>
          </div>
          <ol className="col-span-4 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-warm-300 bg-warm-300 sm:grid-cols-3 md:col-span-8 md:col-start-5">
            {setupSteps.map((step) => (
              <Reveal as="li" key={step.n} delay={step.n * 60} className="bg-paper p-5">
                <span
                  data-numeric
                  className="font-display text-2xl font-extrabold leading-none tracking-tight text-gold-deep"
                >
                  {String(step.n).padStart(2, '0')}
                </span>
                <span className="mt-4 block font-display text-lg font-bold tracking-tight">
                  {step.title}
                </span>
                <span className="mt-2 block text-sm text-warm-700">{step.body}</span>
              </Reveal>
            ))}
          </ol>
        </Grid>
      </Section>

      {/* FAQ, dense two column */}
      <Section tone="warm" bordered>
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-3">
            <h2 className="text-xl md:text-2xl">The six we get most.</h2>
            <p className="mt-4 text-sm text-warm-700">
              The rest are on the{' '}
              <Link href="/faq" className="font-semibold text-gold-deep underline underline-offset-4">
                FAQ page
              </Link>
              , including where we stand on Google&rsquo;s review policy.
            </p>
          </div>
          <div className="col-span-4 md:col-span-8 md:col-start-5">
            <FaqList entries={homepageFaqs} tone="paper" />
          </div>
        </Grid>
      </Section>

      <Section tone="ink" rhythm="tight" bordered>
        <Grid className="items-center gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <h2 className="text-2xl md:text-3xl">Put one on the counter.</h2>
            <p className="mt-4 max-w-prose text-base text-warm-300">
              Programmed to your review link before it ships, and tapped on both an iPhone
              and an Android handset as part of packing.
            </p>
          </div>
          <div className="col-span-4 md:col-span-4 md:col-start-9 md:justify-self-end">
            <ButtonLink href={`/products/${coreProduct.slug}`} size="lg">
              Choose your bundle
            </ButtonLink>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
