import type { Metadata } from 'next';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { ButtonLink, Eyebrow, Grid, Section } from '@/components/ui';
import { faqs, type FaqTopic } from '@/data/faq';
import { coreProduct } from '@/data/products';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Phone compatibility, setup, shipping, changing your link later, and where TapRate stands on Google’s review policy.',
  alternates: { canonical: '/faq' },
};

const groups: { topic: FaqTopic; heading: string; blurb: string }[] = [
  { topic: 'phones', heading: 'Phones', blurb: 'What happens on the customer’s side of the counter.' },
  { topic: 'setup', heading: 'Setup and links', blurb: 'Getting it running, and changing it later.' },
  { topic: 'product', heading: 'The stand itself', blurb: 'Materials, printing, and what happens if one fails.' },
  { topic: 'shipping', heading: 'Shipping and returns', blurb: 'Timings, rush processing, and the returns window.' },
  { topic: 'policy', heading: 'Policy and privacy', blurb: 'Google’s rules, and what we can see.' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((entry) => ({
    '@type': 'Question',
    name: entry.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: entry.answer.join(' '),
    },
  })),
};

export default function FaqPage() {
  return (
    <main id="main">
      <JsonLd data={faqSchema} />

      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>FAQ</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl lg:text-4xl">
              Straight answers,
              <br />
              including the awkward one.
            </h1>
          </div>
          <div className="col-span-4 self-end md:col-span-4 md:col-start-9">
            <p className="text-base text-warm-700">
              If something here is not clear, email{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-semibold text-signal-deep underline underline-offset-4"
              >
                {site.supportEmail}
              </a>{' '}
              and a person will answer it.
            </p>
          </div>
        </Grid>
      </Section>

      {groups.map((group) => {
        const entries = faqs.filter((entry) => entry.topics.includes(group.topic));
        if (entries.length === 0) return null;
        return (
          <Section key={group.topic} bordered rhythm="tight">
            <Grid className="gap-y-6">
              <div className="col-span-4 md:col-span-3">
                <h2 className="text-xl md:text-xl" id={group.topic}>
                  {group.heading}
                </h2>
                <p className="mt-2 text-sm text-warm-600">{group.blurb}</p>
              </div>
              <div className="col-span-4 md:col-span-8 md:col-start-5">
                <FaqList entries={entries} defaultOpen={[]} />
              </div>
            </Grid>
          </Section>
        );
      })}

      <Section tone="ink" rhythm="tight" bordered>
        <Grid className="items-center gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <h2 className="text-xl md:text-2xl">Still deciding how many?</h2>
            <p className="mt-3 max-w-prose text-base text-warm-300">
              The bundles page draws each one on the same floor plan, so you can see what it covers
              before you pick.
            </p>
          </div>
          <div className="col-span-4 flex flex-wrap gap-3 md:col-span-4 md:col-start-9 md:justify-end">
            <ButtonLink href="/bundles" size="lg">
              Compare bundles
            </ButtonLink>
            <ButtonLink href={`/products/${coreProduct.slug}`} variant="onDark" size="lg">
              The Stand
            </ButtonLink>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
