import type { Metadata } from 'next';
import Link from 'next/link';
import { PurchaseTracker } from './PurchaseTracker';
import { UpsellOffer } from './UpsellOffer';
import { ButtonLink, Eyebrow, Grid, Price, Section } from '@/components/ui';
import {
  getStandTier,
  postPurchaseUpsell,
  coreProduct,
  type StandTierId,
} from '@/data/products';
import { site } from '@/data/site';
import { getStripe, isStripeConfigured, siteOrigin } from '@/lib/stripe';
import { provisionFromCheckoutSession } from '@/lib/provision';
import { sendOrderConfirmation } from '@/lib/notify';

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
  /** The tokenised dashboard link. Also printed on a card in the box. */
  dashboardUrl: string | null;
  perUnitLinks: boolean;
  standCount: number;
  /** The largest pack in the order, written into metadata at checkout. */
  tierId: StandTierId | 'none';
}

async function loadOrder(sessionId: string): Promise<OrderView | null> {
  if (!isStripeConfigured()) return null;
  try {
    const stripe = getStripe();
    let session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return null;

    // The upsell's card-authentication fallback is its own paid session, but it
    // is a top-up rather than an order. Everything this page shows — the total,
    // the dashboard link, the offer window — belongs to the original order, so
    // follow the pointer and render that instead. The webhook is what actually
    // appends the stands.
    const parentSessionId = session.metadata?.upsellFor;
    if (parentSessionId && parentSessionId !== session.id) {
      session = await stripe.checkout.sessions.retrieve(parentSessionId);
      if (session.payment_status !== 'paid') return null;
    }

    const elapsed = Math.floor(Date.now() / 1000) - session.created;
    const remaining = site.upsellWindowMinutes * 60 - elapsed;

    // Provisioning is idempotent on the session id, so a refresh is harmless.
    // The webhook calls the same function; whichever arrives first creates the
    // order, and whichever created it sends the confirmation. A session with
    // no stand tier in it (a review-plate-only order, say) still gets
    // provisioned — it just has nothing for a dashboard to show, so the card
    // below stays hidden rather than linking to an empty one.
    const sessionStandCount = Number(session.metadata?.standCount ?? 0) || 0;
    let dashboardUrl: string | null = null;
    try {
      const result = await provisionFromCheckoutSession(session);
      if (result) {
        if (sessionStandCount > 0) {
          dashboardUrl = `${siteOrigin()}/dashboard/${result.order.dashboardToken}`;
        }
        // This page creating the order used to mean no confirmation was ever
        // sent: the webhook would arrive later, see `created: false` and return
        // early, leaving the dashboard link only on a page about to be closed.
        if (result.created) {
          await sendOrderConfirmation({ order: result.order, session });
        }
      }
    } catch (error) {
      console.error('[thank-you] provisioning failed', error);
    }

    const metaTier = session.metadata?.tierId;
    const tierId: StandTierId | 'none' =
      metaTier && getStandTier(metaTier) ? (metaTier as StandTierId) : 'none';

    return {
      dashboardUrl,
      tierId,
      standCount: Number(session.metadata?.standCount ?? 0) || 0,
      perUnitLinks: session.metadata?.linkPlan === 'per-unit',
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
      {/* Sends the purchase event from the browser. `order` is non-null only
          when Stripe confirmed the session as paid, so a bookmarked or forged
          /thank-you URL records nothing. */}
      {sessionId && order ? (
        <PurchaseTracker
          sessionId={sessionId}
          valueCents={order.totalCents ?? 0}
          standCount={order.standCount}
          tierId={order.tierId}
          upsellReturned={upsell === 'done'}
        />
      ) : null}
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

            {order?.dashboardUrl ? (
              <div className="mt-8 rounded-md border border-warm-300 bg-warm-50 p-5">
                <h2 className="text-lg">Your stands dashboard</h2>
                <p className="mt-2 text-sm text-warm-700">
                  {order.perUnitLinks
                    ? 'You asked for a separate link per stand. Set each one here, the same link is printed on a card in the box.'
                    : 'Change where any stand points, and see which placement is doing the work. The same link is printed on a card in the box.'}
                </p>
                <a
                  href={order.dashboardUrl}
                  className="mt-3 block break-all rounded-sm border border-warm-300 bg-paper px-3 py-2 text-sm font-semibold text-gold-deep underline underline-offset-4"
                >
                  {order.dashboardUrl}
                </a>
                <p className="mt-2 text-2xs text-warm-600">
                  Anyone with this link can re-point your stands. Keep it somewhere only staff you
                  trust can reach.
                </p>
              </div>
            ) : null}

            <div className="mt-8">
              <h2 className="text-lg">What happens next</h2>
              <ol className="mt-4 divide-y divide-warm-300 border-y border-warm-300">
                {[
                  order?.reviewLink
                    ? 'We program every chip to the review link you gave us and test it.'
                    : 'We email you for your Google review link, then program and test every chip.',
                  'The order ships with tracking. Canada 3–7 business days, US 5–9.',
                  'Put the first one on the counter. It works out of the box, nothing to set up.',
                ].map((text, index) => (
                  <li key={text} className="flex gap-4 py-4">
                    <span
                      data-numeric
                      className="font-display text-lg font-bold leading-tight tracking-tight text-gold-deep"
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
                className="font-semibold text-gold-deep underline underline-offset-4"
              >
                {site.supportEmail}
              </a>
              .
            </p>
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            {offerOpen && tier && sessionId ? (
              <UpsellOffer sessionId={sessionId} tier={tier} minutesLeft={order.minutesLeft} />
            ) : null}

            <div
              className={`rounded-md border border-warm-300 bg-warm-50 p-6 ${
                offerOpen && tier && sessionId ? 'mt-6' : ''
              }`}
            >
              <h2 className="text-xl">
                {order?.upsellRedeemed || upsell === 'done'
                  ? 'Extra stands added.'
                  : 'While you are here'}
              </h2>
              <p className="mt-3 text-base text-warm-700">
                {order?.upsellRedeemed || upsell === 'done'
                  ? 'They are going in the same box, programmed to the same link.'
                  : 'Review plates carry the same link as your stands, useful for the window and the places a stand will not sit.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={`/products/${coreProduct.slug}`} size="md">
                  The Stand
                </ButtonLink>
                <ButtonLink href="/products/sticker" variant="outline" size="md">
                  Review plates
                </ButtonLink>
              </div>
            </div>

            {!order && sessionId ? (
              <p className="mt-4 text-xs text-warm-600">
                We could not load the order details for this page. That does not affect your
                payment, if you have a Stripe receipt, the order is in.
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
