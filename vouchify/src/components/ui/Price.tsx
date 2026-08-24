import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';

type PriceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'display';

const sizes: Record<PriceSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  display: 'text-2xl md:text-3xl',
};

type PriceTone = 'ink' | 'muted' | 'gold' | 'onDark';

const tones: Record<PriceTone, string> = {
  ink: 'text-ink',
  muted: 'text-warm-600',
  gold: 'text-gold-deep',
  onDark: 'text-paper',
};

/**
 * The only component allowed to turn cents into a string. Always tabular so a
 * total ticking from $89.00 to $114.00 does not shift the layout around it.
 */
export function Price({
  cents,
  size = 'md',
  tone = 'ink',
  compact = true,
  suffix,
  display = true,
  className,
}: {
  cents: number;
  size?: PriceSize;
  tone?: PriceTone;
  compact?: boolean;
  /** e.g. "each", "/unit". Rendered smaller and muted. */
  suffix?: string;
  /** Display face for headline prices, body face for inline prices. */
  display?: boolean;
  className?: string;
}) {
  return (
    <span
      data-numeric
      className={cn(
        display ? 'font-display font-bold tracking-tight' : 'font-sans font-semibold',
        sizes[size],
        tones[tone],
        'whitespace-nowrap',
        className,
      )}
    >
      {formatMoney(cents, { compact })}
      {suffix ? <span className="ml-1 text-xs font-medium text-warm-600">{suffix}</span> : null}
    </span>
  );
}
