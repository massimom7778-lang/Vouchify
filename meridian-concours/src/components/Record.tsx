"use client";

import Image from "next/image";
import Reveal, { RevealItem } from "./Reveal";

/**
 * The Dossier. Services are not a card grid — they are the stages one car
 * passed through, each stating what was done and what was deliberately not.
 */
const STAGES = [
  {
    n: "01",
    title: "Assessment",
    days: "2 days",
    did: "Forty-one panels measured on a calibrated gauge. Paint depth mapped, logged, and photographed under controlled light before anything is touched.",
    didnt: "No machine was brought near the car. An assessment that ends in a recommendation to do nothing is a valid outcome and is billed the same.",
    plate: "/plates/stage-1.svg",
    alt: "Placeholder plate: measurement grid marking panel readings on a car body. Photography to be supplied.",
  },
  {
    n: "02",
    title: "Correction",
    days: "19 days",
    did: "Defects removed by hand where the reading allowed it, refined in stages, each pass re-measured. Mean removal across the car: 3.2µm.",
    didnt: "Two panels were left uncorrected. Original lacquer at 87µm is evidence of an unrepainted car and worth more than a flawless reflection.",
    plate: "/plates/stage-2.svg",
    alt: "Placeholder plate: correction stage record showing before and after readings. Photography to be supplied.",
  },
  {
    n: "03",
    title: "Preservation",
    days: "6 days",
    did: "A reversible coating specified to the finish, not to a warranty length. Full condition record bound and handed over with the keys.",
    didnt: "No permanent film was applied. Anything we put on this car can be taken off by whoever holds it in thirty years.",
    plate: "/plates/stage-3.svg",
    alt: "Placeholder plate: preservation stage with bound condition record. Photography to be supplied.",
  },
];

export default function Record() {
  return (
    <section id="record" className="mx-auto max-w-[84rem] scroll-mt-2xl px-md py-3xl md:px-xl">
      <Reveal className="max-w-measure">
        <h2 className="text-h1 font-light">One car, from arrival to release.</h2>
        <p className="mt-lg text-body text-muted">
          Reference MC-0412 is a 1973 berlinetta received in March. What follows is
          its actual record — the same document every car leaves with. It is the
          most honest description of the practice we can offer.
        </p>
      </Reveal>

      <div className="mt-2xl border-t border-rule-strong">
        {STAGES.map((s) => (
          <Reveal key={s.n} variant="row" className="border-b border-rule py-xl">
            <article className="grid gap-lg lg:grid-cols-[7rem_minmax(0,1fr)_20rem] lg:gap-xl">
              <div className="flex items-baseline gap-md lg:flex-col lg:gap-2xs">
                <span className="label !text-accent">{s.n}</span>
                <span className="label">{s.days}</span>
              </div>

              <div>
                <h3 className="text-h2 font-light">{s.title}</h3>
                <p className="mt-md max-w-measure text-body">{s.did}</p>
                <p className="mt-md max-w-measure border-l border-accent pl-md text-small text-muted">
                  <span className="font-medium text-foreground">What we did not do. </span>
                  {s.didnt}
                </p>
              </div>

              <figure className="lg:pt-2xs">
                <div className="relative aspect-[10/7] overflow-hidden rounded-sm border border-rule bg-sunken">
                  <Image
                    src={s.plate}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 20rem"
                    className="object-cover"
                  />
                </div>
                <figcaption className="label mt-xs">Plate {s.n} · placeholder</figcaption>
              </figure>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-xl" staggerChildren={0.06}>
        <RevealItem className="max-w-measure text-body">
          <span className="font-medium">Outcome. </span>
          Entered at a marque club concours in June. Second in class, and a judging
          note on the retained original lacquer — which is the only result we were
          trying for.
        </RevealItem>
      </Reveal>
    </section>
  );
}
