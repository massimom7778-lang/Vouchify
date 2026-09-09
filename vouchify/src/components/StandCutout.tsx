'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * The product layer of the hero: a cut-out photograph of the stand floating
 * free, with a drawn stand underneath for as long as the photograph is not
 * there.
 *
 * The drawing is not a placeholder in the loading-skeleton sense. It is the
 * hero whenever the photograph cannot be shown — before it decodes, when the
 * build has no cut-out in it (`src` is null, see TapStage), and when the
 * request for one dies — so the hero is complete in every one of those states
 * and the two are never on screen together.
 *
 * `alt=""` is not what keeps a failed load quiet, which is why `failed` exists.
 * A broken <img> still paints iOS Safari's blue broken-image glyph over the
 * product no matter what its alt says.
 */

function DrawnStand() {
  return (
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
  );
}

export function StandCutout({ src }: { src: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <DrawnStand />;

  return (
    <>
      {loaded ? null : <DrawnStand />}

      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="(min-width: 1024px) 420px, (min-width: 640px) 320px, 60vw"
        className="tap-stage__photo"
        style={{ objectFit: 'contain', objectPosition: 'center' }}
        data-loaded={loaded ? '' : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />

      {/* The glare is clipped to the product's own silhouette by using the same
          file as a mask, so it never shows in the empty corners of the frame.
          The mask wants the file itself, not next/image's optimizer endpoint.
          It waits for the photograph, or it would sweep across the drawing. */}
      {loaded ? (
        <span
          aria-hidden="true"
          className="tap-stage__glare"
          style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
        />
      ) : null}
    </>
  );
}
