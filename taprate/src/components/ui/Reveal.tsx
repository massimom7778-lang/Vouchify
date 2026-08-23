'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/**
 * Fade + 8px rise, once, 400ms, ease-out. The hidden state is applied in an
 * effect rather than in markup, so without JavaScript the content is simply
 * visible instead of invisible. Reduced-motion users skip it entirely.
 */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    el.style.opacity = '0';
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.style.opacity = '';
          el.style.animation = `rise 400ms var(--ease-out-quart) ${delay}ms both`;
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
