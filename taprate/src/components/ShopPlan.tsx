import { PLACEMENTS_PER_LOCATION, placements, type Placement } from '@/data/products';
import { cn } from '@/lib/cn';

/**
 * The shop plan. A top-down drawing of a service floor with ten numbered
 * placement positions, filled in the order an owner should actually place them.
 *
 * This is the argument for buying more than one stand, made spatially instead
 * of with a discount badge: three stands is not "a better price", it is the
 * counter, the terminal, and the waiting area covered. The tier selector and
 * this drawing are the same control.
 */

function PlanOutline() {
  return (
    <g fill="none" strokeLinecap="square">
      {/* Walls, with a doorway gap at the bottom left */}
      <g className="stroke-warm-400" strokeWidth="1.5">
        <path d="M10 10 H290 V250 H90" />
        <path d="M40 250 H10 V10" />
      </g>
      {/* Door leaf and swing */}
      <g className="stroke-warm-400" strokeWidth="1">
        <path d="M90 250 V205" />
        <path d="M90 205 A45 45 0 0 0 45 250" strokeDasharray="3 3" />
      </g>
      {/* Fixtures */}
      <g className="fill-warm-100 stroke-warm-500" strokeWidth="1">
        <rect x="30" y="40" width="140" height="26" rx="2" />
        <rect x="178" y="40" width="26" height="26" rx="2" />
        <rect x="160" y="195" width="110" height="24" rx="2" />
        <circle cx="255" cy="100" r="18" />
        <circle cx="255" cy="150" r="18" />
      </g>
    </g>
  );
}

function PlacementDot({ placement, filled }: { placement: Placement; filled: boolean }) {
  return (
    <g style={{ transition: 'opacity 150ms var(--ease-out-quart)' }}>
      <circle
        cx={placement.x}
        cy={placement.y}
        r="11"
        className={cn(
          filled ? 'fill-signal stroke-signal' : 'fill-paper stroke-warm-400',
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
        className={cn('font-sans text-[11px] font-semibold', filled ? 'fill-ink' : 'fill-warm-500')}
      >
        {placement.n}
      </text>
    </g>
  );
}

/** Just the drawing. Used on its own in the bundle comparison row. */
export function PlanDrawing({
  location,
  count,
  title,
  className,
}: {
  location: 1 | 2;
  count: number;
  /** Used for the accessible name only. */
  title: string;
  className?: string;
}) {
  const forLocation = placements.filter((p) => p.location === location);
  const active = forLocation.filter((p) => p.n <= count);
  const dormant = active.length === 0;

  return (
    <svg
      viewBox="0 0 300 260"
      className={cn('w-full rounded-md border border-warm-300 bg-paper', dormant && 'opacity-55', className)}
      role="img"
      aria-label={
        active.length === 0
          ? `${title}: no stands placed.`
          : `${title}: ${active.map((p) => p.label.toLowerCase()).join(', ')}.`
      }
    >
      <PlanOutline />
      {forLocation.map((placement) => (
        <PlacementDot key={placement.n} placement={placement} filled={placement.n <= count} />
      ))}
    </svg>
  );
}

function Plan({
  location,
  count,
  title,
}: {
  location: 1 | 2;
  count: number;
  title: string;
}) {
  const forLocation = placements.filter((p) => p.location === location);
  const active = forLocation.filter((p) => p.n <= count);

  // Only the drawing dims when a location has no stands — dimming the labels
  // too would drop them below AA.
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
          {title}
        </span>
        <span className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600" data-numeric>
          {active.length}/{PLACEMENTS_PER_LOCATION} covered
        </span>
      </div>
      <PlanDrawing location={location} count={count} title={title} />
    </div>
  );
}

export function ShopPlan({
  count,
  className,
  showLegend = true,
  locations = 'auto',
}: {
  /** How many stands are being bought. */
  count: number;
  className?: string;
  showLegend?: boolean;
  /** 'auto' shows the second plan alongside; 1 draws a single shop, larger. */
  locations?: 'auto' | 1;
}) {
  const secondLocationActive = count > PLACEMENTS_PER_LOCATION;

  if (locations === 1) {
    return (
      <div className={className}>
        <Plan location={1} count={count} title="Your shop" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Plan location={1} count={count} title="Your shop" />
        <div className={cn(!secondLocationActive && 'hidden sm:block')}>
          <Plan location={2} count={count} title="Second location" />
        </div>
      </div>

      {showLegend ? (
        <ol className="mt-5 divide-y divide-warm-300 border-y border-warm-300">
          {placements.slice(0, Math.max(count, 3)).map((placement) => {
            const filled = placement.n <= count;
            return (
              <li key={placement.n} className="flex items-baseline gap-3 py-2.5">
                <span
                  data-numeric
                  className={cn(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full text-2xs font-semibold',
                    filled ? 'bg-signal text-ink' : 'border border-dashed border-warm-400 text-warm-500',
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
}
