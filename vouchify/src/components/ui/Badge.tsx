import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'popular' | 'value' | 'scale' | 'savings' | 'neutral' | 'onDark';

const tones: Record<BadgeTone, string> = {
  popular: 'bg-gold text-ink border-gold',
  value: 'bg-ink text-paper border-ink',
  scale: 'bg-transparent text-warm-700 border-warm-400',
  savings: 'bg-gold-tint text-gold-deep border-gold-tint',
  neutral: 'bg-warm-200 text-warm-700 border-warm-200',
  onDark: 'bg-warm-900 text-warm-300 border-warm-800',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-1',
        'font-sans text-2xs font-semibold uppercase tracking-wide leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Which numbered placements a tier fills, e.g. "Covers 01-03".
 *
 * This replaces the "Most popular" / "Best value" badges. Those were a claim
 * about other buyers; this is a fact about the product, and it is the same
 * argument the floor plan is already making everywhere else on the site.
 */
export function Coverage({
  from,
  to,
  tone = 'light',
  className,
}: {
  from: number;
  to: number;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const single = from === to;
  return (
    <span
      data-numeric
      className={cn(
        'inline-flex items-baseline gap-1.5 whitespace-nowrap font-sans text-2xs font-semibold uppercase tracking-[0.14em]',
        tone === 'dark' ? 'text-warm-400' : 'text-warm-600',
        className,
      )}
    >
      <span className={tone === 'dark' ? 'text-gold' : 'text-gold-deep'}>
        {single
          ? String(from).padStart(2, '0')
          : `${String(from).padStart(2, '0')}–${String(to).padStart(2, '0')}`}
      </span>
      <span>{single ? 'position' : 'positions'}</span>
    </span>
  );
}
