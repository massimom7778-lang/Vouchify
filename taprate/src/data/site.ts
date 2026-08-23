/**
 * Brand + commerce configuration.
 *
 * Everything here is copy or policy, never layout. Swapping this file for a
 * headless CMS payload later means matching this shape and nothing else —
 * no component reads a hardcoded brand string.
 */

export interface PolicySection {
  readonly heading: string;
  readonly body: readonly string[];
}

export interface LegalPage {
  readonly slug: 'shipping' | 'returns' | 'privacy' | 'terms';
  readonly title: string;
  readonly summary: string;
  readonly updated: string;
  readonly sections: readonly PolicySection[];
}

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export const site = {
  name: 'TapRate',
  legalEntity: 'TapRate Supply Co.',
  tagline: 'Tap-to-review stands for counters that get busy.',
  description:
    'A stand that sits on your counter. Customers tap their phone. Your Google review page opens. That is it.',
  supportEmail: 'support@taprate.co',
  /** TODO: replace with the production domain before launch. */
  url: 'https://taprate.co',
  currency: 'CAD',
  locale: 'en-CA',
  /** Free shipping kicks in at this subtotal, in cents. Drives the cart drawer bar. */
  freeShippingThresholdCents: 7500,
  /** Flat shipping charged below the threshold, in cents. */
  flatShippingCents: 900,
  /** Orders at or above this unit count are routed to the quote form, not checkout. */
  multiLocationMinUnits: 10,
  /** Post-purchase upsell window, in minutes. Validated server-side against the
   *  Stripe session's created timestamp — never against a client clock. */
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
      { href: '/products/keychain', label: 'Review keychain' },
      { href: '/products/wallet-card', label: 'Review cards' },
      { href: '/products/sticker', label: 'Window sticker' },
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
  'TapRate is not affiliated with or endorsed by Google LLC. Google and Google Business Profile are trademarks of Google LLC.';
