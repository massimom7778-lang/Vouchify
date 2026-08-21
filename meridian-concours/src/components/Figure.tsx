"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * The page's single authored motion: intake readings count up once on entry.
 * Everything else uses the quiet default reveal.
 */
export default function Figure({
  value,
  decimals = 0,
  suffix = "",
  delay = 0,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion() ?? false;
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [inView, reduced, value, delay]);

  return (
    <span ref={ref} className="tnum">
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
