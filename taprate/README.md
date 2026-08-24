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
| `src/lib/store/` | The forwarder's data layer: interface, adapters, `schema.sql` |
| `src/lib/provision.ts` | Paid order to stand records, idempotent on the Stripe session |
| `src/app/r/[code]/` | The forwarder every chip points at |
| `src/app/dashboard/[token]/` | Owner dashboard: re-point stands, see tap counts |
| `src/lib/pricing.ts` | The only place an order total is computed for payment |
| `src/lib/schemas.ts` | Zod schemas for every API route |
| `/styleguide` | Living token and primitive reference. Not indexed. |

---

## The forwarder

Chips are encoded once with a short TapRate address (`/r/K3M7QX2`) and never
again. A tap is one lookup, one counter increment, and a 302. Everything that
changes afterwards is a row in the database — which is exactly why link changes
are free and why a stand can be re-pointed without touching it.

```
tap  →  GET /r/[code]  →  lookup  →  count today  →  302 to the review page
                              ↓ no such code      → /stand/unknown
                              ↓ no link set yet   → /stand/not-set-up
```

**Setup.** Provision Postgres, set `DATABASE_URL`, then:

```bash
psql "$DATABASE_URL" -f src/lib/store/schema.sql
```

Without `DATABASE_URL` the store falls back to an in-memory adapter so a fresh
clone runs with nothing attached. That adapter does not persist between
requests — the dashboard says so in a banner, and `getStore()` warns in
production.

**Trying it without Stripe.** Set `ENABLE_DEV_SEED=1` and run the dev server:

```bash
curl -X POST 'http://localhost:3000/api/dev/seed?stands=6'
```

You get a dashboard URL and a tap URL per stand. The endpoint is refused in
production regardless of the flag — it mints working dashboard tokens.

**Authentication is a link.** `/dashboard/[token]` has no password: the token is
printed on a card in the box, which is what "no account for your staff to
remember" costs. It is 26 characters of CSPRNG (~130 bits), the page is
`noindex, nocache`, and `/dashboard/` is disallowed in robots.txt. The token
decides which order may be edited, and the store checks the stand belongs to
that order — a guessed stand code from another order is simply not found. If you
later want real accounts, `getOrderByToken` is the single seam to replace.

**What a tap records.** A counter, per stand, per UTC day. No row per visitor, no
IP, no user agent, no cookie — read `schema.sql` and note what is absent. Obvious
crawlers and link unfurlers are excluded so previews do not inflate counts, and a
failed count never costs the customer their redirect. Redirect targets are
validated to `http`/`https` on both write and read, so a stored `javascript:` URL
could not forward even if one got in.

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

**A pack does not have to point at one place.** Every chip is encoded
individually before shipping, so `linkMode` on a cart line is either `'shared'`
(all stands open the same review page) or `'per-unit'` (one link each, boxes
labelled). It costs nothing extra, it rides through the cart into Stripe session
metadata as `linkPlan`, and it is what lets a 3-pack serve three businesses that
share an owner. The review-link field in the cart, on `/cart` and at checkout
changes its wording when a per-stand pack is present — see `hasPerUnitLinks()`.

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
  currently confirmed — and stands provisioned — by reading the Checkout Session
  on the thank-you page. That means a customer who closes the tab before the
  redirect has paid without being provisioned. `provisionFromCheckoutSession()`
  is idempotent and is exactly what the webhook should call.
- The Postgres adapter has been written and type-checked but never run against a
  live database. Treat the first deploy as its test: provision an order, tap a
  code, edit a link, then check the three tables.
- Real photography, customer logos, and testimonials — all marked `TODO:`.
- Tax configuration. Stripe Tax is not enabled; totals are shown before tax.
- The link-forwarding dashboard the FAQ refers to.
