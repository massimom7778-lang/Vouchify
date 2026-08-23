import type { Metadata } from 'next';
import { QuoteForm } from './QuoteForm';
import { Eyebrow, Grid, Section } from '@/components/ui';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Multi-location quote',
  description:
    'Ten stands or more, or more than one address: per-location review links, labelled boxes, and group pricing. Written quote within one business day.',
  alternates: { canonical: '/multi-location' },
};

export default function MultiLocationPage() {
  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow>Multi-location</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl">
              More than one address changes the order.
            </h1>
            <p className="mt-6 text-base text-warm-700">
              Any pack can already be encoded with a separate link per stand — that is a checkbox in
              the buy box, not a conversation. What changes past{' '}
              {site.multiLocationMinUnits} stands is everything around the chips: which box goes to
              which address, who signs for it, what the whole group should cost, and what happens
              when you open number seven.
            </p>
            <p className="mt-4 text-base text-warm-700">
              So above {site.multiLocationMinUnits} we quote instead of listing a price. You tell us
              the addresses and how many stands each one needs; we program, label, price and keep it
              on file.
            </p>

            <dl className="mt-8 divide-y divide-warm-300 border-y border-warm-300">
              {[
                ['Per-location links', 'Each shop’s stands point at that shop’s review page. Included, not an upgrade.'],
                ['Labelled boxes', 'One box per address, named, so staff put out the right ones.'],
                ['Group pricing', 'Written down and valid for 30 days.'],
                ['One setup charge', 'Logo printing covers the whole order, not each location.'],
                ['Reorders', 'Kept on file, so a new location is one email.'],
              ].map(([label, value]) => (
                <div key={label} className="py-4">
                  <dt className="text-sm font-semibold">{label}</dt>
                  <dd className="mt-1 text-sm text-warm-700">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-sm text-warm-600">
              Prefer email? Send the same details to{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-semibold text-signal-deep underline underline-offset-4"
              >
                {site.supportEmail}
              </a>
              .
            </p>
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <QuoteForm />
          </div>
        </Grid>
      </Section>
    </main>
  );
}
