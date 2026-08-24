import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'popular' | 'value' | 'scale' | 'savings' | 'neutral' | 'onDark';

const tones: Record<BadgeTone, string> = {
  popular: 'bg-signal text-ink border-signal',
  value: 'bg-ink text-paper border-ink',
  scale: 'bg-transparent text-warm-700 border-warm-400',
  savings: 'bg-signal-tint text-signal-deep border-signal-tint',
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
