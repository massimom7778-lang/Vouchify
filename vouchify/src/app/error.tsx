'use client';

import { useEffect } from 'react';
import { Button, ButtonLink, Eyebrow, Section } from '@/components/ui';

/**
 * Route-level error boundary. It says what happened, what is unaffected, and
 * gives one button that actually retries, rather than an apology and a dead
 * end. The cart is untouched by a render failure, and saying so stops people
 * rebuilding an order they still have.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[render] route failed', error);
  }, [error]);

  return (
    <main id="main">
      <Section rhythm="tight" className="pt-16 md:pt-24">
        <div className="max-w-prose">
          <Eyebrow>Something failed</Eyebrow>
          <h1 className="mt-4 text-2xl md:text-3xl">This page did not load.</h1>
          <p className="mt-6 text-base text-warm-700">
            Something on our side broke while building this page. Your cart is untouched and, if you
            have already paid, your order is unaffected, nothing here handles payment.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={reset}>
              Try again
            </Button>
            <ButtonLink href="/" variant="outline" size="lg">
              Back to the store
            </ButtonLink>
          </div>

          {error.digest ? (
            <p className="mt-8 border-t border-warm-300 pt-4 text-xs text-warm-600">
              If it keeps happening, send us this reference and we will find it in the logs:{' '}
              <span data-numeric className="font-semibold text-ink">
                {error.digest}
              </span>
            </p>
          ) : null}
        </div>
      </Section>
    </main>
  );
}
