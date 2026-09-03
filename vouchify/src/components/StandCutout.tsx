'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * The product layer of the hero.
 *
 * The photograph renders through next/image, decorative (alt="") rather than
 * described, because an empty alt is exactly as silent as a background image
 * when the file fails to load — nothing spills into the middle of the hero
 * either way. `priority` gets it into the server-rendered <head> as a preload
 * link, so the browser starts fetching it before hydration rather than after,
 * which is what actually cost the LCP window when this was a background-image
 * set from a useEffect.
 *
 * That leaves the question of what to show while it has not arrived, or if it
 * never does. The answer is a drawn stand underneath, and the answer to "why is
 * there an outline behind my product" is this component: the drawing is removed
 * the moment the real file reports itself loaded, so the two are never on
 * screen together.
 *
 * Server-rendered output is the drawing, so the hero paints immediately with no
 * empty box, and swaps once the photograph is decoded.
 */

/** Self-hosted. This used to be a Higgsfield CDN URL — user-content, unversioned,
 *  no SLA, and it had already gone unreachable once — so the single most
 *  important image on the site was one purge away from a broken hero. Also used
 *  as the CSS mask source for the glare below, which needs a direct, un-proxied
 *  URL to the file rather than next/image's optimizer endpoint. */
export const STAND_CUTOUT = '/product/stand-cutout.webp';

export function StandCutout() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* The stand-in. Present until the photograph is decoded, and permanently
          if it never arrives, so the hero is complete either way. */}
      {loaded ? null : (
        <svg viewBox="0 0 1000 1000" className="tap-stage__fallback" aria-hidden="true">
          <path d="M250 760 L190 880 L840 880 L780 760 Z" fill="#1b1a19" />
          <rect x="255" y="120" width="530" height="650" rx="26" fill="#3a3733" />
          <rect x="266" y="128" width="512" height="634" rx="20" fill="#0d0d0e" />
          <rect x="330" y="200" width="384" height="22" rx="11" fill="#57524a" />
          <g fill="#7d6318">
            {[420, 475, 530, 585, 640].map((cx) => (
              <circle key={cx} cx={cx} cy={300} r={20} />
            ))}
          </g>
          <rect x="400" y="380" width="240" height="240" fill="#3a3733" />
          <rect x="380" y="680" width="280" height="16" rx="8" fill="#7d6318" />
        </svg>
      )}

      <Image
        src={STAND_CUTOUT}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="(min-width: 1024px) 420px, (min-width: 640px) 320px, 60vw"
        className="tap-stage__photo"
        style={{ objectFit: 'contain', objectPosition: 'center' }}
        data-loaded={loaded ? '' : undefined}
        onLoad={() => setLoaded(true)}
      />

      {/* The glare is clipped to the product's own silhouette by using the same
          file as a mask, so it never shows in the empty corners of the frame.
          It waits for the photograph, or it would sweep across the drawing. */}
      {loaded ? (
        <span
          aria-hidden="true"
          className="tap-stage__glare"
          style={{
            maskImage: `url(${STAND_CUTOUT})`,
            WebkitMaskImage: `url(${STAND_CUTOUT})`,
          }}
        />
      ) : null}
    </>
  );
}
