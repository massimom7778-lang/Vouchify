"use client";

import Reveal, { RevealItem } from "./Reveal";

/** All names below are invented for this demonstration build. */
const CLUBS = [
  "Berlinetta Register",
  "Northern Marque Club",
  "Ardenne Concours d'Élégance",
  "The Coachbuilt Society",
  "Vale Classic Trials",
];

const NOTES = [
  {
    quote:
      "They talked me out of correcting two panels and explained why in numbers. No one had ever shown me a reading before.",
    who: "R.T.",
    car: "1973 berlinetta · owner since 2009",
  },
  {
    quote:
      "The record came back bound, and the buyer's inspector read it end to end. It settled the price argument in about four minutes.",
    who: "M.A.",
    car: "1967 coupé · sold at auction 2025",
  },
  {
    quote:
      "Nine cars, one schedule, one file each. I stopped having to remember which car was due.",
    who: "J.K.",
    car: "collection manager · nine cars",
  },
];

export default function Standing() {
  return (
    <section id="standing" className="mx-auto max-w-[84rem] scroll-mt-2xl px-md py-3xl md:px-xl">
      <Reveal>
        <p className="label">Cars we look after are entered and registered with</p>
      </Reveal>

      <Reveal className="mt-lg flex flex-wrap items-center gap-x-xl gap-y-md border-y border-rule py-lg" staggerChildren={0.05}>
        {CLUBS.map((c) => (
          <RevealItem key={c} className="font-display text-[1.0625rem] font-light text-muted">
            {c}
          </RevealItem>
        ))}
      </Reveal>

      <Reveal className="mt-2xl grid gap-xl md:grid-cols-3" staggerChildren={0.09}>
        {NOTES.map((n) => (
          <RevealItem key={n.who} as="div">
            <blockquote className="font-display text-[1.25rem] font-light leading-[1.45]">
              &ldquo;{n.quote}&rdquo;
            </blockquote>
            <footer className="mt-md border-t border-rule pt-sm">
              <span className="text-small font-medium">{n.who}</span>
              <span className="label ml-sm">{n.car}</span>
            </footer>
          </RevealItem>
        ))}
      </Reveal>

      <Reveal className="mt-xl">
        <p className="label max-w-measure">
          Demonstration build — clubs, events, and owners named on this page are
          invented and must be replaced before publication.
        </p>
      </Reveal>
    </section>
  );
}
