# TapRate

Storefront for NFC tap-to-review stands. Next.js 15 (App Router), TypeScript strict,
Tailwind CSS v4, Stripe Checkout, Zustand cart.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Stripe keys
npm run dev                  # http://localhost:3000
```

`npm run build` must pass clean before anything ships. `npm run typecheck` runs
`tsc --noEmit` on its own.

## Where things live

| Path | What it is |
| --- | --- |
| `src/data/products.ts` | The catalog. Tiers, add-ons, offers, and the savings maths. |
| `src/data/site.ts` | Brand, support email, currency, shipping thresholds, nav, policy copy. |
| `src/app/globals.css` | Every design token. Colours, type scale, radius, motion. |
| `src/components/ui/` | Design primitives. Nothing here knows about products. |
| `/styleguide` | Living reference for the tokens and primitives. Not indexed. |

## Build status

- [x] 1 — Scaffold, theme tokens, fonts, `products.ts`, `site.ts`
- [x] 2 — Primitives: Button, Card, Section, Container, Grid, Price, AnimatedTotal, Badge, Accordion, Reveal, PhotoBlock
- [ ] 3 — Header, cart drawer, footer
- [ ] 4 — PDP with the tier engine and add-on picker
- [ ] 5 — Homepage
- [ ] 6 — Bundles, how it works, FAQ, multi-location
- [ ] 7 — Stripe checkout, order bump, thank-you upsell
- [ ] 8 — SEO, accessibility pass, legal pages
- [ ] 9 — Full README, including "how to add a product"
