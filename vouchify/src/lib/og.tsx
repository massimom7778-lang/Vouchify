import { ImageResponse } from 'next/og';
import { site } from '@/data/site';

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Shared visual for every og:image on the site: ink ground, the gold star
 * mark, the wordmark, one headline. Kept to flexbox and a system font —
 * the constraints satori (the renderer behind ImageResponse) allows — rather
 * than trying to load the site's actual display face for a card that is
 * rendered once per share, not once per visitor.
 */
export function renderOgImage({ heading, sub }: { heading: string; sub?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#15151a',
          color: '#fafaf8',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="52" height="52" viewBox="0 0 32 32">
            <path
              d="M16 5.5l3.3 6.9 7.4 1-5.4 5.3 1.32 7.4L16 22.6l-6.62 3.5 1.32-7.4-5.4-5.3 7.4-1z"
              fill="#c9a961"
            />
          </svg>
          <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span>Vouch</span>
            <span style={{ color: '#c9a961' }}>ify</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
            }}
          >
            {heading}
          </div>
          {sub ? (
            <div style={{ display: 'flex', marginTop: 20, fontSize: 30, color: '#b4ada0' }}>{sub}</div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#8f877a',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {site.url.replace(/^https?:\/\//, '')}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
