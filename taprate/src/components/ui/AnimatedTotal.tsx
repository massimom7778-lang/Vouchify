'use client';

import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';

/**
 * A total that ticks when it changes. The `key` on the inner span restarts the
 * 220ms rise; there is no easing library and no counting-up animation, because
 * a price that scrambles through wrong numbers is worse than one that changes.
 */
export function AnimatedTotal({
  cents,
  className,
  compact = true,
}: {
  cents: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      data-numeric
      className={cn('inline-block overflow-hidden font-display font-bold tracking-tight', className)}
    >
      <span key={cents} className="inline-block animate-tick">
        {formatMoney(cents, { compact })}
      </span>
    </span>
  );
}
