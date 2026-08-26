import 'server-only';
import Stripe from 'stripe';

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Lazily constructed so a clone without keys still builds and renders — the
 * storefront works, only the pay button reports that Stripe is not configured.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Copy .env.example to .env.local and add your keys.',
    );
  }
  if (!client) client = new Stripe(key);
  return client;
}

/**
 * The origin every Stripe redirect, dashboard link and forwarder redirect is
 * built from.
 *
 * In production a missing NEXT_PUBLIC_SITE_URL used to fall through to
 * localhost, which does not error anywhere: paying customers get redirected to
 * a machine that is not theirs, and the dashboard link in their confirmation
 * email points at the same place. A misconfigured deploy has to fail loudly
 * instead, so this throws.
 */
export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (configured) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is not set. Stripe redirects, dashboard links and ' +
        'forwarder redirects would all point at localhost. Set it to the ' +
        'production origin (e.g. https://www.vouchify.ca) and redeploy.',
    );
  }

  return 'http://localhost:3000';
}
