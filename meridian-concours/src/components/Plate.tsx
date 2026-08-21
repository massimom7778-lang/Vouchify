"use client";

import { motion, useReducedMotion } from "framer-motion";
import DetailingBay from "./DetailingBay";
import Figure from "./Figure";
import { pressable, reveal, stagger } from "@/lib/animations";

const READINGS = [
  { label: "Panels measured", value: 41, decimals: 0, suffix: "" },
  { label: "Mean film build", value: 112.4, decimals: 1, suffix: "µm" },
  { label: "Thinnest reading", value: 87.0, decimals: 1, suffix: "µm" },
  { label: "Removed in correction", value: 3.2, decimals: 1, suffix: "µm" },
];

export default function Plate() {
  const reduced = useReducedMotion() ?? false;
  const item = reveal(reduced);

  return (
    <section className="relative isolate overflow-hidden bg-ink-inverse text-on-inverse">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[14%] top-[-28%] h-[52rem] w-[52rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(122,46,34,.34), transparent 70%)" }}
      />

      <motion.div
        variants={stagger(reduced, 0.08, 0.06)}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-[84rem] px-md pt-2xl md:px-xl md:pt-3xl"
      >
        <div className="grid gap-xl lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <motion.h1 variants={item} className="max-w-[13ch] text-display font-light">
              Custodianship,
              <br />
              not car washing.
            </motion.h1>

            <motion.p variants={item} className="mt-lg max-w-[52ch] text-body text-on-inverse/72">
              An appointment-only practice for exotic and collector cars. We remove
              less material than anyone you have used, and we write down every
              micron of it.
            </motion.p>

            <motion.div variants={item} className="mt-xl flex flex-wrap items-center gap-md">
              <motion.a href="#enquiry" className="btn btn-primary" {...(reduced ? {} : pressable)}>
                Request an assessment
              </motion.a>
              <a
                href="#record"
                className="text-small text-on-inverse/72 underline decoration-on-inverse/30 transition-colors duration-[160ms] ease-out hover:text-on-inverse hover:decoration-on-inverse"
              >
                Read a complete record first
              </a>
            </motion.div>
          </div>

          <motion.dl
            variants={item}
            className="w-full max-w-[19rem] border border-on-inverse/22 p-lg text-small lg:w-[19rem]"
          >
            <div className="label !text-on-inverse/55">Intake</div>
            <div className="mt-sm space-y-xs">
              {[
                ["Subject", "1973 · Berlinetta"],
                ["Reference", "MC-0412"],
                ["Received", "14 March"],
                ["Released", "9 May"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-md border-b border-on-inverse/12 pb-xs last:border-0">
                  <dt className="text-on-inverse/55">{k}</dt>
                  <dd className="tnum text-right">{v}</dd>
                </div>
              ))}
            </div>
          </motion.dl>
        </div>
      </motion.div>

      {/* The bay. Full-bleed so the car reads at the scale it has in life. */}
      <div className="relative mt-xl w-full md:mt-2xl">
        <DetailingBay className="block h-auto w-full min-w-[46rem] md:min-w-0" />
      </div>

      <div className="relative mx-auto max-w-[84rem] px-md pb-xl md:px-xl md:pb-2xl">
        <ul className="grid grid-cols-2 gap-lg border-t border-on-inverse/22 pt-lg sm:grid-cols-4">
          {READINGS.map((r, i) => (
            <li key={r.label} className="pr-md">
              <div className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] font-light leading-none">
                <Figure value={r.value} decimals={r.decimals} suffix={r.suffix} delay={0.5 + i * 0.09} />
              </div>
              <div className="label mt-xs !text-on-inverse/55">{r.label}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
