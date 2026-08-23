/**
 * FAQ content, shared by the FAQ page, the homepage accordion, the PDP and the
 * FAQPage JSON-LD. Answers are paragraphs of plain text so the structured data
 * and the rendered page can never say different things.
 */

export type FaqTopic = 'phones' | 'setup' | 'shipping' | 'policy' | 'product';

export interface FaqEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: readonly string[];
  readonly topics: readonly FaqTopic[];
  /** Shown in the six-question homepage accordion. */
  readonly onHomepage?: boolean;
  /** Shown on the product page. */
  readonly onProduct?: boolean;
}

export const faqs: readonly FaqEntry[] = [
  {
    id: 'iphone',
    question: 'Does it work on iPhone?',
    answer: [
      'Yes — iPhone XS and newer, with no app to install. Hold the top edge of the phone against the stand and the review page opens in Safari.',
      'iPhone 7 through X can read it too, but the screen has to be awake and unlocked first. Anything older uses the QR code printed on the same face.',
    ],
    topics: ['phones'],
    onHomepage: true,
    onProduct: true,
  },
  {
    id: 'android',
    question: 'Does it work on Android?',
    answer: [
      'Yes. Almost every Android phone sold since about 2015 has NFC and leaves it switched on. Tap the middle of the back of the phone against the stand.',
      'If nothing happens, NFC is switched off in settings — or the phone is one of the budget models that ships without it, in which case the QR code covers it.',
    ],
    topics: ['phones'],
    onHomepage: true,
    onProduct: true,
  },
  {
    id: 'no-nfc',
    question: 'What if a customer’s phone has no NFC?',
    answer: [
      'Every stand has a QR code printed on the face, pointing at the same review page. The camera app reads it — no separate scanner app, no typing.',
      'In practice a busy counter uses both: regulars tap, and anyone whose phone does not cooperate scans instead.',
    ],
    topics: ['phones'],
    onHomepage: true,
    onProduct: true,
  },
  {
    id: 'power',
    question: 'Do I need wifi or power at the counter?',
    answer: [
      'No. The chip is passive — no battery, no charging, no pairing. It draws the tiny amount of power it needs from the phone that taps it.',
      'The stand works during a power cut and works in a basement. The customer’s phone needs a connection to load the review page, but the stand itself never does.',
    ],
    topics: ['setup', 'product'],
    onHomepage: true,
    onProduct: true,
  },
  {
    id: 'change-link',
    question: 'Can I change the link later?',
    answer: [
      'Yes, free and as often as you like. The chip stores a short TapRate address that forwards to your review page, so changing where it points is a settings change rather than a new stand.',
      'That matters if you move, rebrand, or want to send taps somewhere else for a week.',
    ],
    topics: ['setup'],
    onHomepage: true,
    onProduct: true,
  },
  {
    id: 'shipping-time',
    question: 'How long does shipping take?',
    answer: [
      'We program and pack orders in 1–2 business days. After that it is 3–7 business days across Canada and 5–9 to the US.',
      'Rush processing moves your order to the front of the programming queue for $12, so it leaves the next business day. It does not change carrier transit time.',
    ],
    topics: ['shipping'],
    onHomepage: true,
    onProduct: true,
  },
  {
    id: 'logo',
    question: 'Can I get my logo on it?',
    answer: [
      'Yes — $29 once per order, however many stands are in it. Send a PNG, SVG, or PDF after checkout and we email a proof before anything is printed.',
      'Printing adds one business day to processing.',
    ],
    topics: ['product'],
    onProduct: true,
  },
  {
    id: 'google-policy',
    question: 'Is asking for reviews against Google’s policy?',
    answer: [
      'Asking every customer for feedback is fine. What is not allowed is offering an incentive for a review, or filtering so that only happy customers are asked — Google calls that review gating.',
      'TapRate does not do either. There is no discount for leaving a review, no star-rating screen in front of the link, and no way to route unhappy customers somewhere private. The stand opens your public review page for everyone who taps it, whatever they are about to write.',
      'That is a deliberate product decision, and it is why the stand is a piece of acrylic rather than a funnel.',
    ],
    topics: ['policy'],
    onHomepage: true,
    onProduct: true,
  },
  {
    id: 'data',
    question: 'What do you know about the people who tap?',
    answer: [
      'Nothing that identifies them. The forwarder counts taps per stand so you can see which placement is doing the work, and that is the whole of it.',
      'No app is installed, no cookie is set on the customer’s phone, and we never see who they are or what they wrote.',
    ],
    topics: ['policy'],
    onProduct: true,
  },
  {
    id: 'durability',
    question: 'What happens if one stops working?',
    answer: [
      'We replace it. The chips have no moving parts and no battery to die, but if one fails we ship a programmed replacement at no charge.',
      'Unopened orders can be returned within 30 days for a refund.',
    ],
    topics: ['product', 'shipping'],
  },
  {
    id: 'multi-location',
    question: 'Can each location point at its own review page?',
    answer: [
      'Yes. We program each location’s stands to its own review link and label the boxes, so staff put the right ones out without checking with you.',
      'For ten or more, ask for a multi-location quote instead of ordering through checkout — it is priced for the whole group.',
    ],
    topics: ['setup'],
  },
];

export const homepageFaqs = faqs.filter((f) => f.onHomepage).slice(0, 6);
export const productFaqs = faqs.filter((f) => f.onProduct);
