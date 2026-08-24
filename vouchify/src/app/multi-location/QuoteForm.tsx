'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/format';

type FieldErrors = Record<string, string>;
type Status = 'idle' | 'sending' | 'sent' | 'error';

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-warm-600">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
      {error ? (
        <span role="alert" className="mt-1.5 block text-xs font-semibold text-gold-deep">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const inputClass =
  'h-11 w-full rounded-sm border border-warm-300 bg-paper px-3 text-sm placeholder:text-warm-500';

export function QuoteForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [locations, setLocations] = useState(2);
  const [perLocation, setPerLocation] = useState(3);

  const total = locations * perLocation;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      business: String(form.get('business') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      locations: Number(form.get('locations') ?? 0),
      standsPerLocation: Number(form.get('standsPerLocation') ?? 0),
      logoPrinting: form.get('logoPrinting') === 'on',
      notes: String(form.get('notes') ?? ''),
    };

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result: { ok?: boolean; fieldErrors?: FieldErrors } = await response.json();
      if (!response.ok || !result.ok) {
        setErrors(result.fieldErrors ?? {});
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-md border border-warm-300 bg-warm-50 p-6">
        <h2 className="text-xl">Quote request received.</h2>
        <p className="mt-3 text-base text-warm-700">
          We reply within one business day with a written quote, per-location links, labelled boxes,
          and a price for the whole group. No sales call unless you ask for one.
        </p>
        <p className="mt-3 text-sm text-warm-600">
          Nothing has been charged and nothing has been shipped.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-md border border-warm-300 bg-warm-50 p-5 md:p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Your name" error={errors.name}>
          <input name="name" autoComplete="name" required className={inputClass} placeholder="Dana Reyes" />
        </Field>
        <Field label="Business name" error={errors.business}>
          <input name="business" autoComplete="organization" required className={inputClass} placeholder="Reyes Barbers" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="dana@reyesbarbers.ca"
          />
        </Field>
        <Field label="Phone" hint="Optional. Only used if the quote needs a question answered." error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} placeholder="(416) 555-0134" />
        </Field>
        <Field label="Locations" error={errors.locations}>
          <input
            name="locations"
            type="number"
            inputMode="numeric"
            min={1}
            max={2000}
            value={locations}
            onChange={(event) => setLocations(Math.max(1, Number(event.target.value) || 1))}
            className={inputClass}
          />
        </Field>
        <Field label="Stands per location" hint="Counter, terminal and waiting area is three." error={errors.standsPerLocation}>
          <input
            name="standsPerLocation"
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            value={perLocation}
            onChange={(event) => setPerLocation(Math.max(1, Number(event.target.value) || 1))}
            className={inputClass}
          />
        </Field>
      </div>

      <div
        aria-live="polite"
        className="mt-5 flex items-baseline justify-between gap-4 rounded-sm border border-warm-300 bg-paper px-4 py-3"
      >
        <span className="text-sm text-warm-700">Total stands in this quote</span>
        <span data-numeric className="font-display text-xl font-extrabold tracking-tight">
          {total}
        </span>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3">
        <input name="logoPrinting" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#C9A961]" />
        <span>
          <span className="block text-sm font-semibold">Include logo printing</span>
          <span className="block text-xs text-warm-600">
            One setup charge across the whole order, not per location.
          </span>
        </span>
      </label>

      <div className="mt-5">
        <Field label="Anything else" hint="Rollout dates, how the locations are named, who receives the boxes." error={errors.notes}>
          <textarea
            name="notes"
            rows={4}
            className="w-full rounded-sm border border-warm-300 bg-paper px-3 py-2 text-sm placeholder:text-warm-500"
            placeholder="Six shops across the GTA, opening a seventh in March."
          />
        </Field>
      </div>

      {status === 'error' && Object.keys(errors).length === 0 ? (
        <p role="alert" className="mt-4 rounded-sm border border-warm-300 bg-paper px-3 py-2 text-sm text-warm-700">
          That did not send. Check your connection and try again, or email the details instead.
        </p>
      ) : null}

      <Button type="submit" size="lg" block className={cn('mt-6')} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : `Request a quote for ${total} ${pluralize(total, 'stand')}`}
      </Button>
      <p className="mt-3 text-center text-xs text-warm-600">
        No payment details, no account. A written quote by email within one business day.
      </p>
    </form>
  );
}
