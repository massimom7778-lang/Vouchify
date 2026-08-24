'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CartDrawer } from '@/components/CartDrawer';
import { Wordmark } from '@/components/Wordmark';
import { Container } from '@/components/ui';
import { cn } from '@/lib/cn';
import { standCount, useCart, useCartReady } from '@/lib/cart';
import { primaryNav, site } from '@/data/site';

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
      {/* The differentiator, not stock store chrome. Free shipping lives in the
          cart drawer and the footer, where a threshold actually belongs. */}
      <div className="bg-ink text-paper">
        <Container className="flex items-center justify-center gap-x-3 py-2 text-2xs font-semibold uppercase tracking-[0.14em]">
          <span className="text-center">
            Encoded to your review link before dispatch
          </span>
          <span aria-hidden="true" className="hidden text-warm-500 sm:inline">
            /
          </span>
          <span data-numeric className="hidden whitespace-nowrap sm:inline">
            Ships in {site.shipping.processing}
          </span>
        </Container>
      </div>

      <header className="sticky top-0 z-40 border-b border-warm-300 bg-paper">
        <Container className="flex h-16 items-center gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="-ml-1 grid h-11 w-11 cursor-pointer place-items-center rounded-sm border border-warm-300 md:hidden"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {menuOpen ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
            </svg>
          </button>

          <Link
            href="/"
            className="-my-2 flex shrink-0 items-center py-2"
            aria-label={`${site.name} home`}
          >
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
                        'text-sm font-medium hover:text-gold-deep',
                        active ? 'text-ink underline decoration-gold decoration-2 underline-offset-8' : 'text-warm-700',
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
            className="ml-auto inline-flex h-11 min-w-11 cursor-pointer items-center gap-2 rounded-sm border border-ink px-3 text-sm font-semibold hover:bg-ink hover:text-paper"
          >
            Cart
            <span
              data-numeric
              className={cn(
                'grid h-5 min-w-5 place-items-center rounded-full px-1 text-2xs font-semibold',
                count > 0 ? 'bg-gold text-ink' : 'bg-warm-200 text-warm-600',
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
                    <Link href={link.href} className="block py-4 font-display text-lg font-bold tracking-tight min-h-11">
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
