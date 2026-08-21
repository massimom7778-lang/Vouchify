"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Authored hero illustration: a track-spec car under the lamps of a detailing bay.
 *
 * Not a photograph, and deliberately not a photo-shaped gradient cutout — every
 * contour is drawn. Palette comes from MASTER.md § Bay Scene.
 *
 * The signature motion is the polish sweep: a specular band travelling along the
 * shell, clipped to the body, the way a light bar reads across fresh paint.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Body shell outline, front to the right. */
const BODY =
  "M150 412 L150 372 C150 340 162 318 198 306 L262 292 " +
  "C300 268 340 250 396 240 C470 224 560 218 640 224 " +
  "C700 230 742 246 786 276 L852 296 C900 300 960 306 1010 316 " +
  "C1038 322 1052 336 1054 356 L1058 400 L1062 412 Z";

function Wheel({ cx, spin }: { cx: number; spin: boolean }) {
  const spokes = Array.from({ length: 5 }, (_, i) => (i * 360) / 5);
  return (
    <g>
      {/* arch shadow */}
      <circle cx={cx} cy={400} r={86} fill="var(--color-bay-floor)" opacity={0.55} />
      <circle cx={cx} cy={400} r={78} fill="var(--color-tyre)" />
      <circle cx={cx} cy={400} r={78} fill="none" stroke="var(--color-car-shade)" strokeWidth={1} opacity={0.25} />
      <motion.g
        style={{ originX: `${cx}px`, originY: "400px" }}
        animate={spin ? { rotate: 360 } : undefined}
        transition={spin ? { duration: 22, repeat: Infinity, ease: "linear" } : undefined}
      >
        <circle cx={cx} cy={400} r={49} fill="none" stroke="var(--color-rim)" strokeWidth={3} />
        {spokes.map((a) => (
          <line
            key={a}
            x1={cx}
            y1={400}
            x2={cx + 46 * Math.cos((a * Math.PI) / 180)}
            y2={400 + 46 * Math.sin((a * Math.PI) / 180)}
            stroke="var(--color-rim)"
            strokeWidth={7}
            strokeLinecap="round"
          />
        ))}
        <circle cx={cx} cy={400} r={12} fill="var(--color-accent)" />
      </motion.g>
      {/* brake disc glimpse */}
      <circle cx={cx} cy={400} r={40} fill="none" stroke="var(--color-car-shade)" strokeWidth={1} opacity={0.3} />
    </g>
  );
}

function Car({ spin }: { spin: boolean }) {
  return (
    <g>
      {/* shell */}
      <path d={BODY} fill="url(#shellGrad)" />
      {/* lower shade */}
      <path
        d="M150 412 L1062 412 L1058 400 L152 404 Z"
        fill="var(--color-car-shade)"
        opacity={0.8}
      />
      {/* greenhouse */}
      <path
        d="M424 252 C486 234 570 228 634 234 C688 240 726 254 764 280 L470 290 Z"
        fill="var(--color-car-glass)"
      />
      {/* a-pillar + roof edge */}
      <path
        d="M424 252 C486 234 570 228 634 234 C688 240 726 254 764 280"
        fill="none"
        stroke="var(--color-car-shade)"
        strokeWidth={2}
      />
      {/* door shut line */}
      <path d="M556 246 L548 400" stroke="var(--color-car-shade)" strokeWidth={1.5} opacity={0.7} fill="none" />
      {/* rear haunch intake */}
      <path d="M296 306 L382 294 L380 310 L294 320 Z" fill="var(--color-car-glass)" opacity={0.9} />
      <path d="M300 324 L372 314" stroke="var(--color-car-shade)" strokeWidth={2} opacity={0.5} />
      {/* side skirt */}
      <path d="M402 406 L836 402 L832 418 L398 422 Z" fill="var(--color-tyre)" />
      <path d="M402 406 L836 402" stroke="var(--color-accent)" strokeWidth={2} opacity={0.85} />
      {/* front splitter */}
      <path d="M1000 404 L1078 398 L1082 412 L1002 418 Z" fill="var(--color-tyre)" />
      {/* headlamp */}
      <path d="M1006 330 C1028 330 1044 338 1048 352 L1006 356 Z" fill="var(--color-light)" opacity={0.92} />
      {/* front intake */}
      <path d="M1010 372 L1056 368 L1058 384 L1012 388 Z" fill="var(--color-car-glass)" />
      {/* mirror */}
      <path d="M788 266 L814 258 L820 270 L792 277 Z" fill="var(--color-car-shade)" />
      {/* roof intake */}
      <path d="M512 226 L566 222 L562 234 L510 237 Z" fill="var(--color-car-glass)" />
      {/* tail light bar */}
      <path d="M154 336 L196 330 L196 344 L154 350 Z" fill="var(--color-accent)" />

      {/* swan-neck wing */}
      <g>
        <path d="M104 250 L312 236 L312 254 L104 268 Z" fill="var(--color-car-shell)" />
        <path d="M104 250 L312 236" stroke="var(--color-car-shade)" strokeWidth={2} />
        {/* endplate */}
        <path d="M92 230 L118 227 L124 288 L98 291 Z" fill="var(--color-car-shade)" />
        {/* swan necks */}
        {[176, 260].map((x) => (
          <path
            key={x}
            d={`M${x} 244 C${x + 4} 272 ${x + 16} 288 ${x + 34} 296`}
            fill="none"
            stroke="var(--color-car-shell)"
            strokeWidth={7}
            strokeLinecap="round"
          />
        ))}
      </g>

      <Wheel cx={340} spin={spin} />
      <Wheel cx={912} spin={spin} />
    </g>
  );
}

export default function DetailingBay({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;

  const lampIn = (i: number) => ({
    initial: reduced ? { opacity: 1 } : { opacity: 0 },
    animate: { opacity: 1 },
    transition: reduced ? { duration: 0 } : { duration: 0.5, delay: 0.15 + i * 0.13, ease: EASE },
  });

  return (
    <svg
      viewBox="0 0 1200 560"
      className={className}
      role="img"
      aria-label="Illustration: a track-specification sports car with a swan-neck rear wing, standing under overhead lamps in a detailing bay."
    >
      <defs>
        <linearGradient id="shellGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-car-shell)" />
          <stop offset="72%" stopColor="var(--color-car-shell)" />
          <stop offset="100%" stopColor="var(--color-car-shade)" />
        </linearGradient>

        <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="lampGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-light)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--color-light)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <clipPath id="shellClip">
          <path d={BODY} />
        </clipPath>

        <mask id="reflMask">
          <rect x="0" y="412" width="1200" height="148" fill="url(#reflFade)" />
        </mask>
      </defs>

      {/* bay — the wall is the section's own ground, so only the floor is drawn */}
      <rect x="0" y="412" width="1200" height="148" fill="var(--color-bay-floor)" />

      {/* overhead lamps */}
      {[210, 480, 750, 1020].map((x, i) => (
        <motion.g key={x} {...lampIn(i)}>
          <rect x={x - 96} y={54} width={192} height={9} rx={4} fill="var(--color-light)" />
          <path d={`M${x - 96} 63 L${x + 96} 63 L${x + 150} 300 L${x - 150} 300 Z`} fill="url(#lampGlow)" />
        </motion.g>
      ))}

      {/* bay floor bands */}
      <g opacity={0.5}>
        <line x1="0" y1="412" x2="1200" y2="412" stroke="var(--color-car-shade)" strokeWidth={1} opacity={0.35} />
        <line x1="0" y1="470" x2="1200" y2="470" stroke="var(--color-car-shade)" strokeWidth={1} opacity={0.12} />
      </g>

      {/* floor reflection */}
      <g mask="url(#reflMask)" opacity={0.34}>
        <g transform="translate(0, 824) scale(1, -1)">
          <Car spin={false} />
        </g>
      </g>

      {/* the car */}
      <motion.g
        initial={reduced ? { opacity: 1 } : { opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.9, delay: 0.25, ease: EASE }}
      >
        <Car spin={!reduced} />

        {/* signature motion: the polish sweep across the shell */}
        {!reduced && (
          <g clipPath="url(#shellClip)">
            <motion.rect
              y={180}
              width={260}
              height={280}
              fill="url(#sweepGrad)"
              transform="skewX(-18)"
              initial={{ x: -360 }}
              animate={{ x: 1320 }}
              transition={{ duration: 2.1, delay: 1.15, ease: EASE, repeat: Infinity, repeatDelay: 5.2 }}
            />
          </g>
        )}
      </motion.g>
    </svg>
  );
}
