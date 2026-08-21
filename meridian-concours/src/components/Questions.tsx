"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Reveal from "./Reveal";
import { disclosure } from "@/lib/animations";
import { Plus } from "./Icons";

const QA = [
  {
    q: "Why will you not publish prices?",
    a: "Because the number depends on readings we have not taken yet. A car with 140µm of original paint and a car with 90µm need different work and carry different risk. Publishing a figure would mean either over-charging the easy cars or discovering the hard ones halfway through.",
  },
  {
    q: "How long will you keep my car?",
    a: "An assessment is two days. A full correction and preservation on a car like MC-0412 was twenty-seven days end to end. Concours preparation runs three to six weeks depending on the event and how much of the underside is in scope.",
  },
  {
    q: "Will you make it look perfect?",
    a: "Not if perfect costs originality. On MC-0412 we left two panels uncorrected because the lacquer was thin and original, and that decision is written into the record. If you want uniformity above all else, we are the wrong practice and will say so at assessment.",
  },
  {
    q: "Is the coating permanent?",
    a: "No, deliberately. Everything we apply is reversible by a competent specialist. A car that outlives us should not carry a decision we made in 2026 that nobody can undo.",
  },
  {
    q: "Do you collect?",
    a: "Yes. Enclosed transport is arranged for anything we take on, and it is quoted separately at cost. We do not ask owners to drive a car to us for an assessment.",
  },
];

export default function Questions() {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="questions" className="scroll-mt-2xl border-t border-rule-strong bg-surface">
      <div className="mx-auto max-w-[84rem] px-md py-3xl md:px-xl">
        <div className="grid gap-2xl lg:grid-cols-[24rem_minmax(0,1fr)] lg:gap-4xl">
          <Reveal>
            <h2 className="text-h1 font-light">Questions we are actually asked.</h2>
            <p className="mt-lg max-w-measure text-body text-muted">
              If yours is not here, it is a good first thing to put in an enquiry.
            </p>
          </Reveal>

          <Reveal className="border-t border-rule-strong">
            <dl>
              {QA.map((item, i) => {
                const isOpen = open === i;
                return (
                  <div key={item.q} className="border-b border-rule">
                    <dt>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`answer-${i}`}
                        className="flex w-full items-start justify-between gap-md py-lg text-left transition-colors duration-[160ms] ease-out hover:text-accent"
                      >
                        <span className="text-h3 font-medium">{item.q}</span>
                        <motion.span
                          animate={reduced ? undefined : { rotate: isOpen ? 45 : 0 }}
                          transition={{ type: "spring", duration: 0.32, bounce: 0 }}
                          className="mt-[0.15em] shrink-0 text-accent"
                        >
                          <Plus className="h-5 w-5" />
                        </motion.span>
                      </button>
                    </dt>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.dd id={`answer-${i}`} className="overflow-hidden" {...disclosure(reduced)}>
                          <p className="max-w-measure pb-lg text-body text-muted">{item.a}</p>
                        </motion.dd>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
