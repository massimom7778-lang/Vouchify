# TapRate

Storefront for NFC tap-to-review stands, sold to owner-operators: restaurants,
salons, barbershops, detailers, med spas, dental clinics, contractors.

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · Stripe Checkout ·
Zustand. No component library.

---

## Setup

```bash
npm install
cp .env.example .env.local     # add your Stripe keys
npm run dev                    # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build. Must pass clean before anything ships. |
| `npm run typecheck` | `tsc --noEmit` on its own |
| `npm run lint` | ESLint, including `no-explicit-any` and `no-unused-vars` as errors |

### Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public origin. Canonical URLs, OpenGraph, sitemap, and the success/cancel URLs handed to Stripe. |
| `STRIPE_SECRET_KEY` | For payments | Server only. Never exposed to the browser. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For payments | Safe in the browser. |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | From `stripe listen` or the dashboard. |
| `RESEND_API_KEY` | No | Without it the multi-location quote form still validates and accepts submissions, and logs them server-side instead of emailing. |
| `QUOTE_FROM_EMAIL` | No | Verified Resend sender for quote notifications. |

Without Stripe keys the whole storefront still builds and runs — the pay button
reports that payments are not configured rather than throwing.

Deploy target is Vercel. No build step beyond `next build`.

---

## How to add a product

The catalog is one file: **`src/data/products.ts`**. Adding a SKU means editing
that file and nothing else — no component knows any product by name.

### Add a bundle tier

Append to `standTiers`:

```ts
{
  kind: 'stand-tier',
  id: 'stand-20',          // add 'stand-20' to the StandTierId union above
  name: '20 stands',
  qty: 20,
  priceCents: 45900,       // integer cents, always
  badge: { label: 'Franchise', tone: 'scale' },
  shortLine: 'Four locations, fully covered.',
  rationale: 'The reason an owner takes this instead of the tier below it.',
  coverage: 'Four full locations, per-location links.',
  photo: { id: 'tier-20', todo: 'Product photo — …', alt: '…', aspect: 'square' },
}
```

That one edit updates the product page selector, the homepage price table, the
`/bundles` comparison, the JSON-LD `AggregateOffer`, and the cart. Savings and
per-unit figures are derived from the real one-unit price by `tierEconomics()` —
never stored, so they cannot drift.

### Add an add-on

Append to `addOns` and add its id to the `AddOnId` union:

- `slot: 'picker'` puts it in the product page add-on list with a thumbnail.
- `slot: 'order-option'` puts it in the compact per-order row (like rush).
- `hasPage: true` generates a PDP at `/products/[slug]` and a sitemap entry.
- `perOrder: true` pins the quantity to one however many times it is added.
- `bumpPriceCents` makes it eligible to be the checkout order bump.

### Change an offer

- Checkout order bump: `orderBump` (which add-on, and the sentence of copy).
- Post-purchase upsell: `postPurchaseUpsell` (which tier, the price, the copy).
- The upsell window length: `site.upsellWindowMinutes`.

### Change brand, shipping or policy

`src/data/site.ts` for brand, nav, support email, currency, shipping thresholds.
`src/data/legal.ts` for the four policy pages. `src/data/faq.ts` for FAQ answers,
which feed the FAQ page, the homepage accordion, the product page, and the
`FAQPage` structured data from one source.

---

## Where things live

| Path | What it is |
| --- | --- |
| `src/data/products.ts` | The catalog: tiers, add-ons, offers, placements, savings maths |
| `src/data/site.ts` | Brand, nav, thresholds |
| `src/data/faq.ts`, `steps.ts`, `legal.ts` | Editorial content |
| `src/app/globals.css` | Every design token: colour, type scale, radius, motion |
| `src/components/ui/` | Primitives. Nothing here knows about products. |
| `src/components/ShopPlan.tsx` | The shop plan drawing |
| `src/lib/cart.ts` | Zustand cart, persisted, plus derived totals |
| `src/lib/pricing.ts` | The only place an order total is computed for payment |
| `src/lib/schemas.ts` | Zod schemas for every API route |
| `/styleguide` | Living token and primitive reference. Not indexed. |

---

## Things worth knowing before you change them

**Prices are integer cents everywhere.** The data layer never holds a formatted
string. `formatMoney()` in `src/lib/format.ts` is the only thing that turns cents
into text, and every price carries `[data-numeric]` so digits are tabular and a
changing total does not shift the layout around it.

**The client never sends a price.** The cart stores SKU, quantity and colour.
`priceOrder()` looks up every amount from the catalog server-side before it
reaches Stripe, including the order bump. A tampered payload can change what is
bought but never what it costs.

**The upsell window is real.** `/api/upsell` measures the 15 minutes against the
Stripe Checkout Session's own `created` timestamp. There is no client clock
involved, a late request is refused with 410, and `upsellStatus` in the session
metadata makes a second redemption impossible. If the saved card demands
authentication, the route hands back a Checkout Session URL instead of an error.

**No invented numbers.** There are no fake countdowns, no "12 people viewing",
no crossed-out MSRPs, no fabricated review counts. Savings are computed from the
real one-unit price. Where content is missing it is a visible `TODO:` marker
naming exactly what is needed — grep for `TODO:` to find the shot list, the logo
strip, and the testimonial slots.

**Photography.** Every image slot is a `PhotoSlot` in `products.ts` carrying the
shot description. `PhotoBlock` renders it as a warm-grey block with that
description printed on it. Replace each with `next/image` per slot as the real
photographs arrive.

**The shop plan is the argument.** `placements` in `products.ts` is a single
ordered list of ten positions. The drawing, the legend, the tier `coverage`
strings and the homepage placement list all read from it, so the picture and the
copy cannot disagree.

---

## Accessibility and SEO

Audited at 375 / 768 / 1440 across all 16 routes: no horizontal overflow, exactly
one `h1` per page, no skipped heading levels, no unlabelled controls. The cart
drawer traps focus, closes on Escape, locks body scroll and restores focus on the
way out. Accordions use real buttons with `aria-expanded` / `aria-controls` and
arrow-key navigation. Colour contrast is documented with measured ratios on
`/styleguide` — note that `#FF4D14` is only 3.02:1 on paper, which is why orange
text uses the darkened `signal-deep` token.

Per-page metadata and OpenGraph, `Product` + `AggregateOffer` JSON-LD on product
pages, `FAQPage` on the FAQ, plus `sitemap.ts` and `robots.ts`.

---

## Not built yet

- Stripe webhook handler (`STRIPE_WEBHOOK_SECRET` is reserved for it). Orders are
  currently confirmed by reading the Checkout Session on the thank-you page.
- Real photography, customer logos, and testimonials — all marked `TODO:`.
- Tax configuration. Stripe Tax is not enabled; totals are shown before tax.
- The link-forwarding dashboard the FAQ refers to.
