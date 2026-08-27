import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StandEditor } from './StandEditor';
import { PlanDrawing } from '@/components/ShopPlan';
import { Badge, Eyebrow, Grid, Section } from '@/components/ui';
import { cn } from '@/lib/cn';
import { describeCounts, pluralize } from '@/lib/format';
import { getStore, isStorePersistent, type StandWithCounts } from '@/lib/store';
import { PLACEMENTS_PER_LOCATION } from '@/data/products';
import { site } from '@/data/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your stands',
  robots: { index: false, follow: false, nocache: true },
};

const RECENT_DAYS = 30;

function LinkCell({ stand }: { stand: StandWithCounts }) {
  if (!stand.targetUrl) {
    return (
      <span className="text-sm text-warm-600">
        No link yet, a tap shows the “not pointed anywhere” page.
      </span>
    );
  }
  return (
    <span className="block max-w-full truncate text-sm text-warm-700" title={stand.targetUrl}>
      {stand.targetUrl}
    </span>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const store = getStore();
  const order = await store.getOrderByToken(token);
  if (!order) notFound();

  const stands = await store.listStands(order.id, RECENT_DAYS);
  // Plates are provisioned as trackable units too, but they have no position
  // in the shop-placement drawing the way a stand does, so the plan below
  // counts only real stands. The list further down shows everything.
  const standRows = stands.filter((stand) => stand.kind !== 'plate');
  const plateRows = stands.filter((stand) => stand.kind === 'plate');
  const recentTotal = stands.reduce((sum, stand) => sum + stand.recentTaps, 0);
  const allTime = stands.reduce((sum, stand) => sum + stand.totalTaps, 0);
  const unset = stands.filter((stand) => !stand.targetUrl).length;
  const busiest = [...stands].sort((a, b) => b.recentTaps - a.recentTaps)[0];
  const quietest = [...stands]
    .filter((stand) => stand.targetUrl)
    .sort((a, b) => a.recentTaps - b.recentTaps)[0];
  const standsPlaced = standRows.length;

  return (
    <main id="main">
      {/* Header, warning and counts are one section: three stacked sections
          compounded their vertical rhythm into a dashboard full of holes. */}
      <Section rhythm="tight" className="pt-10 md:pt-14">
        <Grid className="gap-y-4">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>Your stands</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl">
              {describeCounts(standRows.length, plateRows.length)}, and where each one points.
            </h1>
          </div>
          <div className="col-span-4 self-end md:col-span-4 md:col-start-9">
            <p className="text-base text-warm-700">
              Change a link and the next tap goes to the new place. Nothing is re-printed and nothing
              is re-encoded, the chips never change.
            </p>
          </div>
        </Grid>

        {!isStorePersistent() ? (
          <p className="mt-8 rounded-md border-2 border-gold bg-gold-tint p-4 text-sm text-ink">
            <span className="font-semibold">This deployment has no database attached.</span> Stands
            are being held in memory and will disappear. Set <code>DATABASE_URL</code> and apply{' '}
            <code>src/lib/store/schema.sql</code> before this is real.
          </p>
        ) : null}

        <Grid className="mt-10 gap-y-10 md:mt-14">
          {/* Counts, said plainly */}
          <div className="col-span-4 md:col-span-4">
            <dl className="divide-y divide-warm-300 border-y border-warm-300">
              <div className="flex items-baseline justify-between py-4">
                <dt className="text-sm text-warm-700">Taps in the last {RECENT_DAYS} days</dt>
                <dd data-numeric className="font-display text-xl font-bold tracking-tight">
                  {recentTotal}
                </dd>
              </div>
              <div className="flex items-baseline justify-between py-4">
                <dt className="text-sm text-warm-700">Taps all time</dt>
                <dd data-numeric className="font-display text-xl font-bold tracking-tight">
                  {allTime}
                </dd>
              </div>
              {unset > 0 ? (
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-warm-700">
                    {plateRows.length > 0 ? 'With no link yet' : 'Stands with no link yet'}
                  </dt>
                  <dd>
                    <Badge tone="popular">{unset}</Badge>
                  </dd>
                </div>
              ) : null}
            </dl>

            {recentTotal > 0 && busiest && quietest && busiest.code !== quietest.code ? (
              <p className="mt-5 text-sm text-warm-700">
                <span className="font-semibold">{busiest.placementLabel}</span> is doing the most
                work at {busiest.recentTaps} {pluralize(busiest.recentTaps, 'tap')}.{' '}
                <span className="font-semibold">{quietest.placementLabel}</span> is on{' '}
                {quietest.recentTaps}. If that stays true for a fortnight, move the quiet one
                somewhere people stop.
              </p>
            ) : (
              <p className="mt-5 text-sm text-warm-600">
                Once taps start landing, this will tell you which placement is working and which one
                to move.
              </p>
            )}

            <p className="mt-5 text-xs text-warm-600">
              A tap increments a counter for one stand or plate, for one day. Nothing about the
              customer is recorded, no address, no agent, no cookie.
            </p>
          </div>

          {/* The plan the stands were packed against */}
          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                  Your shop
                </p>
                <PlanDrawing
                  location={1}
                  count={Math.min(standsPlaced, PLACEMENTS_PER_LOCATION)}
                  title="Your shop"
                />
              </div>
              {standsPlaced > PLACEMENTS_PER_LOCATION ? (
                <div>
                  <p className="mb-2 font-sans text-2xs font-semibold uppercase tracking-wide text-warm-600">
                    Second location
                  </p>
                  <PlanDrawing location={2} count={standsPlaced} title="Second location" />
                </div>
              ) : null}
            </div>
          </div>
        </Grid>
      </Section>

      <Section bordered>
        <h2 className="text-xl md:text-2xl">
          {plateRows.length > 0 ? 'Every stand and plate' : 'Every stand'}
        </h2>
        <p className="mt-3 max-w-prose text-sm text-warm-700">
          The code is printed on the back of each one, so you can match a row here to the one on
          the counter or the window without guessing.
        </p>

        <ul className="mt-8 divide-y divide-warm-300 border-y border-warm-300">
          {stands.map((stand) => (
            <li key={stand.code} className="py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold tracking-tight">
                    {stand.placementLabel}
                  </p>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      data-numeric
                      className="rounded-sm border border-warm-300 bg-warm-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide"
                    >
                      {stand.code}
                    </span>
                    <span className="text-2xs uppercase tracking-wide text-warm-600">
                      {stand.kind === 'plate'
                        ? 'Review plate'
                        : stand.color === 'white'
                          ? 'White'
                          : 'Black'}
                    </span>
                    <span className="text-2xs text-warm-600">
                      {site.url.replace(/^https?:\/\//, '')}/r/{stand.code}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p
                    data-numeric
                    className={cn(
                      'font-display text-xl font-bold tracking-tight',
                      stand.recentTaps === 0 && 'text-warm-500',
                    )}
                  >
                    {stand.recentTaps}
                  </p>
                  <p className="text-2xs uppercase tracking-wide text-warm-600">
                    taps / {RECENT_DAYS}d
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <LinkCell stand={stand} />
              </div>

              <StandEditor token={token} code={stand.code} targetUrl={stand.targetUrl} />

              {stand.lastTapDay ? (
                <p data-numeric className="mt-2 text-2xs uppercase tracking-wide text-warm-600">
                  Last tap {stand.lastTapDay} · {stand.totalTaps} all time
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="warm" bordered rhythm="tight">
        <Grid className="gap-y-6">
          <div className="col-span-4 md:col-span-6">
            <h2 className="text-lg">Keep this link private</h2>
            <p className="mt-3 text-sm text-warm-700">
              This page has no password on purpose, the link on the card in your box is the key.
              Anyone who has it can re-point your stands and plates, so treat it like the key to the
              till and do not post it anywhere public.
            </p>
          </div>
          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <h2 className="text-lg">Something not right?</h2>
            <p className="mt-3 text-sm text-warm-700">
              Email{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-semibold text-gold-deep underline underline-offset-4"
              >
                {site.supportEmail}
              </a>{' '}
              with a stand or plate code and we will look at that exact one. If a chip has failed we
              ship a programmed replacement free.
            </p>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
