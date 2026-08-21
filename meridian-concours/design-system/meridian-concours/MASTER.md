# Design System Master File — Meridian Concours

> **SINGLE SOURCE OF TRUTH.** No colour, font, spacing, radius, or duration
> may appear anywhere in the codebase that is not derived from this file.
> Tokens are emitted once in `src/app/globals.css` and consumed via Tailwind.

**Project:** Meridian Concours
**Generated:** 2026-08-21 (ui-ux-pro-max `--design-system --persist`)
**Revised:** 2026-08-21 — category-reflex rework, see below.
**Surface mode:** Persuade · **Register:** brand

---

## Revision note — why the generated palette was replaced

The generator returned *Premium dark + gold accent* with **Cormorant/Montserrat**.
That is the textbook reflex for "luxury car": a design predictable from the
product category alone, which the project's hard constraints require reworking.
Craft-floor also requires light/dark to be chosen from the **use scene**, not
the category.

Use scene: an owner or collection manager, on a desktop, in daylight, reading
deliberately before making an enquiry about an irreplaceable object. That is a
reading scene, not a showroom. The world is therefore **archival and paper-led**:
the practice's real artefact is the condition record, so the page is built from
documents, rules, and measurements rather than from gold on black.

Accent is **red-oxide primer** (`#7A2E22`) — what a bare shell wears mid-restoration.
Specific to the practice, not to the category.

---

## Global Rules

### Colour Palette

| Role | Hex | CSS Variable | Notes |
|------|-----|--------------|-------|
| Background | `#F2EFE9` | `--color-background` | Warm paper ground |
| Surface | `#FBFAF7` | `--color-surface` | Raised leaf / card |
| Sunken | `#E7E2D7` | `--color-sunken` | Recessed wells, table zebra |
| Foreground | `#14120F` | `--color-foreground` | Ink |
| Muted Foreground | `#5C564C` | `--color-muted-foreground` | 6.3:1 on background |
| Border | `#D8D2C5` | `--color-border` | Hairline rules |
| Border Strong | `#B9B1A0` | `--color-border-strong` | Table + section rules |
| Accent | `#7A2E22` | `--color-accent` | Red-oxide primer, 8.2:1 on bg |
| On Accent | `#FBFAF7` | `--color-on-accent` | 9.4:1 on accent |
| Ink Inverse | `#0E0D0B` | `--color-ink-inverse` | Full-bleed plate ground |
| On Inverse | `#EFEAE0` | `--color-on-inverse` | Text on plate |
| Ring | `#7A2E22` | `--color-ring` | Focus ring, 2px + 2px offset |
| Accent (inverse) | `#C9705C` | `--color-accent-inverse` | Accent on dark grounds, 5.5:1 on ink |

**Contrast verified:** foreground/bg 16.9:1 · muted/bg 6.3:1 · accent/bg 8.2:1 ·
on-accent/accent 9.4:1 · on-inverse/ink-inverse 13.1:1. All exceed WCAG AA.

**Banned:** gold, black-and-gold pairings, gradient text, glassmorphism,
coloured `border-left` above 1px, any colour not in this table.

### Typography

- **Display:** `Newsreader` — editorial serif, optical sizing. Weights 300/400/500.
  Chosen over Cormorant: sturdier, reads as record/registry rather than fashion.
- **Body & UI:** `Archivo` — grotesque with real character at text sizes.
  Weights 400/500/600.
- **Numerals:** `Archivo` with `font-variant-numeric: tabular-nums` wherever
  measurements or dates align in columns. Required — never default figures in tables.
- **Banned:** Inter, Roboto, Arial, Helvetica, any system display face, monospace
  used decoratively (permitted only for genuine measurement readouts).

| Token | Size / Line | Tracking | Use |
|-------|-------------|----------|-----|
| `--type-display` | `clamp(2.75rem, 7vw, 5.5rem)` / 0.95 | `-0.035em` | Plate headline (max 6rem) |
| `--type-h1` | `clamp(2rem, 4.5vw, 3.25rem)` / 1.05 | `-0.02em` | Section openers |
| `--type-h2` | `clamp(1.5rem, 2.5vw, 2rem)` / 1.15 | `-0.015em` | Stage titles |
| `--type-h3` | `1.125rem` / 1.3 | `-0.01em` | Row headings |
| `--type-body` | `1.0625rem` / 1.65 | `0` | Prose, min 16px |
| `--type-small` | `0.9375rem` / 1.5 | `0` | Secondary prose |
| `--type-label` | `0.75rem` / 1.2 | `0.08em` | Table headers, uppercase |

**Measure:** prose columns clamp to `65ch`. Never full-width body text.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2xs` | `0.25rem` | Icon gaps |
| `--space-xs` | `0.5rem` | Inline |
| `--space-sm` | `0.75rem` | Control padding |
| `--space-md` | `1rem` | Standard |
| `--space-lg` | `1.5rem` | Row rhythm |
| `--space-xl` | `2.5rem` | Block separation |
| `--space-2xl` | `4rem` | Sub-section |
| `--space-3xl` | `7rem` | Section separation |
| `--space-4xl` | `10rem` | Plate breathing |

**Rule:** more space above a heading than below it. Always.

### Radius & Depth

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `2px` | Controls. Near-square — paper, not app chrome |
| `--radius-md` | `3px` | Panels |
| `--shadow-raise` | `0 1px 2px rgba(20,18,15,.06), 0 8px 24px -12px rgba(20,18,15,.18)` | Offset + soft blur |
| `--shadow-plate` | `0 24px 64px -32px rgba(20,18,15,.45)` | Full-bleed imagery |

**Banned:** zero-offset halos, hard offset shadows, radii above 4px.

### Bay Scene (hero illustration only)

The hero is an authored vector illustration of a track-spec car in a detailing
bay — not a photograph and not a geometric mask standing in for one. The shell
is painted in the page's own paper token so the illustration belongs to the
palette rather than sitting on top of it.

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Bay floor | `#0A0A0B` | `--color-bay-floor` |
| Bay wall | `#16140F` | `--color-bay-wall` |
| Car shell | `#E9E3D7` | `--color-car-shell` |
| Car shade | `#B9B0A0` | `--color-car-shade` |
| Glass | `#1C1A16` | `--color-car-glass` |
| Tyre | `#100F0E` | `--color-tyre` |
| Rim | `#9A9285` | `--color-rim` |
| Overhead light | `#FFF6E4` | `--color-light` |

No marque, model name, or badge appears in the illustration or the copy. The
silhouette is generic track-spec; naming a real model on a fictional business
would imply an endorsement that does not exist.

### Motion

All motion via Framer Motion, variants centralised in `src/lib/animations.ts`.
Every animation must respect `prefers-reduced-motion`.

| Token | Value |
|-------|-------|
| `--dur-fast` | `160ms` |
| `--dur-base` | `240ms` |
| `--dur-slow` | `450ms` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

**Default enter recipe** (spring, no bounce):
`initial { opacity: 0, translateY: 8, filter: blur(4px) }` →
`animate { opacity: 1, translateY: 0, filter: blur(0px) }`,
`transition { type: "spring", duration: 0.45, bounce: 0 }`.

**Authored moment:** the intake measurement figures count up once on entry.
That is the page's single signature motion; every other reveal is the quiet
default recipe. No section may carry a louder entrance than the plate.

### Browser Surfaces (required — not optional polish)

Selection, caret, scrollbar, focus ring, and underline offset are themed from
this palette in `globals.css`. Shipping browser defaults is a defect.

---

## Component Specs

### Buttons

```css
.btn-primary  { background: var(--color-accent); color: var(--color-on-accent);
                padding: .8125rem 1.5rem; border-radius: var(--radius-sm);
                font-weight: 500; letter-spacing: .01em; }
.btn-primary:hover  { background: #66251C; }        /* accent, darkened */
.btn-secondary{ background: transparent; color: var(--color-foreground);
                border: 1px solid var(--color-border-strong); }
```
Focus: `outline: 2px solid var(--color-ring); outline-offset: 2px`.
All clickable elements carry `cursor: pointer`.

### Structural rule

Services are **stages of one car's record**, rendered as ruled rows — never a
grid of equal icon-heading-text cards. Cards are not the page structure.
No eyebrow/kicker labels above headings, anywhere.

---

## Pre-Delivery Checklist

- [ ] No colour or font outside this file
- [ ] Contrast ≥4.5:1 body, ≥3:1 large
- [ ] Visible keyboard focus on every interactive element
- [ ] `prefers-reduced-motion` honoured on every animation
- [ ] Tabular numerals in every measurement column
- [ ] Browser surfaces themed
- [ ] Responsive at 375 / 768 / 1024 / 1440
- [ ] All images `next/image` with `alt` + `sizes`
- [ ] No emoji or unicode glyphs as icons — drawn SVG only
