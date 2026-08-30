import { StandCutout } from '@/components/StandCutout';
import { cn } from '@/lib/cn';

/**
 * The hero stage: the real product, doing the one thing it does.
 *
 * The stand is a cut-out photograph of the actual product, floating free with
 * no background, turning slowly left and right while a specular glare travels
 * across it. Everything it is talking to, the arcs leaving the chip and the
 * phone that answers, is drawn in SVG beside it.
 *
 * The stage sits on paper, not on ink. A black product on a black field is a
 * silhouette; on warm white it is a product.
 *
 * Why a cut-out rather than a video: alpha video is a codec fight nobody wins
 * across Safari and Chrome at once, a still stays sharp at any screen size, and
 * a photograph of the product can never warp the printed artwork the way a
 * generated frame can. The motion is CSS, so it costs a phone nothing.
 *
 * The turn and the float run on different periods, eleven seconds against
 * seven, so the two never line up twice the same way and the loop does not read
 * as a loop. Reduced motion parks all of it at the resting frame.
 */

export function TapStage({ className }: { className?: string }) {
  return (
    <div className={cn('tap-stage', className)}>
      {/* ---- the real product, hovering ---- */}
      {/* The photograph (StandCutout) is self-hosted and decorative — see that
          file for why alt="" is what actually keeps a failed load silent, not
          which element type renders it. The drawn stand underneath is what
          shows instead, so the hero is complete either way. */}
      <div
        className="tap-stage__product"
        role="img"
        aria-label="The Vouchify review stand: a black acrylic L-shaped countertop stand carrying a review prompt, five stars, a QR code and a tap-or-scan line."
      >
        <div className="tap-stage__turn">
          <div className="tap-stage__float">
            <StandCutout />
          </div>
        </div>
        <span aria-hidden="true" className="tap-stage__shadow" />
      </div>

      {/* ---- what the chip is doing, and what answers ---- */}
      <svg
        viewBox="0 0 190 358"
        className="tap-stage__side"
        role="img"
        aria-label="Three arcs leave the stand and a phone beside it opens a review page, where a five star rating fills in."
      >
        <defs>
          <linearGradient id="ts-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b1a18" />
            <stop offset="100%" stopColor="#121110" />
          </linearGradient>
          <symbol id="ts-star" viewBox="0 0 24 24">
            <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z" />
          </symbol>
        </defs>

        {/* gold-deep, not gold: pure gold measures 2.07:1 on paper and the
            arcs would sit on the page as a smudge */}
        <g className="ts-waves" stroke="#7d6318" fill="none" strokeLinecap="round">
          <path className="ts-wave ts-wave-1" d="M8 145a40 40 0 0 1 0 56" strokeWidth="2" />
          <path className="ts-wave ts-wave-2" d="M22 133a58 58 0 0 1 0 80" strokeWidth="1.75" />
          <path className="ts-wave ts-wave-3" d="M36 121a76 76 0 0 1 0 104" strokeWidth="1.5" />
        </g>

        <g className="ts-phone">
          <ellipse cx="118" cy="306" rx="50" ry="8" fill="#282218" opacity="0.16" />
          <rect x="70" y="114" width="96" height="186" rx="14" fill="#1a1917" />
          <rect x="74" y="118" width="88" height="178" rx="11" fill="url(#ts-screen)" />
          <rect x="106" y="124" width="24" height="3" rx="1.5" fill="#4a4640" />

          <g className="ts-page">
            <rect x="84" y="142" width="68" height="7" rx="3.5" fill="#4a4640" />
            <rect x="84" y="155" width="46" height="6" rx="3" fill="#3a3733" />

            <g className="ts-rating">
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <use href="#ts-star" x={84 + i * 14} y={178} width="12" height="12" fill="#33302c" />
                  <use
                    href="#ts-star"
                    x={84 + i * 14}
                    y={178}
                    width="12"
                    height="12"
                    fill="#c9a961"
                    className={`ts-star-on ts-star-${i + 1}`}
                  />
                </g>
              ))}
            </g>

            <rect x="84" y="206" width="68" height="5" rx="2.5" fill="#2e2b28" />
            <rect x="84" y="216" width="54" height="5" rx="2.5" fill="#2e2b28" />
            <rect x="84" y="240" width="68" height="18" rx="6" className="ts-submit" fill="#c9a961" />
          </g>
        </g>
      </svg>
    </div>
  );
}
