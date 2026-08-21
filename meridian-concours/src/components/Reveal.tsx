"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { IN_VIEW, reveal, ruledRow, stagger } from "@/lib/animations";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "tr";
  variant?: "reveal" | "row";
  /** Stagger this element's direct children instead of animating itself. */
  staggerChildren?: number;
  delay?: number;
};

/** Scroll-triggered reveal. All timing comes from lib/animations.ts. */
export default function Reveal({
  children,
  className,
  as = "div",
  variant = "reveal",
  staggerChildren,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, IN_VIEW);
  const reduced = useReducedMotion() ?? false;

  const Tag = motion[as] as typeof motion.div;
  const variants =
    staggerChildren !== undefined
      ? stagger(reduced, staggerChildren, delay)
      : variant === "row"
        ? ruledRow(reduced)
        : reveal(reduced);

  return (
    <Tag
      ref={ref as never}
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </Tag>
  );
}

/** Child of a staggering Reveal — inherits the parent's orchestration. */
export function RevealItem({
  children,
  className,
  variant = "reveal",
  as = "div",
}: Omit<Props, "staggerChildren" | "delay">) {
  const reduced = useReducedMotion() ?? false;
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} variants={variant === "row" ? ruledRow(reduced) : reveal(reduced)}>
      {children}
    </Tag>
  );
}
