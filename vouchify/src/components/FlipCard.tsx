'use client';

import Link from 'next/link';
import { useId, useState, type ReactNode } from 'react';

import type { BackFaceRow } from '@/data/products';
import { cn } from '@/lib/cn';

/**
 * A card that turns over.
 *
 * The front is passed in untouched. The back is a label and value list in the
 * same hairline system, holding the specifications that do not belong on a
 * drawing.
 *
 * Three things this has to get right beyond looking correct.
 *
 * Height. Both faces share one grid cell, so the card is always as tall as the
 * taller face and turning it never moves anything else on the page.
 *
 * The hit area. On the back there is nothing else to protect, so the whole
 * face is a button and the link to the product page sits layered above it.
 * The front is different: it carries the product's own name and price, which
 * have to stay real, independently clickable content rather than text sitting
 * over a full-face button that swallows the tap. So the front is split in
 * two: `frontMedia` (the drawing) gets its own hit area and turns the card,
 * `frontBody` (name, price, description) sits below it as ordinary content.
 * Both stay plain ReactNode — a render-prop function was tried here first,
 * but this card also renders from a server component, and a function cannot
 * cross that boundary the way JSX can.
 *
 * The face that is turned away. It is still in the layout, so it is marked
 * inert: without that, a keyboard tabs into a link nobody can see and a screen
 * reader reads out both sides of the card at once.
 */
export function FlipCard({
  frontMedia,
  frontBody,
  rows,
  name,
  href,
  tone = 'paper',
  className,
}: {
  /** The part of the front that turns the card — the drawing, not the name
   *  or price. Gets its own hit area rather than a button covering the
   *  whole face. */
  frontMedia: ReactNode;
  /** Everything else on the front. Ordinary content, outside the hit area. */
  frontBody: ReactNode;
  rows: readonly BackFaceRow[];
  name: string;
  href: string;
  tone?: 'ink' | 'paper';
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const backId = useId();
  const onInk = tone === 'ink';

  return (
    <div
      className={cn('flip', className)}
      data-flipped={flipped ? '' : undefined}
    >
      <div className='flip__inner'>
        {/* ---- front ---- */}
        <div className='flip__face group' inert={flipped}>
          <div className='relative'>
            {frontMedia}
            <button
              type='button'
              className='flip__hit'
              aria-expanded={flipped}
              aria-controls={backId}
              onClick={() => setFlipped(true)}
            >
              <span className='sr-only'>{`Show the specifications for the ${name}`}</span>
            </button>
          </div>

          {frontBody}

          {/* The affordance. A hover state would leave a phone with no clue
              the card does anything, so it is always visible. */}
          <span
            aria-hidden='true'
            className={cn(
              'flip__hint',
              onInk ? 'border-warm-800 bg-warm-900' : 'border-line bg-panel',
            )}
          >
            <svg
              viewBox='0 0 16 16'
              className='size-3'
              fill='none'
              aria-hidden='true'
            >
              <path
                d='M2.6 6.4a5.6 5.6 0 0 1 9.5-2.2l1.3 1.3M13.4 9.6a5.6 5.6 0 0 1-9.5 2.2l-1.3-1.3'
                stroke='#b8863e'
                strokeWidth='1.5'
                strokeLinecap='round'
              />
              <path
                d='M13.8 2.6v3.1h-3.1M2.2 13.4v-3.1h3.1'
                stroke='#b8863e'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span className='font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-ink-soft'>
              Specs
            </span>
          </span>
        </div>

        {/* ---- back: the specifications ---- */}
        <div className='flip__face flip__back' id={backId} inert={!flipped}>
          <div
            className={cn(
              'flex h-full flex-col rounded-md border px-5 py-5',
              onInk ? 'border-warm-800 bg-warm-900' : 'border-line bg-panel',
            )}
          >
            <p className='font-mono text-2xs font-medium uppercase tracking-[0.12em] text-ink-soft'>
              Specification
            </p>

            <dl className='mt-4 flex-1'>
              {rows.map((row) => (
                <div key={row.label} className='border-t border-line py-2.5'>
                  <dt className='font-mono text-2xs font-medium uppercase tracking-[0.12em] text-ink-soft'>
                    {row.label}
                  </dt>
                  <dd className='mt-1 text-sm text-ink'>{row.value}</dd>
                </div>
              ))}
            </dl>

            {/* Above the hit area, so the link is reachable rather than
                swallowed by the surface that turns the card back. */}
            <Link
              href={href}
              className='relative z-10 mt-5 self-start rounded-sm font-sans text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-brass'
            >
              {`Open ${name}`}
            </Link>
          </div>

          <button
            type='button'
            className='flip__hit'
            aria-expanded={flipped}
            aria-controls={backId}
            onClick={() => setFlipped(false)}
          >
            <span className='sr-only'>{`Back to the ${name} drawing`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
