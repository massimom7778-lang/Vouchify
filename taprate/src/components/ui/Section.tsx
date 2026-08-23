import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './Container';

type Tone = 'paper' | 'ink' | 'warm';

const tones: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  warm: 'bg-warm-100 text-ink',
  ink: 'bg-ink text-paper',
};

type Rhythm = 'tight' | 'default' | 'loose';

const rhythms: Record<Rhythm, string> = {
  tight: 'py-14 md:py-20',
  default: 'py-16 md:py-24 lg:py-[7.5rem]', // 96 → 120px
  loose: 'py-20 md:py-32 lg:py-40', // up to 160px
};

export function Section({
  as: Tag = 'section',
  tone = 'paper',
  rhythm = 'default',
  bordered = false,
  className,
  containerClassName,
  bleed = false,
  id,
  children,
}: {
  as?: ElementType;
  tone?: Tone;
  rhythm?: Rhythm;
  bordered?: boolean;
  className?: string;
  containerClassName?: string;
  /** Skip the container entirely for full-bleed rows. */
  bleed?: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        tones[tone],
        rhythms[rhythm],
        bordered && (tone === 'ink' ? 'border-t border-warm-800' : 'border-t border-warm-300'),
        className,
      )}
    >
      {bleed ? children : <Container className={containerClassName}>{children}</Container>}
    </Tag>
  );
}

/** Small caps label that sits above a section heading. Never an emoji, never an icon chip. */
export function Eyebrow({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  tone?: 'muted' | 'signal' | 'onDark';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-sans text-2xs font-semibold uppercase tracking-wide',
        tone === 'muted' && 'text-warm-600',
        tone === 'signal' && 'text-signal-deep',
        tone === 'onDark' && 'text-warm-400',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  children,
  className,
  level = 2,
}: {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
}) {
  const Tag = (`h${level}` as const) satisfies ElementType;
  return <Tag className={cn('text-2xl md:text-3xl', className)}>{children}</Tag>;
}
