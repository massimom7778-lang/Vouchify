'use client';

import { useEffect } from 'react';

/**
 * Last resort: the root layout itself failed, so there is no header, no footer
 * and no theme to rely on. Everything here is inline on purpose.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[render] root layout failed', error);
  }, [error]);

  return (
    <html lang="en-CA">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          background: '#f6f4f0',
          color: '#0b0b0c',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '38rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#6b655b',
            }}
          >
            TapRate
          </p>
          <h1 style={{ marginTop: '1rem', fontSize: '2.5rem', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            The site failed to load.
          </h1>
          <p style={{ marginTop: '1.25rem', fontSize: '1.0625rem', lineHeight: 1.6, color: '#4a4640' }}>
            This is our fault, not your connection. Nothing you have bought is affected.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.75rem',
              height: '3.5rem',
              padding: '0 1.5rem',
              border: '1px solid #ff4d14',
              borderRadius: '6px',
              background: '#ff4d14',
              color: '#0b0b0c',
              fontSize: '1.0625rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b655b' }}>
            Still broken? Email support@taprate.co
            {error.digest ? ` and quote ${error.digest}.` : '.'}
          </p>
        </div>
      </body>
    </html>
  );
}
