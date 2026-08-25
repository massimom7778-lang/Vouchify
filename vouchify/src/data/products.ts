/**
 * The catalog. The entire storefront renders from this file.
 *
 * Rules:
 *  - Every price is an integer of cents. Formatting happens at the edge, never here.
 *  - Adding a SKU or a bundle tier means editing this file and nothing else.
 *  - Nothing in here is invented marketing math. Savings are derived from the real
 *    one-unit price at render time; there is no crossed-out MSRP anywhere.
 */

export type StandTierId = 'stand-1' | 'stand-2' | 'stand-3' | 'stand-5' | 'stand-10';
export type AddOnId = 'sticker' | 'custom-print' | 'rush';
export type Sku = StandTierId | AddOnId;


/**
 * An image slot.
 *
 * Until `src` is set, the slot renders as a labelled warm-grey block carrying
 * the shot description, so the brief for whoever is making the image is
 * readable straight off the page. Set `src` to a file under /public and the
 * real image takes over, nothing else has to change.
 *
 * Drop files in `public/product/` and see the README there for the manifest.
 */
export interface PhotoSlot {
  readonly id: string;
  readonly todo: string;
  readonly alt: string;
  readonly aspect: 'square' | 'portrait' | 'landscape' | 'wide';
  /** Public path, e.g. '/product/core-hero.jpg'. Omit while it does not exist. */
  readonly src?: string;
}

interface CatalogItemBase {
  readonly id: Sku;
  readonly name: string;
  readonly priceCents: number;
  /** One line, benefit-first. Used in the buy box and cart rows. */
  readonly shortLine: string;
  readonly photo: PhotoSlot;
}

export interface StandTier extends CatalogItemBase {
  readonly kind: 'stand-tier';
  readonly id: StandTierId;
  readonly qty: number;
  /** The reason a real owner would take this tier instead of the one below it. */
  readonly rationale: string;
  /** Where the extra units actually go. Shown in the tier comparison. */
  readonly coverage: string;
}

export interface AddOn extends CatalogItemBase {
  readonly kind: 'add-on';
  readonly id: AddOnId;
  readonly slug: string;
  /** 'picker' rows carry a thumbnail in the buy box. 'order-option' rows are
   *  per-order services shown as a compact pair beneath them. */
  readonly slot: 'picker' | 'order-option';
  /** Whether this SKU gets its own PDP at /products/[slug]. */
  readonly hasPage: boolean;
  /** Charged once per order rather than per unit. */
  readonly perOrder: boolean;
  readonly summary: string;
  /** Finish, where a product ships in one specific colourway. */
  readonly colorNote?: string;
  readonly details: readonly string[];
  readonly specs: readonly { readonly label: string; readonly value: string }[];
  /** Price when offered as the checkout order bump, if it is ever bumped. */
  readonly bumpPriceCents?: number;
}

export type CatalogItem = StandTier | AddOn;

/* -------------------------------------------------------------------------- */
/* Core SKU                                                                    */
/* -------------------------------------------------------------------------- */

export const CORE_SLUG = 'nfc-review-stand';

export const coreProduct = {
  slug: CORE_SLUG,
  name: 'The Stand',
  fullName: 'NFC Review Stand',
  headline: 'Customers tap. Your review page opens.',
  summary:
    'An acrylic countertop stand with an NFC chip inside and a QR code on the face. Both point at your Google review page. We program it to your link before it ships, so it works the moment you take it out of the box.',
  dimensions: '12.75 cm × 7.6 cm',
  /** Black is the only stand finish currently stocked. */
  colors: [{ id: 'black', label: 'Black', swatch: '#0B0B0C' }],
  specs: [
    { label: 'Size', value: '12.75 cm × 7.6 cm' },
    { label: 'Material', value: '3 mm cast acrylic, matte face' },
    { label: 'Chip', value: 'NTAG215, encoded before shipping' },
    { label: 'Backup', value: 'QR code printed on every stand' },
    { label: 'Power', value: 'None. Passive chip, no battery, no wifi' },
    { label: 'Link changes', value: 'Free, unlimited, from your dashboard' },
  ],
  /** Concrete, countable, and the first thing a cautious buyer looks for. */
  inTheBox: [
    'The stands, programmed to your review link and tested on both an iPhone and an Android handset',
    'A placement card showing where the first three go, in order',
    'Non-marking adhesive pads, one per stand, if you want them fixed down',
    'A card with your dashboard link for changing where the stands point',
  ],
  /** The commercial promise, stated as facts rather than as a slogan. */
  ownership: [
    { label: 'Price', value: 'Paid once' },
    { label: 'Monthly', value: '$0. There is no subscription and no plan to add one' },
    { label: 'Taps', value: 'Unlimited, for as long as you own the stand' },
    { label: 'Link changes', value: 'Free and unlimited' },
    { label: 'Per review', value: 'Nothing. We do not charge on results' },
  ],
  photos: {
    hero: {
      id: 'core-hero',
      todo: 'Product photo, black stand three-quarter view on a warm concrete counter, raking light from the left, shallow depth of field, no props',
      alt: 'Vouchify NFC review stand in black, standing on a counter',
      aspect: 'square',
    },
    inHand: {
      id: 'core-in-hand',
      todo: 'Product photo, a phone held two centimetres from the stand mid-tap, thumb visible, screen showing a review page, shot at counter height',
      alt: 'A customer holding a phone against the stand to open a review page',
      aspect: 'portrait',
    },
    pair: {
      id: 'core-pair',
      todo: 'Product photo, the black stand and the blue and white plate side by side on off-white seamless, straight-on, 50 mm',
      alt: 'The black stand and the blue and white review plate side by side',
      aspect: 'landscape',
    },
    counter: {
      id: 'core-counter',
      todo: 'Lifestyle photo, full-bleed, stand on a busy cafe pay counter next to a card terminal, real shop, no models looking at camera',
      alt: 'The stand on a cafe counter beside a card terminal',
      aspect: 'wide',
    },
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Tiers, the spine of the business                                           */
/* -------------------------------------------------------------------------- */

export const standTiers: readonly StandTier[] = [
  {
    kind: 'stand-tier',
    id: 'stand-1',
    name: '1 stand',
    qty: 1,
    priceCents: 3900,
    shortLine: 'One stand for the checkout counter.',
    rationale: 'The single spot where every customer already stops.',
    coverage: 'Checkout counter.',
    photo: {
      id: 'tier-1',
      todo: 'Product photo, one black stand, straight-on, off-white seamless',
      alt: 'One NFC review stand',
      aspect: 'square',
    },
  },
  {
    kind: 'stand-tier',
    id: 'stand-2',
    name: '2 stands',
    qty: 2,
    priceCents: 6900,
    shortLine: 'Counter and pay terminal.',
    rationale:
      'Two asks at the same visit. The counter catches them on the way in, the terminal catches them while the card is still in their hand.',
    coverage: 'Checkout counter, pay terminal.',
    photo: {
      id: 'tier-2',
      todo: 'Product photo, two black stands, one slightly behind the other, off-white seamless',
      alt: 'Two NFC review stands',
      aspect: 'square',
    },
  },
  {
    kind: 'stand-tier',
    id: 'stand-3',
    name: '3 stands',
    qty: 3,
    priceCents: 8900,
    shortLine: 'Covers a single-location shop.',
    rationale:
      'Counter, pay terminal, waiting area. Three placements is the point where a shop stops missing people, the ones who pay at the counter, the ones who pay at the table, and the ones sitting down waiting.',
    coverage: 'Checkout counter, pay terminal, waiting area.',
    photo: {
      id: 'tier-3',
      todo: 'Product photo, three black stands in a loose row, off-white seamless',
      alt: 'Three NFC review stands',
      aspect: 'square',
    },
  },
  {
    kind: 'stand-tier',
    id: 'stand-5',
    name: '5 stands',
    qty: 5,
    priceCents: 13900,
    shortLine: 'One per chair, bay, or table section.',
    rationale:
      'If your work happens at a station, a chair, a bay, a treatment room, the ask lands best right there, while the result is still in front of them. Five covers a typical floor with one spare.',
    coverage: 'Every station, plus counter and terminal.',
    photo: {
      id: 'tier-5',
      todo: 'Product photo, five black stands in two rows, off-white seamless, slight overhead angle',
      alt: 'Five NFC review stands',
      aspect: 'square',
    },
  },
  {
    kind: 'stand-tier',
    id: 'stand-10',
    name: '10 stands',
    qty: 10,
    priceCents: 24900,
    shortLine: 'Two locations, fully covered, with spares.',
    rationale:
      'Each location can point at its own review page, we program them per location and label the boxes so your staff put the right ones out.',
    coverage: 'Two full locations, per-location links, labelled boxes.',
    photo: {
      id: 'tier-10',
      todo: 'Product photo, ten black stands in a grid, flat lay on off-white, overhead',
      alt: 'Ten NFC review stands',
      aspect: 'square',
    },
  },
];

/** The tier selected on load. Everything else on the page follows this. */
export const DEFAULT_TIER_ID: StandTierId = 'stand-3';

/* -------------------------------------------------------------------------- */
/* Add-ons                                                                     */
/* -------------------------------------------------------------------------- */

export const addOns: readonly AddOn[] = [
  {
    kind: 'add-on',
    id: 'sticker',
    slug: 'sticker',
    name: 'Review plate',
    priceCents: 1500,
    bumpPriceCents: 1100,
    slot: 'picker',
    hasPage: true,
    perOrder: false,
    shortLine: 'Sticks flat to glass, counters, and menu boards.',
    colorNote: 'Blue and white',
    summary:
      'A 100 mm square NFC plate for the places a stand cannot go, the inside of the front window, the side of a POS terminal, the edge of a menu board.',
    details: [
      'Peel-and-stick on a 3M backing, 100 mm square, 1.5 mm thick, rated for indoor glass, laminate, and painted metal.',
      'Rigid face, so it stays flat instead of curling at the corners like a paper sticker.',
      'Same link as your stands, same free link changes.',
      'Printed QR code on the face for phones without NFC.',
    ],
    specs: [
      { label: 'Size', value: '100 × 100 mm, 1.5 mm thick' },
      { label: 'Finish', value: 'Blue and white' },
      { label: 'Adhesive', value: '3M backing, removable within 30 days' },
      { label: 'Chip', value: 'NTAG215, encoded before shipping' },
    ],
    photo: {
      id: 'addon-sticker',
      todo: 'Product photo, blue and white square NFC plate applied to the inside of a shop window, shot from inside at an angle with street visible but blurred',
      alt: 'Blue and white square NFC review plate applied to a shop window',
      aspect: 'square',
    },
  },
  {
    kind: 'add-on',
    id: 'custom-print',
    slug: 'custom-print',
    name: 'Your logo on the stand',
    priceCents: 2900,
    slot: 'order-option',
    hasPage: false,
    perOrder: true,
    shortLine: 'One-time setup, applies to every stand in this order.',
    summary:
      'We print your logo on the face of every stand in the order. Send the file after checkout; we send a proof back before anything is printed.',
    details: [
      'One-time charge per order, however many stands are in it.',
      'Send a PNG, SVG, or PDF after checkout. We reply with a proof.',
      'Printing adds one business day to processing.',
    ],
    specs: [
      { label: 'Charge', value: 'Once per order' },
      { label: 'Files', value: 'PNG, SVG, or PDF' },
      { label: 'Proof', value: 'Emailed before printing' },
    ],
    photo: {
      id: 'addon-custom-print',
      todo: 'Product photo, black stand with a generic wordmark printed on the face, macro on the print edge to show quality',
      alt: 'A stand with a business logo printed on the face',
      aspect: 'square',
    },
  },
  {
    kind: 'add-on',
    id: 'rush',
    slug: 'rush',
    name: 'Rush processing',
    priceCents: 1200,
    slot: 'order-option',
    hasPage: false,
    perOrder: true,
    shortLine: 'Programmed and shipped the next business day.',
    summary:
      'Moves your order to the front of the programming queue. It leaves the next business day instead of in one to two.',
    details: [
      'One-time charge per order.',
      'Affects processing time only. Carrier transit time is unchanged.',
      'Orders placed after 1pm ET ship the following business day.',
    ],
    specs: [
      { label: 'Charge', value: 'Once per order' },
      { label: 'Ships', value: 'Next business day' },
      { label: 'Cutoff', value: '1pm ET' },
    ],
    photo: {
      id: 'addon-rush',
      todo: 'Product photo, a packed shipping mailer with a rush label, on a warm concrete surface',
      alt: 'A packed Vouchify shipping mailer',
      aspect: 'square',
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Lineup back faces                                                           */
/* -------------------------------------------------------------------------- */

/**
 * What the homepage cards say when you turn them over.
 *
 * Every value here is taken from the specs above or from something the owner
 * has stated, because the moment it renders it is a product claim a buyer can
 * hold us to. Four lines were proposed for these cards that this catalogue
 * contradicts and that are therefore not here: an anodized aluminium body and a
 * weighted base (the stand is 3 mm cast acrylic on a folded foot), a 2 mm plate
 * profile (it is 1.5 mm), an outdoor and UV rating (the plate is rated indoor),
 * and a commercial-duty rating (nobody has rated it).
 */
export interface BackFaceRow {
  readonly label: string;
  readonly value: string;
}

export const lineupBackFaces: Record<'stand' | 'plate', readonly BackFaceRow[]> = {
  stand: [
    { label: 'Material', value: '3 mm cast acrylic, matte face, folded foot' },
    { label: 'Chip', value: 'NTAG215. Passive, no battery, no wifi, nothing to charge' },
    { label: 'Works with', value: 'iPhone and Android. Nothing for anyone to install' },
    {
      label: 'In the box',
      value: 'The stands encoded to your link, a placement card, adhesive pads, and your dashboard card',
    },
    { label: 'Durability', value: 'No moving parts and no battery. Wipes clean with a cloth' },
  ],
  plate: [
    { label: 'Material', value: '100 mm square, 1.5 mm thick, blue and white' },
    { label: 'Chip', value: 'NTAG215. Passive, no battery, nothing to charge' },
    { label: 'Mounts to', value: 'Glass, laminate counters, painted metal, menu boards' },
    { label: 'In the box', value: 'One plate on a 3M adhesive backing, encoded to your link' },
    { label: 'Durability', value: 'Rated indoor. Reads through glass from the inside' },
  ],
};

/* -------------------------------------------------------------------------- */
/* Link assignment                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Every chip is encoded individually before it ships, so a pack does not have to
 * point at one place. A three-pack can cover one counter three times over, or
 * three businesses that share an owner.
 *
 * This is why the choice belongs in the buy box rather than in a quote form: it
 * costs nothing extra and it decides what the customer is actually buying.
 */
export type LinkMode = 'shared' | 'per-unit';

export interface LinkModeOption {
  readonly id: LinkMode;
  readonly label: string;
  readonly blurb: string;
  /** Shown once the mode is selected, in the buy box. */
  readonly note: string;
}

export const linkModes: readonly LinkModeOption[] = [
  {
    id: 'shared',
    label: 'One link',
    blurb: 'Every stand opens the same review page.',
    note: 'All of them point at one review page. This is what a single shop wants.',
  },
  {
    id: 'per-unit',
    label: 'A link per stand',
    blurb: 'Each stand can point somewhere different.',
    note: 'Send one link per stand after checkout and we encode them separately, then label each box so the right stand reaches the right counter. No extra charge.',
  },
];

export const DEFAULT_LINK_MODE: LinkMode = 'shared';

/* -------------------------------------------------------------------------- */
/* Placements, the order stands should go out in                              */
/* -------------------------------------------------------------------------- */

/**
 * Where each additional stand goes, in the order an owner should place them.
 * This is a real priority sequence, not decoration: position 1 catches the most
 * people, position 10 the fewest. The shop plan and every "why more" argument
 * on the site read from this list, so the reasoning and the drawing can never
 * drift apart.
 */
export interface Placement {
  readonly n: number;
  readonly label: string;
  readonly note: string;
  /** Which of the two plans this position belongs to. */
  readonly location: 1 | 2;
  /** Centre of the dot in the 300 x 260 plan drawing. */
  readonly x: number;
  readonly y: number;
}

export const placements: readonly Placement[] = [
  { n: 1, label: 'Checkout counter', note: 'Everyone stops here. It is the one placement no shop should skip.', location: 1, x: 100, y: 53 },
  { n: 2, label: 'Pay terminal', note: 'Catches them while the card is still in their hand.', location: 1, x: 191, y: 53 },
  { n: 3, label: 'Waiting area', note: 'People sitting with nothing to do are the easiest ask of the day.', location: 1, x: 215, y: 207 },
  { n: 4, label: 'First chair or bay', note: 'The ask lands best while the work is still in front of them.', location: 1, x: 255, y: 100 },
  { n: 5, label: 'Second chair or bay', note: 'One per station means no customer has to walk to find it.', location: 1, x: 255, y: 150 },
  { n: 6, label: 'Second location counter', note: 'Programmed to that location\u2019s own review page.', location: 2, x: 100, y: 53 },
  { n: 7, label: 'Second location terminal', note: 'Same two-ask pattern that works at the first shop.', location: 2, x: 191, y: 53 },
  { n: 8, label: 'Second location waiting', note: 'Covers the room where people sit the longest.', location: 2, x: 215, y: 207 },
  { n: 9, label: 'Second location chair', note: 'Station coverage, second floor plan.', location: 2, x: 255, y: 100 },
  { n: 10, label: 'Spare', note: 'One in the drawer for the stand that gets knocked off a counter.', location: 2, x: 255, y: 150 },
];

export const PLACEMENTS_PER_LOCATION = 5;

/* -------------------------------------------------------------------------- */
/* Offers driven by the catalog                                                */
/* -------------------------------------------------------------------------- */

/** Checkout order bump. Priced from the add-on's own bumpPriceCents. */
export const orderBump = {
  addOnId: 'sticker' as const,
  copy: 'Add a window sticker so the ask reaches people before they are through the door, same link as your stands.',
} as const;

/** Post-purchase upsell. The window is enforced server-side against the Stripe
 *  session timestamp; there is no countdown driven by a client clock. */
export const postPurchaseUpsell = {
  tierId: 'stand-3' as const,
  priceCents: 7900,
  heading: 'Add two more placements to this order',
  copy: 'Your order is already packed and programmed to your link. Adding three more stands now means one shipment, one setup, and no second shipping charge.',
} as const;

/* -------------------------------------------------------------------------- */
/* Lookups                                                                     */
/* -------------------------------------------------------------------------- */

export const catalog: readonly CatalogItem[] = [...standTiers, ...addOns];

const bySku = new Map<Sku, CatalogItem>(catalog.map((item) => [item.id, item]));

export function getCatalogItem(id: string): CatalogItem | undefined {
  return bySku.get(id as Sku);
}

export function getStandTier(id: string): StandTier | undefined {
  const item = bySku.get(id as Sku);
  return item?.kind === 'stand-tier' ? item : undefined;
}

export function getAddOn(id: string): AddOn | undefined {
  const item = bySku.get(id as Sku);
  return item?.kind === 'add-on' ? item : undefined;
}

export function getAddOnBySlug(slug: string): AddOn | undefined {
  return addOns.find((addOn) => addOn.slug === slug);
}

export const buyBoxAddOns = addOns.filter((a) => a.slot === 'picker');
export const orderOptions = addOns.filter((a) => a.slot === 'order-option');
export const addOnPages = addOns.filter((a) => a.hasPage);

/** The single-unit price every saving on the site is measured against. */
export const UNIT_PRICE_CENTS = standTiers[0]!.priceCents;

export interface TierEconomics {
  readonly perUnitCents: number;
  readonly listCents: number;
  readonly savingsCents: number;
  readonly savingsPercent: number;
}

/** Derived, never stored. If a tier price changes, every savings figure follows. */
export function tierEconomics(tier: StandTier): TierEconomics {
  const listCents = tier.qty * UNIT_PRICE_CENTS;
  const savingsCents = listCents - tier.priceCents;
  return {
    perUnitCents: Math.round(tier.priceCents / tier.qty),
    listCents,
    savingsCents,
    savingsPercent: listCents === 0 ? 0 : Math.round((savingsCents / listCents) * 100),
  };
}

/** Which numbered placements a tier actually fills. Replaces the badges. */
export function coveredPositions(tier: StandTier): { from: number; to: number } {
  return { from: 1, to: Math.min(tier.qty, placements.length) };
}

export const priceRangeCents = {
  low: Math.min(...standTiers.map((t) => t.priceCents)),
  high: Math.max(...standTiers.map((t) => t.priceCents)),
};
