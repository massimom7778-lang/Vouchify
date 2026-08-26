import type { Metadata } from 'next';
import { Eyebrow, Section } from '@/components/ui';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'This stand has no link yet',
  robots: { index: false, follow: false },
};

/**
 * A real state, not an error: the owner chose a separate link per stand and has
 * not filled this one in. The customer gets an explanation instead of a dead end.
 */
export default async function StandNotSetUpPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <main id="main">
      <Section rhythm="tight" className="pt-16">
        <div className="max-w-prose">
          <Eyebrow>Not pointed anywhere yet</Eyebrow>
          <h1 className="mt-4 text-2xl md:text-3xl">This stand has no link on it yet.</h1>
          <p className="mt-6 text-base text-warm-700">
            The chip works, the business just has not told it where to send you. If you meant to
            leave them a review, search their name on Google and use the review button on their
            listing.
          </p>

          {code ? (
            <p className="mt-8 flex flex-wrap items-baseline gap-3 border-y border-warm-300 py-4">
              <span className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
                Stand code
              </span>
              <span data-numeric className="font-display text-xl font-bold tracking-tight">
                {code}
              </span>
            </p>
          ) : null}

          <p className="mt-6 text-sm text-warm-600">
            If this is your stand: open the dashboard link on the card that came in the box and paste
            your review link against{' '}
            {code ? <span data-numeric className="font-semibold">{code}</span> : 'this code'}. Lost the
            card? Email{' '}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-semibold text-gold-deep underline underline-offset-4"
            >
              {site.supportEmail}
            </a>{' '}
            and we will send it again.
          </p>
        </div>
      </Section>
    </main>
  );
}
