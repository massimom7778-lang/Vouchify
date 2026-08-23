import type { Metadata } from 'next';
import Link from 'next/link';
import { UpsellOffer } from './UpsellOffer';
import { ButtonLink, Eyebrow, Grid, Price, Section } from '@/components/ui';
import { getStandTier, postPurchaseUpsell, coreProduct } from '@/data/products';
import { site } from '@/data/site';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
};

interface OrderView {
  email: string | null;
  totalCents: number | null;
  currency: string;
  reviewLink: string;
  minutesLeft: number;
  upsellRedeemed: boolean;
}

async function loadOrder(sessionId: string): Promise<OrderView | null> {
  if (!isStripeConfigured()) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return null;

    const elapsed = Math.floor(Date.now() / 1000) - session.created;
    const remaining = site.upsellWindowMinutes * 60 - elapsed;

    return {
      email: session.customer_details?.email ?? null,
      totalCents: session.amount_total,
      currency: (session.currency ?? site.currency).toUpperCase(),
      reviewLink: session.metadata?.reviewLink ?? '',
      minutesLeft: Math.max(0, Math.ceil(remaining / 60)),
      upsellRedeemed: session.metadata?.upsellStatus === 'redeemed',
    };
  } catch {
    return null;
  }
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; upsell?: string }>;
}) {
  const { session_id: sessionId, upsell } = await searchParams;
  const order = sessionId ? await loadOrder(sessionId) : null;
  const tier = getStandTier(postPurchaseUpsell.tierId);

  const offerOpen =
    Boolean(sessionId) &&
    order !== null &&
    !order.upsellRedeemed &&
    order.minutesLeft > 0 &&
    upsell !== 'done' &&
    tier !== undefined;

  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow>Order confirmed</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl">That is it. We take it from here.</h1>

            <p className="mt-6 text-base text-warm-700">
              {order?.email
                ? `A receipt is on its way to ${order.email}.`
                : 'A receipt is on its way to the email you used at checkout.'}{' '}
              We program and pack in {site.shipping.processing}, and every stand is tapped on both an
              iPhone and an Android handset before it goes in the box.
            </p>

            {order?.totalCents !== null && order?.totalCents !== undefined ? (
              <p className="mt-6 flex items-baseline gap-3 border-y border-warm-300 py-4">
                <span className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
                  Paid
                </span>
                <Price cents={order.totalCents} size="lg" />
              </p>
            ) : null}

            <div className="mt-8">
              <h2 className="text-lg">What happens next</h2>
              <ol className="mt-4 divide-y divide-warm-300 border-y border-warm-300">
                {[
                  order?.reviewLink
                    ? 'We program every chip to the review link you gave us and test it.'
                    : 'We email you for your Google review link, then program and test every chip.',
                  'The order ships with tracking. Canada 3–7 business days, US 5–9.',
                  'Put the first one on the counter. It works out of the box — nothing to set up.',
                ].map((text, index) => (
                  <li key={text} className="flex gap-4 py-4">
                    <span
                      data-numeric
                      className="font-display text-lg font-extrabold leading-tight tracking-tight text-signal-deep"
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm text-warm-700">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-6 text-sm text-warm-600">
              Questions about this order? Email{' '}
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
            {offerOpen && tier && sessionId ? (
              <UpsellOffer sessionId={sessionId} tier={tier} minutesLeft={order.minutesLeft} />
            ) : (
              <div className="rounded-md border border-warm-300 bg-warm-50 p-6">
                <h2 className="text-xl">
                  {order?.upsellRedeemed || upsell === 'done'
                    ? 'Extra stands added.'
                    : 'While you are here'}
                </h2>
                <p className="mt-3 text-base text-warm-700">
                  {order?.upsellRedeemed || upsell === 'done'
                    ? 'They are going in the same box, programmed to the same link.'
                    : 'Keychains, wallet cards and window stickers carry the same link as your stands — useful for the customers who never reach the counter.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={`/products/${coreProduct.slug}`} size="md">
                    The Stand
                  </ButtonLink>
                  <ButtonLink href="/products/keychain" variant="outline" size="md">
                    Add-ons
                  </ButtonLink>
                </div>
              </div>
            )}

            {!order && sessionId ? (
              <p className="mt-4 text-xs text-warm-600">
                We could not load the order details for this page. That does not affect your
                payment — if you have a Stripe receipt, the order is in.
              </p>
            ) : null}

            {!sessionId ? (
              <p className="mt-4 text-xs text-warm-600">
                This page is shown after checkout.{' '}
                <Link href="/" className="underline underline-offset-4">
                  Back to the store
                </Link>
                .
              </p>
            ) : null}
          </div>
        </Grid>
      </Section>
    </main>
  );
}
