import type { ReactElement } from 'react';
import {
  PLACEMENTS_PER_LOCATION,
  PLATE_PLACEMENTS_PER_LOCATION,
  placements,
  platePlacements,
  type Placement,
} from '@/data/products';
import { cn } from '@/lib/cn';

/**
 * The shop plan. A top-down drawing of a service floor with ten numbered
 * placement positions, filled in the order an owner should actually place them.
 *
 * This is the argument for buying more than one stand, made spatially instead
 * of with a discount badge: three stands is not "a better price", it is the
 * counter, the terminal, and the waiting area covered. The tier selector and
 * this drawing are the same control.
 *
 * The plate has its own version of this argument — a stand covers a counter,
 * a plate covers a window, a door, a POS terminal, a menu board, a table
 * edge, places a stand cannot occupy — so every piece below is built once,
 * generically, and instantiated twice: `PlanDrawing`/`Plan`/`ShopPlan` for
 * stands, `PlatePlanDrawing`/`PlatePlan`/`PlatePlanBoard` for plates. They
 * draw genuinely different fixtures, so this is dependency injection (a
 * `PlanConfig`), not a `kind` prop branching one component in two directions.
 */

type PlanTone = 'paper' | 'ink';

function PlanOutline({ tone }: { tone: PlanTone }) {
  const onInk = tone === 'ink';
  const wall = onInk ? 'stroke-warm-600' : 'stroke-warm-400';
  const fixtureStroke = onInk ? 'stroke-warm-600' : 'stroke-warm-500';
  const fixtureFill = onInk ? 'fill-warm-900' : 'fill-warm-100';
  return (
    <g fill="none" strokeLinecap="square">
      {/* Walls, with a doorway gap at the bottom left */}
      <g className={wall} strokeWidth="1.5">
        <path d="M10 10 H290 V250 H90" />
        <path d="M40 250 H10 V10" />
      </g>
      {/* Door leaf and swing */}
      <g className={wall} strokeWidth="1">
        <path d="M90 250 V205" />
        <path d="M90 205 A45 45 0 0 0 45 250" strokeDasharray="3 3" />
      </g>
      {/* Fixtures: checkout counter, small fixture, waiting bench, two chair bays */}
      <g className={`${fixtureFill} ${fixtureStroke}`} strokeWidth="1">
        <rect x="30" y="40" width="140" height="26" rx="2" />
        <rect x="178" y="40" width="26" height="26" rx="2" />
        <rect x="160" y="195" width="110" height="24" rx="2" />
        <circle cx="255" cy="100" r="18" />
        <circle cx="255" cy="150" r="18" />
      </g>
    </g>
  );
}

/**
 * The plate's floor plan: a storefront rather than a service floor. A front
 * wall with a window and a door, a POS terminal on the counter, a menu board
 * on the side wall, a table in the room — the five surfaces a plate can sit
 * on that a stand cannot.
 */
function PlatePlanOutline({ tone }: { tone: PlanTone }) {
  const onInk = tone === 'ink';
  const wall = onInk ? 'stroke-warm-600' : 'stroke-warm-400';
  const glass = onInk ? 'stroke-warm-500' : 'stroke-warm-400';
  const fixtureStroke = onInk ? 'stroke-warm-600' : 'stroke-warm-500';
  const fixtureFill = onInk ? 'fill-warm-900' : 'fill-warm-100';
  return (
    <g fill="none" strokeLinecap="square">
      {/* Front wall along the top, with a window opening and a door opening */}
      <g className={wall} strokeWidth="1.5">
        <path d="M10 10 H120" />
        <path d="M180 10 H290" />
        <path d="M290 10 V250 H10 V10" />
      </g>
      {/* Front window glazing, left of the door */}
      <g className={glass} strokeWidth="1" strokeDasharray="2 3">
        <path d="M20 10 V0" />
        <path d="M110 10 V0" />
      </g>
      {/* Front door, right of the window, swinging inward */}
      <g className={wall} strokeWidth="1">
        <path d="M180 10 V44" />
        <path d="M180 44 A34 34 0 0 0 214 10" strokeDasharray="3 3" />
      </g>
      {/* Fixtures: POS terminal on a counter, menu board on the side wall, a table */}
      <g className={`${fixtureFill} ${fixtureStroke}`} strokeWidth="1">
        <rect x="196" y="72" width="48" height="36" rx="2" />
        <rect x="70" y="140" width="60" height="40" rx="2" />
        <circle cx="180" cy="190" r="22" />
      </g>
    </g>
  );
}

function PlacementDot({
  placement,
  filled,
  tone,
}: {
  placement: Placement;
  filled: boolean;
  tone: PlanTone;
}) {
  const onInk = tone === 'ink';
  const openDot = onInk ? 'fill-ink stroke-warm-600' : 'fill-paper stroke-warm-400';
  const openText = onInk ? 'fill-warm-500' : 'fill-warm-500';
  return (
    <g style={{ transition: 'opacity 150ms var(--ease-out-quart)' }}>
      <circle
        cx={placement.x}
        cy={placement.y}
        r="11"
        className={cn(
          filled ? 'fill-gold stroke-gold' : openDot,
          'transition-[fill,stroke] duration-150',
        )}
        strokeWidth="1"
        strokeDasharray={filled ? undefined : '2 2'}
      />
      <text
        x={placement.x}
        y={placement.y}
        textAnchor="middle"
        dominantBaseline="central"
        className={cn('font-sans text-[11px] font-semibold', filled ? 'fill-ink' : openText)}
      >
        {placement.n}
      </text>
    </g>
  );
}

interface PlanConfig {
  readonly placements: readonly Placement[];
  readonly perLocation: number;
  readonly Outline: (props: { tone: PlanTone }) => ReactElement;
  /** "stands" / "plates" — used only in the drawing's accessible name. */
  readonly unitWord: string;
}

const standPlan: PlanConfig = {
  placements,
  perLocation: PLACEMENTS_PER_LOCATION,
  Outline: PlanOutline,
  unitWord: 'stands',
};

const platePlan: PlanConfig = {
  placements: platePlacements,
  perLocation: PLATE_PLACEMENTS_PER_LOCATION,
  Outline: PlatePlanOutline,
  unitWord: 'plates',
};

/** Just the drawing. Used on its own in the bundle comparison row. */
function PlanDrawingFor(config: PlanConfig) {
  return function PlanDrawingComponent({
    location,
    count,
    title,
    className,
    tone = 'paper',
  }: {
    location: 1 | 2;
    count: number;
    /** Used for the accessible name only. */
    title: string;
    className?: string;
    tone?: PlanTone;
  }) {
    const forLocation = config.placements.filter((p) => p.location === location);
    const active = forLocation.filter((p) => p.n <= count);
    const dormant = active.length === 0;
    const Outline = config.Outline;

    return (
      <svg
        viewBox="0 0 300 260"
        className={cn(
          'w-full rounded-md border',
          tone === 'ink' ? 'border-warm-800 bg-warm-900' : 'border-warm-300 bg-paper',
          dormant && 'opacity-55',
          className,
        )}
        role="img"
        aria-label={
          active.length === 0
            ? `${title}: no ${config.unitWord} placed.`
            : `${title}: ${active.map((p) => p.label.toLowerCase()).join(', ')}.`
        }
      >
        <Outline tone={tone} />
        {forLocation.map((placement) => (
          <PlacementDot key={placement.n} placement={placement} filled={placement.n <= count} tone={tone} />
        ))}
      </svg>
    );
  };
}

export const PlanDrawing = PlanDrawingFor(standPlan);
/** Same drawing, the plate's own floor plan and placement list. */
export const PlatePlanDrawing = PlanDrawingFor(platePlan);

function PlanFor(config: PlanConfig) {
  const Drawing = PlanDrawingFor(config);
  return function PlanComponent({
    location,
    count,
    title,
    tone,
  }: {
    location: 1 | 2;
    count: number;
    title: string;
    tone: PlanTone;
  }) {
    const forLocation = config.placements.filter((p) => p.location === location);
    const active = forLocation.filter((p) => p.n <= count);

    // Only the drawing dims when a location has nothing placed, dimming the
    // labels too would drop them below AA.
    return (
      <div className="min-w-0">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className={cn('font-sans text-2xs font-semibold uppercase tracking-wide', tone === 'ink' ? 'text-warm-500' : 'text-warm-600')}>
            {title}
          </span>
          <span className={cn('font-sans text-2xs font-semibold uppercase tracking-wide', tone === 'ink' ? 'text-warm-500' : 'text-warm-600')} data-numeric>
            {active.length}/{config.perLocation} covered
          </span>
        </div>
        <Drawing location={location} count={count} title={title} tone={tone} />
      </div>
    );
  };
}

interface ShopPlanProps {
  /** How many units are being bought. */
  count: number;
  className?: string;
  showLegend?: boolean;
  /** 'auto' shows the second plan alongside; 1 draws a single floor, larger. */
  locations?: 'auto' | 1;
  tone?: PlanTone;
}

function ShopPlanFor(config: PlanConfig, defaultLocationTitle: string) {
  const Plan = PlanFor(config);
  return function ShopPlanComponent({
    count,
    className,
    showLegend = true,
    locations = 'auto',
    tone = 'paper',
  }: ShopPlanProps) {
    const secondLocationActive = count > config.perLocation;

    if (locations === 1) {
      return (
        <div className={className}>
          <Plan location={1} count={count} title={defaultLocationTitle} tone={tone} />
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Plan location={1} count={count} title={defaultLocationTitle} tone={tone} />
          <div className={cn(!secondLocationActive && 'hidden sm:block')}>
            <Plan location={2} count={count} title="Second location" tone={tone} />
          </div>
        </div>

        {showLegend ? (
          <ol className="mt-5 divide-y divide-warm-300 border-y border-warm-300">
            {config.placements.slice(0, Math.max(count, 3)).map((placement) => {
              const filled = placement.n <= count;
              return (
                <li key={placement.n} className="flex items-baseline gap-3 py-2.5">
                  <span
                    data-numeric
                    className={cn(
                      'grid h-5 w-5 shrink-0 place-items-center rounded-full text-2xs font-semibold',
                      filled ? 'bg-gold text-ink' : 'border border-dashed border-warm-400 text-warm-500',
                    )}
                  >
                    {placement.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm font-semibold', filled ? 'text-ink' : 'text-warm-500')}>
                      {placement.label}
                    </span>
                    {filled ? (
                      <span className="block text-xs text-warm-600">{placement.note}</span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    );
  };
}

export const ShopPlan = ShopPlanFor(standPlan, 'Your shop');
/** Same widget — tier-selected drawing plus legend — for the plate ladder. */
export const PlatePlanBoard = ShopPlanFor(platePlan, 'Your storefront');
