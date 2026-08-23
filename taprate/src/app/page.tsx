import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { ShopPlan } from '@/components/ShopPlan';
import { TierTable } from '@/components/TierTable';
import {
  Badge,
  ButtonLink,
  Container,
  Eyebrow,
  Grid,
  PhotoBlock,
  Price,
  Reveal,
  Section,
} from '@/components/ui';
import { homepageFaqs } from '@/data/faq';
import { coreProduct, placements, priceRangeCents } from '@/data/products';
import { site } from '@/data/site';
import { setupSteps } from '@/data/steps';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: '/' },
};

const industries = [
  'Restaurants',
  'Salons',
  'Barbershops',
  'Detailers',
  'Med spas',
  'Dental clinics',
  'Contractors',
];

export default function HomePage() {
  return (
    <main id="main">
      {/* 1 — Hero. Photo left, the argument right. */}
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="items-center gap-y-10">
          <div className="col-span-4 md:col-span-6">
            <PhotoBlock photo={coreProduct.photos.hero} vignette />
          </div>

          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <Eyebrow>NFC review stands</Eyebrow>
            <h1 className="mt-5 text-2xl md:text-3xl lg:text-4xl">
              Tap.
              <br />
              Review.
              <br />
              Done.
            </h1>
            <p className="mt-6 max-w-prose text-lg text-warm-700">
              A stand that sits on your counter. Customers tap their phone. Your Google review page
              opens. That is it — no app to download, no wifi, no batteries.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/products/${coreProduct.slug}`} size="lg">
                Choose your bundle
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="outline" size="lg">
                How it works
              </ButtonLink>
            </div>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-warm-300 pt-5">
              <span className="flex items-baseline gap-2">
                <span className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
                  From
                </span>
                <Price cents={priceRangeCents.low} size="lg" />
              </span>
              <span data-numeric className="text-sm text-warm-700">
                Free shipping over {formatMoney(site.freeShippingThresholdCents, { compact: true })}
              </span>
              <span className="text-sm text-warm-700">{site.shipping.processing} to ship</span>
            </div>
          </div>
        </Grid>
      </Section>

      {/* 2 — Proof strip */}
      <div className="border-y border-warm-300 bg-warm-100">
        <Container className="py-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
              Built for
            </span>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {industries.map((industry) => (
                <li key={industry} className="text-sm font-medium text-warm-700">
                  {industry}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 inline-block rounded-sm border border-warm-400 bg-warm-50 px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-warm-700">
            TODO: replace with real customer logos once we have written permission from each — no
            placeholder marks, no invented names
          </p>
        </Container>
      </div>

      {/* 3 — Problem to outcome */}
      <Section tone="ink" rhythm="loose">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow tone="onDark">The problem</Eyebrow>
            <h2 className="mt-5 text-2xl md:text-3xl">
              Happy customers forget.
              <br />
              A tap doesn’t.
            </h2>
          </div>
          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <p className="text-lg text-warm-300">
              Nobody walks out of a good haircut planning to write a review. They mean it when they
              say it was great, and then they are back in the car thinking about lunch.
            </p>
            <p className="mt-5 text-base text-warm-300">
              The ask only works while they are still standing in front of you. A stand on the
              counter makes it at that moment, without your staff having to say a word or remember
              the script.
            </p>
            <p className="mt-5 text-base text-warm-300">
              It takes one tap. No app to install, no form to fill in, no account to make — the
              review page just opens.
            </p>
          </div>
        </Grid>
      </Section>

      {/* Grid break: full-bleed counter photograph */}
      <div className="border-b border-warm-300">
        <PhotoBlock photo={coreProduct.photos.counter} square className="border-0" />
      </div>

      {/* 4 — How it works */}
      <Section>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">Three steps, then it runs itself.</h2>
            <p className="mt-5 text-sm text-warm-700">
              There is no dashboard your staff need to learn and nothing to switch on in the
              morning.
            </p>
          </div>
          <ol className="col-span-4 md:col-span-8 md:col-start-5">
            {setupSteps.map((step) => (
              <Reveal
                as="li"
                key={step.n}
                delay={step.n * 60}
                className="flex gap-5 border-b border-warm-300 py-6 first:border-t md:gap-8"
              >
                <span
                  data-numeric
                  className="font-display text-2xl font-extrabold leading-none tracking-tight text-signal-deep md:text-3xl"
                >
                  {step.n}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-bold tracking-tight md:text-xl">
                    {step.title}
                  </span>
                  <span className="mt-2 block text-base text-warm-700">{step.body}</span>
                  <span className="mt-2 block text-sm text-warm-600">{step.detail}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </Grid>
      </Section>

      {/* 5 — Where owners put them. The offset editorial break. */}
      <Section tone="warm" bordered rhythm="loose">
        <Grid className="gap-y-12">
          <div className="col-span-4 md:col-span-7">
            <ShopPlan count={3} showLegend={false} locations={1} />
          </div>
          <div className="col-span-4 md:col-span-4 md:col-start-9">
            <Eyebrow>Where owners put them</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">One stand covers one spot.</h2>
            <p className="mt-5 text-base text-warm-700">
              Every stand covers exactly the customers who walk past it. That is the whole reason
              shops buy more than one — not the price break, the coverage.
            </p>
            {/* The first three are drawn on the plan above; the fourth is shown
                unfilled, because that is exactly what it is — the next one. */}
            <ol className="mt-8 divide-y divide-warm-300 border-y border-warm-300">
              {placements.slice(0, 4).map((placement) => {
                const placed = placement.n <= 3;
                return (
                  <li key={placement.n} className="flex gap-4 py-4">
                    <span
                      data-numeric
                      className={
                        placed
                          ? 'grid h-6 w-6 shrink-0 place-items-center rounded-full bg-signal text-2xs font-semibold text-ink'
                          : 'grid h-6 w-6 shrink-0 place-items-center rounded-full border border-dashed border-warm-400 text-2xs font-semibold text-warm-600'
                      }
                    >
                      {placement.n}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {placement.label}
                        {placed ? null : (
                          <span className="ml-2 text-2xs font-semibold uppercase tracking-wide text-warm-600">
                            The next one
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm text-warm-700">{placement.note}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-5 text-sm text-warm-600">
              The plan shows a 3-pack: counter, terminal, waiting area.{' '}
              <Link
                href={`/products/${coreProduct.slug}?tier=stand-3`}
                className="font-semibold text-signal-deep underline underline-offset-4"
              >
                See the 3-pack
              </Link>
            </p>
          </div>
        </Grid>
      </Section>

      {/* 6 — Tier pricing */}
      <Section bordered id="pricing">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">Per stand, it gets cheaper.</h2>
            <p className="mt-5 max-w-prose text-base text-warm-700">
              A stand is a thing you buy, not a seat you rent.
            </p>
            <dl className="mt-6 divide-y divide-warm-300 border-y border-warm-300">
              {coreProduct.ownership.map((term) => (
                <div key={term.label} className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-3">
                  <dt className="w-24 shrink-0 text-2xs font-semibold uppercase tracking-wide text-warm-600">
                    {term.label}
                  </dt>
                  <dd className="flex-1 text-sm font-medium">{term.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-warm-600">
              Buying for more than one address?{' '}
              <Link href="/multi-location" className="font-semibold text-signal-deep underline underline-offset-4">
                Ask for a multi-location quote
              </Link>
              .
            </p>
          </div>
          <div className="col-span-4 md:col-span-12">
            <TierTable />
          </div>
        </Grid>
      </Section>

      {/* 7 — Testimonials, structure only */}
      <Section tone="warm" bordered>
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>What owners say</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-2xl">Nothing here yet.</h2>
            <p className="mt-4 text-sm text-warm-700">
              We would rather leave this empty than fill it with quotes we wrote ourselves. Real ones
              go here as customers send them.
            </p>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-8 md:col-start-5">
            {['Restaurant', 'Salon', 'Auto detailer'].map((industry) => (
              <figure
                key={industry}
                className="flex min-h-44 flex-col justify-between rounded-md border border-dashed border-warm-400 bg-warm-50 p-4"
              >
                <blockquote className="text-sm text-warm-600">
                  TODO: real quote from a {industry.toLowerCase()} — 2 sentences, what changed after
                  the stands went out, no numbers we cannot verify
                </blockquote>
                <figcaption className="mt-6 text-2xs uppercase tracking-wide text-warm-600">
                  TODO: name, business, city
                </figcaption>
              </figure>
            ))}
          </div>
        </Grid>
      </Section>

      {/* 8 — FAQ */}
      <Section bordered>
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">The six we get most.</h2>
            <p className="mt-5 text-sm text-warm-700">
              The rest are on the{' '}
              <Link href="/faq" className="font-semibold text-signal-deep underline underline-offset-4">
                FAQ page
              </Link>
              , including where we stand on Google’s review policy.
            </p>
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <FaqList entries={homepageFaqs} />
          </div>
        </Grid>
      </Section>

      {/* Closing CTA */}
      <Section tone="ink" rhythm="tight">
        <Grid className="items-center gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <h2 className="text-2xl md:text-3xl">Put one on the counter.</h2>
            <p className="mt-4 max-w-prose text-base text-warm-300">
              Programmed to your review link before it ships, tested on an iPhone and an Android
              handset as part of packing.
            </p>
          </div>
          <div className="col-span-4 flex flex-wrap items-center gap-3 md:col-span-4 md:col-start-9 md:justify-end">
            <ButtonLink href={`/products/${coreProduct.slug}`} size="lg">
              Choose your bundle
            </ButtonLink>
            <Badge tone="onDark">From {formatMoney(priceRangeCents.low, { compact: true })}</Badge>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
