import type { Transition, Variants } from "framer-motion";

/**
 * Every motion variant on the site lives here.
 * Durations/easing derive from design-system/meridian-concours/MASTER.md.
 *
 * Reduced motion: components read `useReducedMotion()` and pass the result to
 * these factories, which then return opacity-only (or static) variants. The
 * global CSS in globals.css collapses transition/animation durations as a
 * second line of defence.
 */

/** Default enter recipe — spring, no bounce. */
export const ENTER: Transition = { type: "spring", duration: 0.45, bounce: 0 };

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** The quiet default reveal used by nearly every block. */
export function reveal(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.001 } },
    };
  }
  return {
    hidden: { opacity: 0, translateY: 8, filter: "blur(4px)" },
    visible: { opacity: 1, translateY: 0, filter: "blur(0px)", transition: ENTER },
  };
}

/** Parent that staggers its children. Hero and ruled lists use this. */
export function stagger(reduced: boolean, gap = 0.07, delay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: reduced
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: gap, delayChildren: delay },
    },
  };
}

/** Ruled rows slide in from the rule rather than lifting. */
export function ruledRow(reduced: boolean): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.001 } } };
  }
  return {
    hidden: { opacity: 0, translateX: -10, filter: "blur(3px)" },
    visible: { opacity: 1, translateX: 0, filter: "blur(0px)", transition: ENTER },
  };
}

/** Accordion open/close — height auto, driven by AnimatePresence. */
export function disclosure(reduced: boolean) {
  return {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: "auto",
      opacity: 1,
      transition: reduced
        ? { duration: 0.001 }
        : { height: { duration: 0.32, ease: EASE_OUT }, opacity: { duration: 0.22, delay: 0.04 } },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: reduced
        ? { duration: 0.001 }
        : { height: { duration: 0.24, ease: EASE_OUT }, opacity: { duration: 0.14 } },
    },
  };
}

/** Micro-interaction presets for buttons and interactive rows. */
export const pressable = {
  whileHover: { translateY: -1 },
  whileTap: { translateY: 0, scale: 0.99 },
  transition: { type: "spring" as const, duration: 0.25, bounce: 0 },
};

/** Shared viewport config so reveals fire consistently and only once. */
export const IN_VIEW = { once: true, margin: "-12% 0px -12% 0px" } as const;
