import { cn } from '@/lib/cn';

/**
 * The hero stage: the product doing the one thing it does.
 *
 * A phone drifts in, the chip answers, five stars fill. It is the whole value
 * proposition in twelve seconds, drawn rather than photographed, so it needs no
 * assets and stays sharp at any size. The loop rests for most of its length on
 * purpose: a hero that moves constantly reads as a banner ad.
 *
 * Everything animated here is transform or opacity, so it composites on the GPU
 * and costs nothing on a phone. Reduced motion freezes the whole thing at its
 * resting frame, which is composed to stand alone.
 *
 * The face carries the product's real furniture: the ask, the stars, the
 * bracketed code block, the tap-or-scan line. The one thing deliberately not
 * drawn is the review platform's logo, because a redrawn trademark is a
 * trademark either way. The gold rule at the foot stands in for it.
 */
export function TapStage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 358"
      className={cn('tap-stage w-full', className)}
      role="img"
      aria-label="A phone approaches the black review stand, the chip answers, and a five star rating fills in on the phone screen."
    >
      <defs>
        {/* the pool of light the stand sits in */}
        <radialGradient id="ts-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a961" stopOpacity="0.20" />
          <stop offset="60%" stopColor="#c9a961" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#c9a961" stopOpacity="0" />
        </radialGradient>
        {/* the acrylic face, warmer at the top where the light lands */}
        <linearGradient id="ts-face" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#232120" />
          <stop offset="55%" stopColor="#0f0e0e" />
          <stop offset="100%" stopColor="#0b0b0c" />
        </linearGradient>
        <linearGradient id="ts-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1a18" />
          <stop offset="100%" stopColor="#121110" />
        </linearGradient>
        <symbol id="ts-star" viewBox="0 0 24 24">
          <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z" />
        </symbol>
      </defs>

      {/* ---- the light the whole scene sits in ---- */}
      <ellipse cx="176" cy="322" rx="150" ry="34" fill="url(#ts-pool)" />

      {/* ---- the stand ---- */}
      <g className="ts-stand">
        {/* folded foot, seen edge on, catching a little of the pool */}
        <path d="M112 300 L96 322 L244 322 L228 300 Z" fill="#141312" />
        <path d="M96 322 L244 322" stroke="#4a4640" strokeWidth="1" />

        {/* the face, with the white edge the real stand has */}
        <rect x="105" y="57" width="142" height="244" rx="8" fill="#e8e4dc" />
        <rect x="108" y="58" width="138" height="242" rx="7" fill="url(#ts-face)" />

        {/* the ask */}
        <text
          x="178" y="92" textAnchor="middle" fill="#f7f5f0"
          className="font-sans text-[11px] font-semibold"
        >
          We&rsquo;d love your feedback
        </text>

        {/* five stars, always full on the product itself */}
        <g fill="#c9a961">
          {[0, 1, 2, 3, 4].map((i) => (
            <use key={i} href="#ts-star" x={140 + i * 16} y={104} width="13" height="13" />
          ))}
        </g>

        {/* the bracketed code block */}
        <g stroke="#8f877a" strokeWidth="1.25" fill="none">
          <path d="M142 138v-7h7M214 138v-7h-7M142 194v7h7M214 194v7h-7" />
        </g>
        <rect x="150" y="139" width="56" height="56" fill="#f2efe9" />
        <g fill="#0b0b0c">
          <path d="M155 144h13v13h-13zM188 144h13v13h-13zM155 177h13v13h-13z" />
          <path d="M159 148h5v5h-5zM192 148h5v5h-5zM159 181h5v5h-5z" fill="#f2efe9" />
          <path d="M173 148h4v4h-4zM180 155h4v4h-4zM173 162h4v4h-4zM166 162h4v4h-4z" />
          <path d="M188 166h4v4h-4zM195 173h4v4h-4zM181 173h4v4h-4zM188 180h4v4h-4z" />
          <path d="M173 187h4v4h-4zM195 187h4v4h-4z" />
        </g>

        {/* tap or scan */}
        <text
          x="178" y="222" textAnchor="middle" fill="#b4ada0"
          className="font-sans text-[9px] font-semibold"
          style={{ letterSpacing: '0.14em' }}
        >
          TAP OR SCAN
        </text>

        {/* the rule at the foot */}
        <rect x="126" y="276" width="104" height="4" rx="2" fill="#c9a961" opacity="0.85" />
      </g>

      {/* ---- what the chip is doing, drawn ---- */}
      <g className="ts-waves" stroke="#c9a961" fill="none" strokeLinecap="round">
        <path className="ts-wave ts-wave-1" d="M258 128a44 44 0 0 1 0 62" strokeWidth="2" />
        <path className="ts-wave ts-wave-2" d="M272 116a62 62 0 0 1 0 86" strokeWidth="1.75" />
        <path className="ts-wave ts-wave-3" d="M286 104a80 80 0 0 1 0 110" strokeWidth="1.5" />
      </g>

      {/* ---- the phone ---- */}
      <g className="ts-phone">
        <ellipse cx="364" cy="304" rx="52" ry="8" fill="#c9a961" opacity="0.10" />
        <rect x="316" y="112" width="96" height="186" rx="14" fill="#2a2724" />
        <rect x="320" y="116" width="88" height="178" rx="11" fill="url(#ts-screen)" />
        <rect x="352" y="122" width="24" height="3" rx="1.5" fill="#4a4640" />

        {/* the review page that opens */}
        <g className="ts-page">
          <rect x="330" y="140" width="68" height="7" rx="3.5" fill="#4a4640" />
          <rect x="330" y="153" width="46" height="6" rx="3" fill="#3a3733" />

          {/* the stars fill one at a time */}
          <g className="ts-rating">
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <use href="#ts-star" x={330 + i * 14} y={176} width="12" height="12" fill="#33302c" />
                <use
                  href="#ts-star"
                  x={330 + i * 14}
                  y={176}
                  width="12"
                  height="12"
                  fill="#c9a961"
                  className={`ts-star-on ts-star-${i + 1}`}
                />
              </g>
            ))}
          </g>

          <rect x="330" y="204" width="68" height="5" rx="2.5" fill="#2e2b28" />
          <rect x="330" y="214" width="54" height="5" rx="2.5" fill="#2e2b28" />
          <rect x="330" y="238" width="68" height="18" rx="6" className="ts-submit" fill="#c9a961" />
        </g>
      </g>
    </svg>
  );
}
