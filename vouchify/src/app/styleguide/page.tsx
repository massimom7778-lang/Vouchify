import type { Metadata } from 'next';
import { TierPreview } from './TierPreview';
import {
  Accordion,
  Badge,
  Button,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Grid,
  PhotoBlock,
  Price,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/ui';
import { coreProduct } from '@/data/products';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Theme tokens and primitives',
  robots: { index: false, follow: false },
};

const swatches = [
  { name: 'ink', hex: '#0B0B0C', use: 'Structural dark. Headlines, dark sections, secondary buttons.', on: 'paper', ratio: '17.91:1' },
  { name: 'paper', hex: '#F6F4F0', use: 'Structural light. Page ground, text on ink.', on: 'ink', ratio: '17.91:1' },
  { name: 'gold', hex: '#FF4D14', use: 'The one accent. CTA fills, active tier, savings emphasis.', on: 'ink text', ratio: '5.92:1' },
  { name: 'gold-hover', hex: '#E63F08', use: 'Hover/pressed fill for the primary button only.', on: 'ink text', ratio: '4.76:1' },
  { name: 'gold-deep', hex: '#C43305', use: 'The accent darkened for small orange TEXT on light.', on: 'paper', ratio: '5.00:1' },
  { name: 'gold-tint', hex: '#FFE9E1', use: 'Flat wash behind the selected tier row.', on: 'ink text', ratio: '16.86:1' },
];

const warmRamp = [
  { name: 'warm-50', hex: '#FBFAF8', use: 'Lift inside a card on paper' },
  { name: 'warm-100', hex: '#F1EEE8', use: 'Alternating section ground' },
  { name: 'warm-200', hex: '#E6E2D9', use: 'Photo placeholder ground, inert chips' },
  { name: 'warm-300', hex: '#D5CFC3', use: 'Hairline borders on light, the workhorse' },
  { name: 'warm-400', hex: '#B4ADA0', use: 'Decorative rules, disabled glyphs' },
  { name: 'warm-500', hex: '#8F877A', use: 'Non-text UI only. 3.23:1, never body copy' },
  { name: 'warm-600', hex: '#6B655B', use: 'Muted body text. 5.26:1 on paper' },
  { name: 'warm-700', hex: '#4A4640', use: 'Answer copy, dense paragraphs. 8.53:1' },
  { name: 'warm-800', hex: '#2A2825', use: 'Hairline borders on ink' },
  { name: 'warm-900', hex: '#171614', use: 'Raised surface on ink' },
];

const typeScale = [
  { px: 84, token: 'text-4xl', face: 'Bricolage 800', use: 'Hero only. One per page.' },
  { px: 60, token: 'text-3xl', face: 'Bricolage 800', use: 'Section display' },
  { px: 40, token: 'text-2xl', face: 'Bricolage 800', use: 'Section heading, mobile display' },
  { px: 28, token: 'text-xl', face: 'Bricolage 700', use: 'Card and tier headings' },
  { px: 20, token: 'text-lg', face: 'Bricolage 700 / Inter 500', use: 'Lead copy, buy-box totals' },
  { px: 17, token: 'text-base', face: 'Inter 400', use: 'Default body' },
  { px: 16, token: 'text-sm', face: 'Inter 400', use: 'Dense body, mobile body, buttons' },
  { px: 14, token: 'text-xs', face: 'Inter 400/500', use: 'Labels, helper text, per-unit line' },
  { px: 12, token: 'text-2xs', face: 'Inter 600 caps', use: 'Eyebrows, badges, legal' },
];

const sampleFaq = [
  {
    question: 'Does it work on iPhone?',
    answer: (
      <p>
        Yes, iPhone XS and newer, with no app to install. Hold the top of the phone against the
        stand and the review page opens. Older iPhones use the QR code printed on the same face.
      </p>
    ),
  },
  {
    question: 'Do I need wifi or power at the counter?',
    answer: (
      <p>
        No. The chip is passive, it has no battery and draws its power from the phone that taps it.
        The stand works during an outage and works in a basement.
      </p>
    ),
  },
  {
    question: 'Can I change the link later?',
    answer: (
      <p>
        Yes, free and unlimited. The chip stores a Vouchify address that forwards to your review page,
        so changing where it points is a settings change, not a new stand.
      </p>
    ),
  },
];

export default function StyleguidePage() {
  return (
    <main id="main">
      {/* Header band, dark, structural, 0 radius */}
      <div className="bg-ink text-paper">
        <Container className="py-14 md:py-20">
          <Grid>
            <div className="col-span-4 md:col-span-7">
              <Eyebrow tone="onDark">{site.name}, build step 1 &amp; 2</Eyebrow>
              <h1 className="mt-4 text-2xl md:text-3xl lg:text-4xl">
                Theme tokens
                <br />
                and primitives.
              </h1>
            </div>
            <div className="col-span-4 self-end md:col-span-4 md:col-start-9">
              <p className="text-base text-warm-300">
                Every value below is a token in <code className="text-paper">globals.css</code>. The
                stock Tailwind palette and type scale are cleared, so nothing off-system can be typed
                by accident. Contrast ratios are measured, not estimated.
              </p>
            </div>
          </Grid>
        </Container>
      </div>

      {/* --- Palette ------------------------------------------------------- */}
      <Section bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>01</Eyebrow>
            <SectionHeading className="mt-3 text-xl md:text-xl">Palette</SectionHeading>
            <p className="mt-3 text-sm text-warm-600">
              Two structural colours, one accent, one warm neutral ramp. No gradients except the
              radial vignette behind product photography.
            </p>
          </div>

          <div className="col-span-4 md:col-span-9">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {swatches.map((s) => (
                <Card key={s.name} className="overflow-hidden">
                  <div className="h-20 w-full border-b border-warm-300" style={{ backgroundColor: s.hex }} />
                  <div className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-sm font-bold tracking-tight">{s.name}</span>
                      <span className="text-2xs uppercase tracking-wide text-warm-600" data-numeric>
                        {s.hex}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-warm-700">{s.use}</p>
                    <p className="mt-2 text-2xs uppercase tracking-wide text-warm-600" data-numeric>
                      vs {s.on}, {s.ratio}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 border border-warm-300 rounded-md overflow-hidden">
              <div className="flex">
                {warmRamp.map((w) => (
                  <div key={w.name} className="h-14 flex-1" style={{ backgroundColor: w.hex }} />
                ))}
              </div>
              <dl className="divide-y divide-warm-300 border-t border-warm-300">
                {warmRamp.map((w) => (
                  <div key={w.name} className="flex flex-wrap items-baseline gap-x-4 px-4 py-2">
                    <dt className="w-24 font-sans text-xs font-semibold">{w.name}</dt>
                    <dd className="w-20 text-2xs uppercase tracking-wide text-warm-600" data-numeric>
                      {w.hex}
                    </dd>
                    <dd className="flex-1 text-xs text-warm-700">{w.use}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-4 max-w-prose text-xs text-warm-600">
              Note on the accent: <span className="font-semibold text-ink">#FF4D14 as text on paper is
              3.02:1</span>, which fails AA for anything under 24px. So the accent has two roles, the
              pure hue fills buttons and active states with ink text on top, and{' '}
              <span className="font-semibold text-gold-deep">gold-deep</span> carries orange text
              at body size. Same accent, two accessible jobs, no second colour introduced.
            </p>
          </div>
        </Grid>
      </Section>

      {/* --- Type ---------------------------------------------------------- */}
      <Section tone="warm" bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>02</Eyebrow>
            <SectionHeading className="mt-3 text-xl md:text-xl">Type</SectionHeading>
            <p className="mt-3 text-sm text-warm-600">
              Bricolage Grotesque for display at 600–800 and −0.02em. Inter for body at 17px / 1.6.
              Nine fixed steps; nothing lands between them.
            </p>
          </div>

          <div className="col-span-4 md:col-span-9">
            <div className="divide-y divide-warm-300 border-y border-warm-300">
              {typeScale.map((t) => (
                <div key={t.token} className="flex flex-wrap items-baseline gap-x-6 gap-y-2 py-5">
                  <span className="w-14 shrink-0 text-2xs uppercase tracking-wide text-warm-600" data-numeric>
                    {t.px}px
                  </span>
                  <span
                    className={
                      t.px >= 20
                        ? 'font-display font-bold tracking-tight'
                        : 'font-sans'
                    }
                    style={{ fontSize: `${Math.min(t.px, 60)}px`, lineHeight: 1.05 }}
                  >
                    Tap. Review. Done.
                  </span>
                  <span className="ml-auto text-right">
                    <span className="block font-sans text-xs font-semibold">{t.token}</span>
                    <span className="block text-2xs uppercase tracking-wide text-warm-600">{t.face}</span>
                  </span>
                  <span className="w-full text-xs text-warm-600 md:w-auto md:basis-full">{t.use}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-warm-600">
              84px renders at its true size on the hero only; the row above caps the specimen at 60px
              so the table stays readable. Prices and quantities carry{' '}
              <code>font-variant-numeric: tabular-nums</code> via <code>[data-numeric]</code>.
            </p>
          </div>
        </Grid>
      </Section>

      {/* --- Buttons and badges -------------------------------------------- */}
      <Section bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>03</Eyebrow>
            <SectionHeading className="mt-3 text-xl md:text-xl">Buttons, badges</SectionHeading>
            <p className="mt-3 text-sm text-warm-600">
              6px radius maximum, 1px borders, instant hover. No pill shapes, no gradient fills, no
              drop shadows, the shadow tokens are cleared from the theme entirely.
            </p>
          </div>

          <div className="col-span-4 md:col-span-9">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Add to cart</Button>
              <Button variant="solid" size="lg">Get a quote</Button>
              <Button variant="outline" size="lg">See how it works</Button>
              <Button variant="quiet" size="lg">Compare bundles</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="md">Medium</Button>
              <Button variant="outline" size="md">Medium</Button>
              <Button size="sm">Small</Button>
              <Button variant="outline" size="sm">Small</Button>
              <Button size="md" disabled>Disabled</Button>
            </div>

            <div className="mt-6 rounded-md border border-warm-800 bg-ink p-6">
              <p className="mb-4 text-2xs font-semibold uppercase tracking-wide text-warm-400">
                On ink
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg">Add to cart</Button>
                <Button variant="onDark" size="lg">Talk to us</Button>
                <ButtonLink href="/styleguide" variant="outline" size="lg" className="border-paper text-paper hover:bg-paper hover:text-ink">
                  Ghost on dark
                </ButtonLink>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="popular">Most popular</Badge>
              <Badge tone="value">Best value</Badge>
              <Badge tone="scale">For multi-location</Badge>
              <Badge tone="savings">You save $28 (24%)</Badge>
              <Badge tone="neutral">Ships in 1–2 days</Badge>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-6">
              <Price cents={3900} size="display" />
              <Price cents={8900} size="xl" suffix="for 3" />
              <Price cents={2967} size="md" suffix="each" />
              <Price cents={2800} size="sm" tone="gold" display={false} />
              <Price cents={1200} size="xs" tone="muted" display={false} />
            </div>
          </div>
        </Grid>
      </Section>

      {/* --- The tier engine preview: breaks the grid asymmetrically -------- */}
      <Section tone="ink" bordered rhythm="loose">
        <Grid className="gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow tone="onDark">04</Eyebrow>
            <h2 className="mt-4 text-2xl md:text-3xl">
              The tier engine,
              <br />
              working.
            </h2>
            <p className="mt-5 max-w-prose text-base text-warm-300">
              The buy box is the highest-value screen on the site, so it is previewed here with live
              state rather than as a static mock. Selecting a tier updates the total in place; the
              total ticks 220ms rather than counting up through wrong numbers. Savings are derived
              from the real one-unit price at render time, there is no stored discount figure and no
              invented MSRP anywhere in the catalog.
            </p>
            <dl className="mt-8 divide-y divide-warm-800 border-y border-warm-800">
              {[
                ['Pre-selected', '3-pack, from DEFAULT_TIER_ID in products.ts'],
                ['Savings maths', 'qty × $39 − tier price, computed live'],
                ['Add-ons', 'Never auto-checked. Ever.'],
                ['Selection control', 'Real radio inputs, sr-only, full row is the label'],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap gap-x-6 gap-y-1 py-3">
                  <dt className="w-40 shrink-0 text-2xs font-semibold uppercase tracking-wide text-warm-400">
                    {k}
                  </dt>
                  <dd className="flex-1 text-sm text-warm-300">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <TierPreview />
          </div>
        </Grid>
      </Section>

      {/* --- Surfaces, photo slots, accordion ------------------------------ */}
      <Section bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>05</Eyebrow>
            <SectionHeading className="mt-3 text-xl md:text-xl">Surfaces</SectionHeading>
            <p className="mt-3 text-sm text-warm-600">
              Photography slots render as flat warm-grey blocks carrying the exact shot description,
              so the shot list is readable straight off the page.
            </p>
          </div>

          <div className="col-span-4 md:col-span-9">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PhotoBlock photo={coreProduct.photos.hero} vignette />
              <PhotoBlock photo={coreProduct.photos.inHand} />
              <div className="flex flex-col gap-4">
                <Card className="p-4">
                  <p className="font-display text-sm font-bold tracking-tight">Card / paper</p>
                  <p className="mt-1 text-xs text-warm-600">Default surface on the page ground.</p>
                </Card>
                <Card tone="warm" className="p-4">
                  <p className="font-display text-sm font-bold tracking-tight">Card / warm</p>
                  <p className="mt-1 text-xs text-warm-600">Nested inside a paper section.</p>
                </Card>
                <Card tone="selected" className="p-4">
                  <p className="font-display text-sm font-bold tracking-tight">Card / selected</p>
                  <p className="mt-1 text-xs text-warm-700">Active tier row. Flat tint, no glow.</p>
                </Card>
                <Card tone="ink" className="p-4">
                  <p className="font-display text-sm font-bold tracking-tight">Card / ink</p>
                  <p className="mt-1 text-xs text-warm-400">Raised surface inside a dark section.</p>
                </Card>
              </div>
            </div>
          </div>
        </Grid>
      </Section>

      {/* Full-bleed break, grid break #1 */}
      <div className="border-y border-warm-300">
        <PhotoBlock photo={coreProduct.photos.counter} square className="border-x-0 border-y-0" />
      </div>

      <Section bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>06</Eyebrow>
            <SectionHeading className="mt-3 text-xl md:text-xl">Accordion</SectionHeading>
            <p className="mt-3 text-sm text-warm-600">
              Buttons with aria-expanded and aria-controls, labelled regions, arrow-key and Home/End
              navigation between headers. Copy is real, not filler.
            </p>
          </div>
          <div className="col-span-4 md:col-span-8 md:col-start-5">
            <Accordion items={sampleFaq} defaultOpen={[0]} />
          </div>
        </Grid>
      </Section>

      <Section tone="warm" bordered rhythm="tight">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>07</Eyebrow>
            <SectionHeading className="mt-3 text-xl md:text-xl">Motion</SectionHeading>
          </div>
          <div className="col-span-4 md:col-span-9">
            <Reveal className="rounded-md border border-warm-300 bg-paper p-6">
              <p className="font-display text-lg font-bold tracking-tight">
                This block faded in and rose 8px, once, over 400ms.
              </p>
              <p className="mt-2 max-w-prose text-sm text-warm-700">
                That plus the 220ms total tick is the entire motion budget. No parallax, no spring,
                no carousel, no hover transitions, hover states switch instantly. The hidden state is
                applied by an effect, so with JavaScript off the content is simply visible, and
                anyone with reduced-motion set skips it entirely.
              </p>
            </Reveal>
          </div>
        </Grid>
      </Section>

      <div className="bg-ink py-14 text-paper md:py-20">
        <Container>
          <p className="max-w-prose text-base text-warm-300">
            Steps 1 and 2 are done: theme tokens, catalog, site config, and the primitive set
            (Button, Card, Section, Container, Grid, Price, AnimatedTotal, Badge, Accordion, Reveal,
            PhotoBlock). Pages are next, in the order set out in the brief, PDP first.
          </p>
        </Container>
      </div>
    </main>
  );
}
