'use client';

import { useState } from 'react';
import { Badge, Button, Price } from '@/components/ui';
import { formatMoney, pluralize } from '@/lib/format';
import { postPurchaseUpsell, tierEconomics, type StandTier } from '@/data/products';

type Status = 'idle' | 'working' | 'added' | 'expired' | 'error';

export function UpsellOffer({
  sessionId,
  tier,
  minutesLeft,
}: {
  sessionId: string;
  tier: StandTier;
  /** Computed on the server from the Stripe session timestamp. */
  minutesLeft: number;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const economics = tierEconomics(tier);
  const savingVsTier = tier.priceCents - postPurchaseUpsell.priceCents;
  const perUnit = Math.round(postPurchaseUpsell.priceCents / tier.qty);

  async function accept() {
    setStatus('working');
    setMessage(null);
    try {
      const response = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const result: { ok?: boolean; charged?: boolean; url?: string; error?: string; expired?: boolean } =
        await response.json();

      if (result.url) {
        window.location.href = result.url;
        return;
      }
      if (response.ok && result.ok) {
        setStatus('added');
        return;
      }
      setStatus(result.expired ? 'expired' : 'error');
      setMessage(result.error ?? 'That could not be added.');
    } catch {
      setStatus('error');
      setMessage('That could not be added. Check your connection and try again.');
    }
  }

  if (status === 'added') {
    return (
      <div className="rounded-md border border-gold bg-gold-tint p-6">
        <h2 className="text-xl">Added to your order.</h2>
        <p className="mt-3 text-base text-warm-700">
          {tier.qty} more stands are going in the same box, programmed to the same link. Your card
          was charged {formatMoney(postPurchaseUpsell.priceCents, { compact: true })} — the receipt
          is on its way.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border-2 border-gold bg-paper p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="popular">One-time offer</Badge>
        <span data-numeric className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
          {minutesLeft} {pluralize(minutesLeft, 'minute')} left on this order
        </span>
      </div>

      <h2 className="mt-4 text-xl md:text-2xl">{postPurchaseUpsell.heading}</h2>
      <p className="mt-3 max-w-prose text-base text-warm-700">{postPurchaseUpsell.copy}</p>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 border-y border-warm-300 sm:grid-cols-4">
        <div className="border-b border-warm-300 py-3 sm:border-b-0">
          <dt className="text-2xs font-semibold uppercase tracking-wide text-warm-600">Stands</dt>
          <dd data-numeric className="mt-1 font-display text-lg font-bold tracking-tight">
            {tier.qty}
          </dd>
        </div>
        <div className="border-b border-warm-300 py-3 sm:border-b-0">
          <dt className="text-2xs font-semibold uppercase tracking-wide text-warm-600">Now</dt>
          <dd className="mt-1">
            <Price cents={postPurchaseUpsell.priceCents} size="md" />
          </dd>
        </div>
        <div className="py-3">
          <dt className="text-2xs font-semibold uppercase tracking-wide text-warm-600">Per stand</dt>
          <dd data-numeric className="mt-1 font-display text-lg font-bold tracking-tight">
            {formatMoney(perUnit)}
          </dd>
        </div>
        <div className="py-3">
          <dt className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
            Off the usual {formatMoney(tier.priceCents, { compact: true })}
          </dt>
          <dd data-numeric className="mt-1 font-display text-lg font-bold tracking-tight text-gold-deep">
            {formatMoney(savingVsTier, { compact: true })}
          </dd>
        </div>
      </dl>

      <p data-numeric className="mt-3 text-xs text-warm-600">
        The 3-pack is normally {formatMoney(tier.priceCents, { compact: true })} at{' '}
        {formatMoney(economics.perUnitCents)} per stand. This is the only place that price changes,
        and only because the order has not been packed yet.
      </p>

      {status === 'expired' ? (
        <p role="alert" className="mt-4 rounded-sm border border-warm-300 bg-warm-100 px-3 py-2 text-sm text-warm-700">
          This offer has expired. The stands are still available at the normal price on the product
          page.
        </p>
      ) : null}
      {status === 'error' && message ? (
        <p role="alert" className="mt-4 rounded-sm border border-warm-300 bg-warm-100 px-3 py-2 text-sm text-warm-700">
          {message}
        </p>
      ) : null}

      {status !== 'expired' ? (
        <Button
          block
          size="lg"
          className="mt-6"
          onClick={accept}
          disabled={status === 'working'}
        >
          {status === 'working'
            ? 'Adding…'
            : `Add ${tier.qty} more for ${formatMoney(postPurchaseUpsell.priceCents, { compact: true })}`}
        </Button>
      ) : null}

      <p className="mt-3 text-center text-xs text-warm-600">
        Charged to the card you just used. No forms, no second shipping charge.
      </p>
    </div>
  );
}
