import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, Eyebrow, Grid, Section } from '@/components/ui';
import { coreProduct } from '@/data/products';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * A 404 is a wrong turn, not a failure to apologise for. It says what happened
 * in one line and then offers the three places people are actually trying to
 * reach.
 */
export default function NotFound() {
  return (
    <main id="main">
      <Section rhythm="tight" className="pt-16 md:pt-24">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow>404</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl">That page is not here.</h1>
            <p className="mt-6 max-w-prose text-base text-warm-700">
              The address may have changed, or it may have been typed by hand. Nothing is broken, this page simply does not exist.
            </p>
            <p className="mt-4 text-sm text-warm-600">
              If you followed a link from somewhere on this site, tell us where and we will fix it:{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-semibold text-gold-deep underline underline-offset-4"
              >
                {site.supportEmail}
              </a>
              .
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/products/${coreProduct.slug}`} size="lg">
                The Stand
              </ButtonLink>
              <ButtonLink href="/" variant="outline" size="lg">
                Home
              </ButtonLink>
            </div>
          </div>

          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <p className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
              Most people are looking for
            </p>
            <ul className="mt-4 divide-y divide-warm-300 border-y border-warm-300">
              {[
                { href: `/products/${coreProduct.slug}`, label: 'The Stand', note: 'Pick a bundle and a colour.' },
                { href: '/bundles', label: 'Bundles', note: 'Every size drawn on the same floor plan.' },
                { href: '/how-it-works', label: 'How it works', note: 'What happens when a customer taps.' },
                { href: '/faq', label: 'FAQ', note: 'Phones, shipping, and Google’s review policy.' },
                { href: '/multi-location', label: 'Multi-location quote', note: 'Ten stands or more.' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group block py-4">
                    <span className="block font-display text-lg font-bold tracking-tight group-hover:text-gold-deep">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-sm text-warm-600">{link.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
