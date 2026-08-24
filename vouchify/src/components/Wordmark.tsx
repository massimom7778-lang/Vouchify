import { cn } from '@/lib/cn';

/**
 * The Vouchify wordmark.
 *
 * "Vouch" takes the surrounding text colour so the lockup works on both the
 * paper and the ink ground without a second asset. "ıfy" is gold, and the star
 * is the tittle of the i, a dotless ı (U+0131) is used so there is no dot
 * underneath it.
 *
 * Everything is sized in em, so the mark scales from a favicon to a hero by
 * changing font-size alone.
 */

export function Star({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 1.4l3.1 6.6 7 .95-5.1 5 1.25 7.05L12 17.7l-6.25 3.3L7 13.95l-5.1-5 7-.95z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  descriptor = false,
  size = 'sm',
}: {
  className?: string;
  /** Adds the "NFC review cards" line beneath, as in the full lockup. */
  descriptor?: boolean;
  size?: 'sm' | 'lg';
}) {
  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span
        className={cn(
          'font-display font-extrabold leading-none tracking-[-0.03em]',
          size === 'lg' ? 'text-xl' : 'text-lg',
        )}
      >
        Vouch
        <span className="text-gold">
          <span className="relative inline-block">
            {/* dotless i, the star is its tittle */}
            {'ı'}
            <Star
              className="absolute left-1/2 w-[0.58em] -translate-x-1/2 text-gold"
              style={{ bottom: '0.56em' }}
            />
          </span>
          fy
        </span>
      </span>
      {descriptor ? (
        <span className="mt-2 font-sans text-2xs font-semibold uppercase tracking-[0.22em] text-gold">
          NFC review cards
        </span>
      ) : null}
    </span>
  );
}
