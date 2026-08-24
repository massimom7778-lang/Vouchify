import type { Metadata } from 'next';
import { ButtonLink, Eyebrow, Section } from '@/components/ui';
import { coreProduct } from '@/data/products';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'That code is not one of ours',
  robots: { index: false, follow: false },
};

/**
 * Where a mistyped or retired code lands. The person reading this is standing at
 * someone's counter holding a phone, so it says what to do next in one line.
 */
export default function UnknownStandPage() {
  return (
    <main id="main">
      <Section rhythm="tight" className="pt-16">
        <div className="max-w-prose">
          <Eyebrow>Stand not found</Eyebrow>
          <h1 className="mt-4 text-2xl md:text-3xl">That code is not one of ours.</h1>
          <p className="mt-6 text-base text-warm-700">
            Either the address was typed by hand and a character is off, or this stand has been
            retired. Nothing is broken on your phone.
          </p>
          <p className="mt-4 text-base text-warm-700">
            If you were trying to leave a review, search the business by name on Google and use the
            review button on their listing — that is the same page this stand would have opened.
          </p>
          <p className="mt-6 text-sm text-warm-600">
            If this is your stand, email{' '}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-semibold text-gold-deep underline underline-offset-4"
            >
              {site.supportEmail}
            </a>{' '}
            with the code printed on it and we will re-point it.
          </p>
          <div className="mt-8">
            <ButtonLink href={`/products/${coreProduct.slug}`} size="lg">
              What is a Vouchify stand?
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
