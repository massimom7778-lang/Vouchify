'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  readonly question: string;
  readonly answer: ReactNode;
}

/**
 * Disclosure list. Real buttons, aria-expanded, aria-controls, labelled regions,
 * and roving arrow-key navigation between headers. Opening one does not close
 * the others — an owner comparing two answers should not have to fight it.
 */
export function Accordion({
  items,
  tone = 'paper',
  defaultOpen = [],
  className,
}: {
  items: readonly AccordionItem[];
  tone?: 'paper' | 'ink';
  defaultOpen?: readonly number[];
  className?: string;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen));
  const headers = useRef<(HTMLButtonElement | null)[]>([]);

  const onDark = tone === 'ink';

  function toggle(index: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    let target: number | null = null;
    if (event.key === 'ArrowDown') target = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowUp') target = index === 0 ? last : index - 1;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = last;
    if (target === null) return;
    event.preventDefault();
    headers.current[target]?.focus();
  }

  return (
    <div
      className={cn(
        'border-t',
        onDark ? 'border-warm-800' : 'border-warm-300',
        className,
      )}
    >
      {items.map((item, index) => {
        const isOpen = open.has(index);
        const headerId = `${baseId}-header-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div
            key={item.question}
            className={cn('border-b', onDark ? 'border-warm-800' : 'border-warm-300')}
          >
            <h3 className="m-0">
              <button
                id={headerId}
                ref={(node) => {
                  headers.current[index] = node;
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  'flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left',
                  'font-display text-lg font-bold tracking-tight md:text-xl',
                  onDark ? 'text-paper hover:text-gold' : 'text-ink hover:text-gold-deep',
                )}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative mt-1 h-4 w-4 shrink-0',
                    onDark ? 'text-warm-400' : 'text-warm-500',
                  )}
                >
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                  <span
                    className={cn(
                      'absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current',
                      isOpen && 'scale-y-0',
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className={cn(
                'max-w-prose pb-6 text-base',
                onDark ? 'text-warm-300' : 'text-warm-700',
              )}
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
