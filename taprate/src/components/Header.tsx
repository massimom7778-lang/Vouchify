'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CartDrawer } from '@/components/CartDrawer';
import { Container } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { standCount, useCart, useCartReady } from '@/lib/cart';
import { primaryNav, site } from '@/data/site';

/**
 * The mark reads as a stand seen from above: a counter footprint with the tap
 * point on it. Same language as the shop plan, so the identity and the
 * product argument are the same drawing.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('h-5 w-5', className)} aria-hidden="true">
      <rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="4" className="fill-signal" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Mark />
      <span className="font-display text-lg font-extrabold tracking-tight">TapRate</span>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const openDrawer = useCart((s) => s.openDrawer);
  const lines = useCart((s) => s.lines);
  const ready = useCartReady();
  const stands = ready ? standCount(lines) : 0;
  const count = ready ? lines.length : 0;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Two facts, both true. No countdown, no scarcity. */}
      <div className="bg-ink text-paper">
        <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-2xs font-semibold uppercase tracking-wide">
          <span data-numeric>
            Free shipping over {formatMoney(site.freeShippingThresholdCents, { compact: true })}
          </span>
          <span aria-hidden="true" className="text-warm-500">
            /
          </span>
          <span>Programmed to your link before it ships</span>
        </Container>
      </div>

      <header className="sticky top-0 z-40 border-b border-warm-300 bg-paper">
        <Container className="flex h-16 items-center gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="-ml-1 grid h-10 w-10 cursor-pointer place-items-center rounded-sm border border-warm-300 md:hidden"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {menuOpen ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
            </svg>
          </button>

          <Link href="/" className="shrink-0" aria-label={`${site.name} home`}>
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="ml-6 hidden md:block">
            <ul className="flex items-center gap-6">
              {primaryNav.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'text-sm font-medium hover:text-signal-deep',
                        active ? 'text-ink underline decoration-signal decoration-2 underline-offset-8' : 'text-warm-700',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            onClick={openDrawer}
            className="ml-auto inline-flex h-10 cursor-pointer items-center gap-2 rounded-sm border border-ink px-3 text-sm font-semibold hover:bg-ink hover:text-paper"
          >
            Cart
            <span
              data-numeric
              className={cn(
                'grid h-5 min-w-5 place-items-center rounded-full px-1 text-2xs font-semibold',
                count > 0 ? 'bg-signal text-ink' : 'bg-warm-200 text-warm-600',
              )}
            >
              {stands > 0 ? stands : count}
            </span>
            <span className="sr-only">
              {count === 0 ? 'Cart is empty' : `${stands} stands in cart`}
            </span>
          </button>
        </Container>

        {menuOpen ? (
          <div id="mobile-nav" className="border-t border-warm-300 bg-paper md:hidden">
            <Container>
              <ul className="divide-y divide-warm-300">
                {primaryNav.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="block py-4 font-display text-lg font-bold tracking-tight">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </div>
        ) : null}
      </header>

      <CartDrawer />
    </>
  );
}
