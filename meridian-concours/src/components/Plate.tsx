"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Figure from "./Figure";
import { pressable, reveal, stagger } from "@/lib/animations";

const READINGS = [
  { label: "Panels measured", value: 41, decimals: 0, suffix: "" },
  { label: "Mean film build", value: 112.4, decimals: 1, suffix: "µm" },
  { label: "Thinnest reading", value: 87.0, decimals: 1, suffix: "µm" },
  { label: "Removed in correction", value: 3.2, decimals: 1, suffix: "µm" },
];

const POSTER_ALT =
  "A detailer in a dark bay works along the flank of a wet dark saloon under overhead lamps.";

export default function Plate() {
  const reduced = useReducedMotion() ?? false;
  const item = reveal(reduced);
  const ref = useRef<HTMLElement>(null);

  // Scroll drives the plate: the footage settles back and darkens while the
  // headline lifts away. Range is this section's own entry through its exit.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.22]);
  const veil = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -72]);
  const contentFade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <>
      <section
        ref={ref}
        className="relative isolate flex min-h-[38rem] flex-col justify-end overflow-hidden bg-ink-inverse text-on-inverse lg:h-[100svh]"
      >
        {/* Footage. Reduced motion gets the poster frame and nothing moving. */}
        <motion.div
          className="absolute inset-0 -z-10"
          style={reduced ? undefined : { y: mediaY, scale: mediaScale }}
        >
          {reduced ? (
            <Image src="/hero/bay-poster.jpg" alt={POSTER_ALT} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/hero/bay-poster.jpg"
              aria-label={POSTER_ALT}
            >
              <source src="/hero/bay-1920.mp4" type="video/mp4" media="(min-width: 900px)" />
              <source src="/hero/bay-1280.mp4" type="video/mp4" />
            </video>
          )}
        </motion.div>

        {/* Veil: keeps the headline at contrast as the footage brightens. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            opacity: reduced ? 0.7 : veil,
            background:
              "linear-gradient(100deg, rgba(14,13,11,.94) 0%, rgba(14,13,11,.72) 38%, rgba(14,13,11,.30) 68%, rgba(14,13,11,.55) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-40"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(14,13,11,.92))" }}
        />

        <motion.div
          variants={stagger(reduced, 0.08, 0.1)}
          initial="hidden"
          animate="visible"
          style={reduced ? undefined : { y: contentY, opacity: contentFade }}
          className="relative mx-auto w-full max-w-[84rem] px-md pb-2xl pt-3xl md:px-xl md:pb-3xl"
        >
          <div className="grid gap-xl lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <motion.h1 variants={item} className="max-w-[13ch] text-display font-light">
                Custodianship,
                <br />
                not car washing.
              </motion.h1>

              <motion.p variants={item} className="mt-lg max-w-[52ch] text-body text-on-inverse/78">
                An appointment-only practice for exotic and collector cars. Every
                stage happens by hand, under our own light — and we write down
                every micron we take off.
              </motion.p>

              <motion.div variants={item} className="mt-xl flex flex-wrap items-center gap-md">
                <motion.a href="#enquiry" className="btn btn-primary" {...(reduced ? {} : pressable)}>
                  Request an assessment
                </motion.a>
                <a
                  href="#record"
                  className="text-small text-on-inverse/78 underline decoration-on-inverse/30 transition-colors duration-[160ms] ease-out hover:text-on-inverse hover:decoration-on-inverse"
                >
                  Read a complete record first
                </a>
              </motion.div>
            </div>

            <motion.dl
              variants={item}
              className="w-full max-w-[19rem] border border-on-inverse/25 bg-ink-inverse/45 p-lg text-small lg:w-[19rem]"
            >
              <div className="label !text-on-inverse/60">Intake</div>
              <div className="mt-sm space-y-xs">
                {[
                  ["Subject", "1973 · Berlinetta"],
                  ["Reference", "MC-0412"],
                  ["Received", "14 March"],
                  ["Released", "9 May"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-md border-b border-on-inverse/14 pb-xs last:border-0">
                    <dt className="text-on-inverse/60">{k}</dt>
                    <dd className="tnum text-right">{v}</dd>
                  </div>
                ))}
              </div>
            </motion.dl>
          </div>
        </motion.div>
      </section>

      {/* Readings sit below the plate so they never fight the footage. */}
      <section className="bg-ink-inverse text-on-inverse">
        <div className="mx-auto max-w-[84rem] px-md pb-2xl md:px-xl">
          <ul className="grid grid-cols-2 gap-lg border-t border-on-inverse/22 pt-lg sm:grid-cols-4">
            {READINGS.map((r, i) => (
              <li key={r.label} className="pr-md">
                <div className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] font-light leading-none">
                  <Figure value={r.value} decimals={r.decimals} suffix={r.suffix} delay={0.3 + i * 0.09} />
                </div>
                <div className="label mt-xs !text-on-inverse/60">{r.label}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
