import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Width = 'page' | 'narrow' | 'prose' | 'bleed';

const widths: Record<Width, string> = {
  page: 'max-w-page',
  narrow: 'max-w-narrow',
  prose: 'max-w-prose',
  bleed: 'max-w-none',
};

export function Container({
  as: Tag = 'div',
  width = 'page',
  className,
  children,
}: {
  as?: ElementType;
  width?: Width;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-10', widths[width], className)}>
      {children}
    </Tag>
  );
}

/** The 12-column grid. Used asymmetrically, that is the whole point of it. */
export function Grid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid grid-cols-4 gap-x-5 md:grid-cols-12 md:gap-x-6', className)}>{children}</div>;
}
