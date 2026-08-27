/**
 * Brand + commerce configuration. Policy copy lives in ./legal.ts.
 *
 * Everything here is copy or policy, never layout. Swapping this file for a
 * headless CMS payload later means matching this shape and nothing else, * no component reads a hardcoded brand string.
 */

import { PLATE_SLUG } from './products';

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export const site = {
  name: 'Vouchify',
  legalEntity: 'Vouchify Supply Co.',
  tagline: 'NFC review cards for counters that get busy.',
  description:
    'A stand that sits on your counter. Customers tap their phone. Your Google review page opens. That is it.',
  supportEmail: 'support@vouchify.ca',
  url: 'https://www.vouchify.ca',
  currency: 'CAD',
  locale: 'en-CA',
  /** Free shipping kicks in at this subtotal, in cents. Drives the cart drawer bar. */
  freeShippingThresholdCents: 7500,
  /** Flat shipping charged below the threshold, in cents. */
  flatShippingCents: 900,
  /** Orders above this unit count are routed to the quote form, not checkout.
   *  Set to the qty of the largest purchasable stand tier, so that tier itself
   *  still checks out normally and only a cart totalling more than it nudges
   *  toward a quote. */
  multiLocationMinUnits: 50,
  /** Post-purchase upsell window, in minutes. Validated server-side against the
   *  Stripe session's created timestamp, never against a client clock. */
  upsellWindowMinutes: 15,
  shipping: {
    processing: '1–2 business days',
    canada: '3–7 business days',
    us: '5–9 business days',
    rush: 'Ships the next business day',
  },
  returns: {
    windowDays: 30,
  },
} as const;

export const primaryNav: readonly NavLink[] = [
  { href: '/products/nfc-review-stand', label: 'The Stand' },
  { href: `/products/${PLATE_SLUG}`, label: 'Review plate' },
  { href: '/bundles', label: 'Bundles' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/multi-location', label: 'Multi-location' },
];

export const footerNav: readonly { heading: string; links: readonly NavLink[] }[] = [
  {
    heading: 'Shop',
    links: [
      { href: '/products/nfc-review-stand', label: 'The Stand' },
      { href: '/bundles', label: 'Bundles' },
      { href: `/products/${PLATE_SLUG}`, label: 'Review plate' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/faq', label: 'FAQ' },
      { href: '/multi-location', label: 'Multi-location quote' },
    ],
  },
  {
    heading: 'Policies',
    links: [
      { href: '/legal/shipping', label: 'Shipping' },
      { href: '/legal/returns', label: 'Returns' },
      { href: '/legal/privacy', label: 'Privacy' },
      { href: '/legal/terms', label: 'Terms' },
    ],
  },
];

/** Shown in the footer on every page. Trademark hygiene, not a disclaimer dump. */
export const googleDisclaimer =
  'Vouchify is not affiliated with or endorsed by Google LLC. Google and Google Business Profile are trademarks of Google LLC.';
