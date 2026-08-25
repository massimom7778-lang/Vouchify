'use client';

import { useEffect, useState } from 'react';

/**
 * The product layer of the hero.
 *
 * The photograph is painted as a background rather than an <img> because a
 * broken <img> spills its alt text across the middle of the hero, which is
 * exactly what happened the first time the CDN was unreachable. A background
 * that fails simply does not paint.
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

/** TODO: self-host. This is Higgsfield's CDN, so the hero depends on it staying
 *  up. Download the file, drop it in public/product/, and change this to
 *  '/product/stand-cutout.png'. Nothing else has to change. */
export const STAND_CUTOUT =
  'https://d8j0ntlcm91z4.cloudfront.net/user_3IONDmkNXNvYhapdG4wMa0XBoJD/hf_20260825_045738_1982ca91-1d7e-4a14-9fbb-a2d68d37c225.png';

export function StandCutout() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => setLoaded(true);
    img.src = STAND_CUTOUT;
    if (img.complete && img.naturalWidth > 0) setLoaded(true);
    return () => {
      img.onload = null;
    };
  }, []);

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

      <span
        aria-hidden="true"
        className="tap-stage__photo"
        data-loaded={loaded ? '' : undefined}
        style={{ backgroundImage: `url(${STAND_CUTOUT})` }}
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
