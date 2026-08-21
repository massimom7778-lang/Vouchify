"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Reveal from "./Reveal";
import { disclosure, pressable } from "@/lib/animations";
import { Arrow, Stamp } from "./Icons";

type State = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full rounded-sm border border-rule-strong bg-background px-md py-sm text-body " +
  "transition-colors duration-[160ms] ease-out placeholder:text-muted/70 hover:border-foreground/40 " +
  "focus:border-accent";

export default function Enquiry() {
  const [state, setState] = useState<State>("idle");
  const [car, setCar] = useState("");
  const reduced = useReducedMotion() ?? false;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!car.trim()) {
      setState("error");
      return;
    }
    setState("sending");
    // Demonstration build: no backend is wired up.
    await new Promise((r) => setTimeout(r, 700));
    setState("sent");
  }

  return (
    <section id="enquiry" className="scroll-mt-2xl bg-ink-inverse text-on-inverse">
      <div className="mx-auto grid max-w-[84rem] gap-2xl px-md py-3xl md:px-xl lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-4xl">
        <Reveal>
          <h2 className="max-w-[16ch] text-h1 font-light">Begin with an assessment.</h2>
          <p className="mt-lg max-w-measure text-body text-on-inverse/72">
            Two days, on site, with the gauge. You get the readings and a written
            recommendation whether or not you go further with us.
          </p>

          <dl className="mt-2xl grid gap-lg border-t border-on-inverse/22 pt-lg sm:grid-cols-2">
            {[
              ["Assessment", "2 days · from £480"],
              ["Typical wait", "4–6 weeks"],
              ["Transport", "Enclosed, at cost"],
              ["Cars held", "Six at a time, maximum"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="label !text-on-inverse/55">{k}</dt>
                <dd className="tnum mt-2xs text-body">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal>
          <AnimatePresence mode="wait" initial={false}>
            {state === "sent" ? (
              <motion.div
                key="sent"
                initial={reduced ? { opacity: 0 } : { opacity: 0, translateY: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, translateY: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", duration: 0.45, bounce: 0 }}
                className="border border-on-inverse/22 p-xl"
              >
                <Stamp className="h-6 w-6 text-on-inverse/72" />
                <h3 className="mt-lg text-h2 font-light">Enquiry recorded.</h3>
                <p className="mt-md text-small text-on-inverse/72">
                  In a live build this would open a file and reply within two working
                  days. Nothing was sent — this demonstration has no backend.
                </p>
                <button type="button" onClick={() => setState("idle")} className="btn btn-secondary mt-lg !border-on-inverse/30 !text-on-inverse">
                  Start another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                initial={false}
                exit={{ opacity: 0 }}
                className="space-y-md border border-on-inverse/22 p-xl"
              >
                <div>
                  <label htmlFor="car" className="label !text-on-inverse/55">
                    The car <span aria-hidden>*</span>
                  </label>
                  <input
                    id="car"
                    name="car"
                    required
                    value={car}
                    onChange={(e) => {
                      setCar(e.target.value);
                      if (state === "error") setState("idle");
                    }}
                    aria-invalid={state === "error"}
                    aria-describedby={state === "error" ? "car-error" : undefined}
                    placeholder="Year, marque, and what it is"
                    className={`${FIELD} mt-xs !bg-transparent !border-on-inverse/30 !text-on-inverse placeholder:!text-on-inverse/62`}
                  />
                  <AnimatePresence initial={false}>
                    {state === "error" && (
                      <motion.p id="car-error" role="alert" className="overflow-hidden text-small text-accent" {...disclosure(reduced)}>
                        <span className="block pt-xs">Tell us what the car is so we can quote the right assessment.</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label htmlFor="email" className="label !text-on-inverse/55">Email</label>
                  <input id="email" name="email" type="email" placeholder="you@example.com"
                    className={`${FIELD} mt-xs !bg-transparent !border-on-inverse/30 !text-on-inverse placeholder:!text-on-inverse/62`} />
                </div>

                <div>
                  <label htmlFor="context" className="label !text-on-inverse/55">What prompts this</label>
                  <textarea id="context" name="context" rows={4} placeholder="A show entry, a sale, a season, or a previous job you were not happy with"
                    className={`${FIELD} mt-xs resize-y !bg-transparent !border-on-inverse/30 !text-on-inverse placeholder:!text-on-inverse/62`} />
                </div>

                <motion.button
                  type="submit"
                  disabled={state === "sending"}
                  className="btn btn-primary w-full justify-center"
                  {...(reduced ? {} : pressable)}
                >
                  {state === "sending" ? "Recording…" : "Request assessment"}
                  {state !== "sending" && <Arrow className="h-4 w-4" />}
                </motion.button>

                <p className="text-small text-on-inverse/55">
                  We reply to every enquiry, including the ones we turn down.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
