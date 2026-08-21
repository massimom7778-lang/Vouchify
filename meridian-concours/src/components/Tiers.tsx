"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal, { RevealItem } from "./Reveal";
import { pressable } from "@/lib/animations";
import { Caliper, Lamp, Vault } from "./Icons";

const TIERS = [
  {
    icon: Caliper,
    name: "Custodianship",
    basis: "Ongoing · by arrangement",
    cadence: "Two visits per year",
    duration: "3–5 days per visit",
    price: "On application",
    scope: [
      "Full re-measurement each visit, tracked against intake",
      "Correction only where the reading permits it",
      "Condition record updated and re-bound annually",
      "Direct line to the technician who holds the file",
    ],
  },
  {
    icon: Lamp,
    name: "Concours preparation",
    basis: "Event-driven",
    cadence: "Single engagement",
    duration: "3–6 weeks",
    price: "From £6,400",
    scope: [
      "Judging-sheet-led preparation for a named event",
      "Underside, engine bay, and interior to the same standard",
      "Originality retained in preference to uniformity",
      "Transport and on-site attendance arranged",
    ],
    lead: true,
  },
  {
    icon: Vault,
    name: "Collection care",
    basis: "Multi-car · storage integrated",
    cadence: "Continuous",
    duration: "By schedule",
    price: "On application",
    scope: [
      "Rotation schedule across the collection",
      "Storage-condition monitoring and reporting",
      "One record per car, held centrally",
      "Pre-sale and pre-show preparation as needed",
    ],
  },
];

export default function Tiers() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="tiers" className="scroll-mt-2xl border-y border-rule-strong bg-surface">
      <div className="mx-auto max-w-[84rem] px-md py-3xl md:px-xl">
        <Reveal className="max-w-measure">
          <h2 className="text-h1 font-light">Three ways we hold a car.</h2>
          <p className="mt-lg text-body text-muted">
            We quote against a car, not against a package. The figures below are
            starting points from real engagements; the assessment sets the number.
          </p>
        </Reveal>

        <Reveal className="mt-2xl grid gap-px border border-rule-strong bg-rule-strong md:grid-cols-3" staggerChildren={0.08}>
          {TIERS.map((t) => {
            const Icon = t.icon;
            return (
              <RevealItem key={t.name} className="flex flex-col bg-surface p-lg md:p-xl">
                <Icon className="h-6 w-6 text-accent" />

                <h3 className="mt-lg text-h2 font-light">{t.name}</h3>
                <p className="label mt-2xs">{t.basis}</p>

                <dl className="mt-lg space-y-xs border-y border-rule py-md text-small">
                  {[["Cadence", t.cadence], ["Time on site", t.duration], ["Indicative", t.price]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-md">
                      <dt className="text-muted">{k}</dt>
                      <dd className="tnum text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-lg flex-1 space-y-sm text-small">
                  {t.scope.map((s) => (
                    <li key={s} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-sm">
                      <span aria-hidden className="mt-[0.7em] h-px w-3 bg-accent" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <motion.a
                  href="#enquiry"
                  className={`btn mt-xl justify-center ${t.lead ? "btn-primary" : "btn-secondary"}`}
                  {...(reduced ? {} : pressable)}
                >
                  Request assessment
                </motion.a>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
