"use client";

import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { disclosure, pressable } from "@/lib/animations";

const LINKS = [
  { href: "#record", label: "The record" },
  { href: "#tiers", label: "Engagements" },
  { href: "#standing", label: "Standing" },
  { href: "#questions", label: "Questions" },
];

export default function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setStuck(v > 24));

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-[240ms] ease-out ${
        stuck ? "border-b border-rule bg-background/92 backdrop-blur-[2px]" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-[84rem] items-center justify-between px-md py-sm md:px-xl">
        <a href="#main" className="font-display text-[1.0625rem] tracking-[-0.01em]">
          Meridian&nbsp;<span className="text-accent">Concours</span>
        </a>

        <ul className="hidden items-center gap-xl md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-small text-muted transition-colors duration-[160ms] ease-out hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <motion.a href="#enquiry" className="btn btn-primary" {...(reduced ? {} : pressable)}>
              Request assessment
            </motion.a>
          </li>
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div id="mobile-nav" className="overflow-hidden border-t border-rule md:hidden" {...disclosure(reduced)}>
            <ul className="flex flex-col px-md py-md">
              {LINKS.map((l) => (
                <li key={l.href} className="border-b border-rule last:border-0">
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-sm text-body">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-md">
                <a href="#enquiry" onClick={() => setOpen(false)} className="btn btn-primary w-full justify-center">
                  Request assessment
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
