/**
 * Authored icon set — single 1.5px stroke, 24px grid, square caps.
 * No emoji, no unicode glyphs, no third-party icon font.
 */
type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
};

export const Caliper = ({ className }: P) => (
  <svg {...base} className={className}><path d="M3 4v16M21 4v16M3 12h18M7 9l-3 3 3 3M17 9l3 3-3 3" /></svg>
);

export const Plus = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);

export const Arrow = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);

export const Stamp = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 20h16M7 17h10V9a3 3 0 0 0-3-3h-.5V3h-3v3H10a3 3 0 0 0-3 3v8Z" /></svg>
);

export const Lamp = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 3v3M5 9l7-3 7 3-3 5H8L5 9ZM12 14v7M9 21h6" /></svg>
);

export const Vault = ({ className }: P) => (
  <svg {...base} className={className}><path d="M3 4h18v16H3zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 8V6M12 18v-2M16 12h2M6 12h2" /></svg>
);
