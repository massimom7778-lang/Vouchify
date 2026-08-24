import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'solid' | 'outline' | 'quiet' | 'onDark';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Structural buttons (full-width bars, table rows) sit at 0 radius. */
  square?: boolean;
  block?: boolean;
  className?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 font-display font-bold tracking-tight ' +
  'select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ' +
  'border';

const variants: Record<ButtonVariant, string> = {
  // The single most important button on the site. Ink on gold is 5.9:1.
  primary:
    'bg-gold text-ink border-gold hover:bg-gold-hover hover:border-gold-hover on-gold',
  solid: 'bg-ink text-paper border-ink hover:bg-warm-800 hover:border-warm-800',
  outline: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  onDark: 'bg-paper text-ink border-paper hover:bg-warm-200 hover:border-warm-200',
  quiet:
    'bg-transparent text-ink border-transparent underline decoration-warm-400 underline-offset-4 hover:decoration-gold-deep',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-14 px-6 text-base',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  square = false,
  block = false,
  className,
}: ButtonStyleProps = {}): string {
  return cn(
    base,
    variants[variant],
    sizes[size],
    square ? 'rounded-none' : 'rounded-md',
    block && 'w-full',
    className,
  );
}

type ButtonProps = ButtonStyleProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { children: ReactNode };

export function Button({ variant, size, square, block, className, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, square, block, className })} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ButtonStyleProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & {
    href: string;
    children: ReactNode;
  };

export function ButtonLink({
  variant,
  size,
  square,
  block,
  className,
  href,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, square, block, className })} {...rest}>
      {children}
    </Link>
  );
}
