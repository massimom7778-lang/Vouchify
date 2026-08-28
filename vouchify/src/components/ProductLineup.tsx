
import Link from 'next/link';
import { Price } from '@/components/ui';
import { FlipCard } from '@/components/FlipCard';
import {
  CORE_SLUG,
  PLATE_SLUG,
  coreProduct,
  plateProduct,
  plateTiers,
  lineupBackFaces,
  UNIT_PRICE_CENTS,
} from '@/data/products';
import { cn } from '@/lib/cn';

/**
 * The catalogue, drawn.
 *
 * There are exactly two things for sale, a black acrylic stand and a blue and
 * white square plate, and a buyer landing on the homepage should be able to see
 * both of them and how big they are without scrolling into the shop.
 *
 * Both panels share one viewBox and one scale (1.6 px per millimetre), so as
 * long as they render at the same CSS width the two products are at true
 * relative scale against each other. That holds in the two-up desktop grid and
 * in the stacked mobile column, which is why the drawings are two SVGs on a
 * shared grid rather than one wide SVG that would shrink its own labels to
 * nothing on a phone.
 *
 * StandElevation is the fully dimensioned drawing for the product page. This is
 * the catalogue plate: less annotation, both objects, comparable.
 */

/* The products' real finishes. These are the goods, not the brand, so they are
   deliberately not tokens, nothing else on the site should reach for them.
   The point of this block is that a buyer sees the black stand and the blue and
   white plate, so the drawings are rendered in the colours that ship. */
const STAND_BLACK = '#0b0b0c';
const ON_BLACK = '#7f7970';   /* hairlines drawn on the black face */
const PLATE_BLUE = '#1d4ed8';
const PLATE_WHITE = '#ffffff';
const ON_WHITE = '#8f877a';   /* hairlines drawn on the white field */
const TAP_GOLD_DARK = '#c9a961';  /* the tap ring on black */
const TAP_GOLD_LIGHT = '#7d6318'; /* the tap ring on white */

interface DrawingTone {
  /** Extension lines and other secondary hairlines. */
  rule: string;
  /** Outlines and dimension lines. Deliberately the same on both tones, it is
   *  the one value that has to read on paper, on ink, on black and on white. */
  line: string;
  /** Dimension and callout text. */
  label: string;
  /** Callout text for the chip. */
  accent: string;
}

function toneOf(tone: 'ink' | 'paper'): DrawingTone {
  return tone === 'ink'
    ? { rule: '#4a4640', line: '#8f877a', label: '#b4ada0', accent: '#c9a961' }
    : { rule: '#d5cfc3', line: '#8f877a', label: '#6b655b', accent: '#7d6318' };
}

/** Shared annotation type. Both panels use the same faces and letterspacing. */
function Callout({ x, y, children, fill, anchor = 'start' }: {
  x: number;
  y: number;
  children: string;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      x={x} y={y} fill={fill} textAnchor={anchor}
      className="font-sans text-[10px] font-semibold"
      style={{ letterSpacing: '0.1em' }}
    >
      {children}
    </text>
  );
}

function Dimension({ x, y, children, fill, anchor = 'middle' }: {
  x: number;
  y: number;
  children: string;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      x={x} y={y} fill={fill} textAnchor={anchor}
      className="font-sans text-[11px] font-semibold"
      style={{ letterSpacing: '0.08em' }}
    >
      {children}
    </text>
  );
}

/* 76 × 127.5 mm at 1.6 => 122 × 204, sitting on the shared baseline at y=250. */
function StandPlate({ t }: { t: DrawingTone }) {
  return (
    <>
      <rect x={89} y={46} width={122} height={204} rx={6} fill={STAND_BLACK} stroke={t.line} strokeWidth={1.25} />
      <path d="M89 250 L89 259 L211 259 L211 250" stroke={t.line} strokeWidth={1.25} />
      <path d="M76 259 L224 259" stroke={t.rule} strokeWidth={1} />

      {/* where the chip actually sits */}
      <circle cx={150} cy={96} r={22} stroke={TAP_GOLD_DARK} strokeWidth={1.25} strokeDasharray="3 3" />
      <circle cx={150} cy={96} r={2.5} fill={TAP_GOLD_DARK} stroke="none" />

      {/* printed QR block, light ink on the black face */}
      <rect x={124} y={148} width={52} height={52} stroke={ON_BLACK} strokeWidth={1} />
      <g stroke={ON_BLACK} strokeWidth={1}>
        <path d="M130 154h11v11h-11z" />
        <path d="M159 154h11v11h-11z" />
        <path d="M130 183h11v11h-11z" />
      </g>

      {/* height */}
      <g stroke={t.line} strokeWidth={1}>
        <path d="M238 46v204" />
        <path d="M233 46h10M233 250h10" />
        <path d="M211 46h25M211 250h25" strokeDasharray="2 3" stroke={t.rule} />
      </g>
      <Dimension x={246} y={152} fill={t.label} anchor="start">127.5</Dimension>

      {/* width */}
      <g stroke={t.line} strokeWidth={1}>
        <path d="M89 288h122" />
        <path d="M89 283v10M211 283v10" />
        <path d="M89 259v33M211 259v33" strokeDasharray="2 3" stroke={t.rule} />
      </g>
      <Dimension x={150} y={310} fill={t.label}>76</Dimension>

      {/* leaders, in the mid line colour so one stroke reads on the black face
          and on the page behind it. Callouts are right-anchored and land clear
          of the part, so no label is ever printed over the goods. */}
      <g stroke={t.line} strokeWidth={1} fill="none">
        <path d="M150 74 L150 34 L84 34" />
        <path d="M124 174 L84 174" />
      </g>
      <Callout x={78} y={30} fill={t.accent} anchor="end">NTAG215</Callout>
      <Callout x={78} y={170} fill={t.label} anchor="end">QR BACKUP</Callout>
    </>
  );
}

/* 100 × 100 mm at 1.6 => 160 × 160, on the same baseline at y=250. */
function SquarePlate({ t }: { t: DrawingTone }) {
  return (
    <>
      {/* the blue border and the white field are the product's actual finish */}
      <rect x={70} y={90} width={160} height={160} rx={5} fill={PLATE_BLUE} stroke={t.line} strokeWidth={1.25} />
      <rect x={82} y={102} width={136} height={136} fill={PLATE_WHITE} stroke="none" />

      {/* it lies flat, so the baseline is the surface it is stuck to */}
      <path d="M58 250 L242 250" stroke={t.rule} strokeWidth={1} />

      <circle cx={150} cy={140} r={22} stroke={TAP_GOLD_LIGHT} strokeWidth={1.25} strokeDasharray="3 3" />
      <circle cx={150} cy={140} r={2.5} fill={TAP_GOLD_LIGHT} stroke="none" />

      <rect x={124} y={180} width={52} height={52} stroke={ON_WHITE} strokeWidth={1} fill="none" />
      <g stroke={ON_WHITE} strokeWidth={1} fill="none">
        <path d="M130 186h11v11h-11z" />
        <path d="M159 186h11v11h-11z" />
        <path d="M130 215h11v11h-11z" />
      </g>

      {/* height */}
      <g stroke={t.line} strokeWidth={1} fill="none">
        <path d="M252 90v160" />
        <path d="M247 90h10M247 250h10" />
        <path d="M230 90h20M230 250h20" strokeDasharray="2 3" stroke={t.rule} />
      </g>
      <Dimension x={260} y={146} fill={t.label} anchor="start">100</Dimension>

      {/* width */}
      <g stroke={t.line} strokeWidth={1} fill="none">
        <path d="M70 288h160" />
        <path d="M70 283v10M230 283v10" />
        <path d="M70 250v42M230 250v42" strokeDasharray="2 3" stroke={t.rule} />
      </g>
      <Dimension x={150} y={310} fill={t.label}>100</Dimension>

      {/* same leader language as the stand. The chip leader exits the top so it
          crosses as little of the face as possible; both land clear of the part. */}
      <g stroke={t.line} strokeWidth={1} fill="none">
        <path d="M150 118 L150 62 L65 62" />
        <path d="M124 206 L65 206" />
      </g>
      <Callout x={59} y={58} fill={t.accent} anchor="end">NTAG215</Callout>
      <Callout x={59} y={202} fill={t.label} anchor="end">QR BACKUP</Callout>
    </>
  );
}

function Panel({
  kind,
  tone,
  ariaLabel,
}: {
  kind: 'stand' | 'plate';
  tone: 'ink' | 'paper';
  ariaLabel: string;
}) {
  const t = toneOf(tone);
  return (
    <svg viewBox="-30 0 340 340" className="w-full" role="img" aria-label={ariaLabel}>
      <g fill="none" strokeLinecap="square">
        {kind === 'stand' ? <StandPlate t={t} /> : <SquarePlate t={t} />}
      </g>
    </svg>
  );
}

interface LineupItem {
  href: string;
  kind: 'stand' | 'plate';
  name: string;
  finish: string;
  size: string;
  priceCents: number;
  priceSuffix: string;
  line: string;
  ariaLabel: string;
}

function items(): readonly [LineupItem, LineupItem] {
  // The cheapest rung of the plate's own bundle ladder — the plate is no
  // longer a single flat-priced add-on, so the lineup card quotes its entry
  // price the same way the stand card quotes UNIT_PRICE_CENTS for one stand.
  const plateEntry = plateTiers[0]!;
  return [
    {
      href: `/products/${CORE_SLUG}`,
      kind: 'stand',
      name: coreProduct.name,
      finish: 'Black',
      size: '76 × 127.5 mm',
      priceCents: UNIT_PRICE_CENTS,
      priceSuffix: 'for one',
      line: 'Stands on a counter, a desk, or a checkout. Folded foot, no assembly.',
      ariaLabel:
        'Drawing of the black review stand, 76 millimetres wide by 127.5 millimetres tall, with the chip behind the upper face and a QR code printed below it.',
    },
    {
      href: `/products/${PLATE_SLUG}`,
      kind: 'plate',
      name: plateProduct.name,
      finish: 'Blue and white',
      size: '100 × 100 mm',
      priceCents: plateEntry.priceCents,
      priceSuffix: 'for one',
      line: 'Sticks flat to glass, counters, and menu boards. Sold in packs, from one to ten.',
      ariaLabel:
        'Drawing of the blue and white square review plate, 100 millimetres square, with the chip behind the centre of the face and a QR code printed below it.',
    },
  ];
}

/**
 * The catalogue block. `tone` must match the section it sits in, the drawings
 * carry their own line colours and will not inherit one.
 */
export function ProductLineup({
  tone = 'paper',
  className,
}: {
  tone?: 'ink' | 'paper';
  className?: string;
}) {
  const onInk = tone === 'ink';
  return (
    <div className={cn('grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2', className)}>
      {items().map((item) => (
        <FlipCard
          key={item.href}
          tone={tone}
          name={item.name}
          href={item.href}
          rows={lineupBackFaces[item.kind]}
          frontMedia={
            <div
              className={cn(
                'rounded-md border px-2 pb-1 pt-3 transition-colors',
                onInk
                  ? 'border-warm-800 bg-warm-900 group-hover:border-warm-700'
                  : 'border-warm-300 bg-paper group-hover:border-warm-400',
              )}
            >
              <Panel kind={item.kind} tone={tone} ariaLabel={item.ariaLabel} />
            </div>
          }
          frontBody={
            <div className={cn('mt-5 border-t pt-4', onInk ? 'border-warm-800' : 'border-warm-300')}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className={cn('text-lg font-semibold', onInk ? 'text-paper' : 'text-ink')}>
                  {/* A real link now, not a heading styled to look like one:
                      the drawing above carries the flip, so this is free to
                      go straight to the product page. */}
                  <Link href={item.href} className="underline-offset-4 hover:underline">
                    {item.name}
                  </Link>
                </h3>
                <Price
                  cents={item.priceCents}
                  size="md"
                  tone={onInk ? 'onDark' : 'ink'}
                  suffix={item.priceSuffix}
                />
              </div>

              <p
                data-numeric
                className={cn(
                  'mt-1.5 font-sans text-2xs font-semibold uppercase tracking-[0.14em]',
                  onInk ? 'text-gold' : 'text-gold-deep',
                )}
              >
                {item.finish}
                <span className={onInk ? 'text-warm-500' : 'text-warm-600'}>
                  {' \u00b7 '}
                  {item.size}
                </span>
              </p>

              <p className={cn('mt-3 text-sm', onInk ? 'text-warm-300' : 'text-warm-700')}>
                {item.line}
              </p>
            </div>
          }
        />
      ))}
    </div>
  );
}
