import { site } from './site';

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

/**
 * Policy copy, written to be read rather than to be survived. It is plain text
 * on purpose, a shop owner should be able to find the answer in one screen.
 *
 * TODO: have a lawyer in your jurisdiction review these before launch. They are
 * written to be accurate about how the product actually works, not as a
 * substitute for legal advice.
 */
export const legalPages: readonly LegalPage[] = [
  {
    slug: 'shipping',
    title: 'Shipping',
    summary: 'When it leaves, how long it takes, and what rush processing actually changes.',
    updated: '2026-08-01',
    sections: [
      {
        heading: 'Processing',
        body: [
          `Orders are programmed and packed in ${site.shipping.processing}. Every chip is encoded to your review link and tested on both an iPhone and an Android handset before it goes in the box.`,
          'Logo printing adds one business day. Orders placed after 1pm ET start counting from the next business day.',
        ],
      },
      {
        heading: 'Transit',
        body: [
          `Canada: ${site.shipping.canada} after dispatch. United States: ${site.shipping.us}.`,
          'Every order ships with tracking. The tracking number is emailed when the label is created, which is usually a few hours before the parcel is collected.',
        ],
      },
      {
        heading: 'Rush processing',
        body: [
          `Rush processing costs $12 and moves your order to the front of the programming queue, so it ${site.shipping.rush.toLowerCase()}.`,
          'It changes our part only. Carrier transit time is unchanged, and we cannot make a courier go faster.',
        ],
      },
      {
        heading: 'Free shipping',
        body: [
          `Orders of $75 or more ship free within Canada and the United States. Below that, shipping is a flat $9.`,
          'Duties and taxes for US orders are calculated at checkout where applicable.',
        ],
      },
      {
        heading: 'Something went wrong',
        body: [
          `If a parcel is late, damaged, or lost, email ${site.supportEmail} with your order number. We replace lost and damaged orders rather than opening a claim and asking you to wait for it.`,
        ],
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns',
    summary: 'Thirty days, no restocking fee, and free replacements for anything that fails.',
    updated: '2026-08-01',
    sections: [
      {
        heading: 'The window',
        body: [
          `You have ${site.returns.windowDays} days from delivery to return an order for a full refund. There is no restocking fee.`,
          'Stands must be in resalable condition. A stand that has sat on a counter for a week is fine; one with a logo sticker over the QR code is not.',
        ],
      },
      {
        heading: 'Custom printing',
        body: [
          'Stands printed with your logo cannot be returned for a refund, because they cannot be sold to anyone else. We email a proof before printing so nothing goes to press unapproved.',
          'If a printed order arrives wrong, wrong logo, wrong placement, wrong colour, that is our error and we reprint it at no charge.',
        ],
      },
      {
        heading: 'Faults',
        body: [
          'If a chip fails, we ship a programmed replacement free, inside or outside the return window. NFC tags have no battery and no moving parts, so this is rare, but it happens.',
          'You do not need to send the failed one back unless we ask.',
        ],
      },
      {
        heading: 'How to start one',
        body: [
          `Email ${site.supportEmail} with your order number and what you want to do. We reply with a prepaid return label for Canadian orders.`,
          'Refunds go back to the original payment method within five business days of the return arriving.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    summary: 'What we collect from you, what we count when a customer taps, and what we never see.',
    updated: '2026-08-01',
    sections: [
      {
        heading: 'What we collect from you',
        body: [
          'To fulfil an order: your name, email, shipping address, and the Google review link you want the chips programmed to. Payment card details go to Stripe and never reach our servers.',
          'To answer an email: whatever you write to us, kept as long as the conversation is useful.',
        ],
      },
      {
        heading: 'What happens when a customer taps',
        body: [
          'The chip holds a short Vouchify address that forwards to your review page. Each forward is counted so you can see which stand is doing the work.',
          'What is recorded is a count per stand, plus the date. No cookie is set on the customer’s phone, no app is installed, and nothing that identifies the individual is stored.',
          'We never see what a customer writes in a review, or whether they wrote one at all. That happens entirely on Google’s side.',
        ],
      },
      {
        heading: 'Who else is involved',
        body: [
          'Stripe processes payments and holds the payment details. Our email provider handles order and support mail. Our hosting provider serves the site. Each of them sees only what it needs to do its job.',
          'We do not sell customer data, and we do not run advertising trackers on this site.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          `Email ${site.supportEmail} to get a copy of what we hold about you, correct it, or have it deleted. Deleting your account data does not stop your stands working, the link forwarding continues.`,
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms',
    summary: 'What you are buying, what we promise, and the one thing we will not do.',
    updated: '2026-08-01',
    sections: [
      {
        heading: 'What you are buying',
        body: [
          'A physical stand containing a programmed NFC chip, plus link forwarding for as long as you own it. There is no subscription and no per-review charge.',
          'Link changes are free and unlimited. If Vouchify ever stops operating the forwarder, we will publish a way to reprogram your chips to point directly at your review page.',
        ],
      },
      {
        heading: 'Review policy',
        body: [
          'Vouchify is built to ask every customer for feedback, not to filter for happy ones. We do not build review gating, we do not support routing negative feedback to a private form, and we will not add either.',
          'Offering customers an incentive in exchange for a review breaks Google’s policies. What you do in your own shop is your business, but the product does not help you do it.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'The forwarding link must point at a review page for a business you operate. It may not be used for redirects unrelated to reviews, or for anything unlawful.',
          'We can disable a forwarding link that is being misused. If we do, we will tell you why.',
        ],
      },
      {
        heading: 'Trademarks',
        body: [
          'Google and Google Business Profile are trademarks of Google LLC. Vouchify is not affiliated with, endorsed by, or sponsored by Google LLC.',
          'We describe compatibility in words rather than using Google’s marks in our branding, deliberately.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'We are responsible for the product arriving as described and working. We are not responsible for how many reviews you receive, or what they say, that is up to your customers.',
          `These terms are governed by the laws of the province in which ${site.legalEntity} is registered.`,
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return legalPages.find((page) => page.slug === slug);
}
