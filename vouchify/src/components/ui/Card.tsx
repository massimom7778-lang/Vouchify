import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardTone = 'paper' | 'warm' | 'ink' | 'selected';

/* Each tone sets its own text colour. A card is a surface change, so it must not
   inherit the colour of the section it happens to be sitting in, a paper card
   dropped into an ink section would otherwise render near-white on near-white. */
const tones: Record<CardTone, string> = {
  paper: 'bg-paper border-warm-300 text-ink',
  warm: 'bg-warm-100 border-warm-300 text-ink',
  ink: 'bg-warm-900 border-warm-800 text-paper',
  selected: 'bg-gold-tint border-gold text-ink',
};

/** Hairline border, 6px radius, no elevation. `square` drops the radius to 0 for
 *  structural blocks that should read as part of the grid rather than as objects. */
export function Card({
  tone = 'paper',
  square = false,
  className,
  children,
}: {
  tone?: CardTone;
  square?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('border', tones[tone], square ? 'rounded-none' : 'rounded-md', className)}>
      {children}
    </div>
  );
}
