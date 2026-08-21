import type { Metadata } from "next";
import { Newsreader, Archivo } from "next/font/google";
import "./globals.css";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: false,
});

const sans = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Meridian Concours — Custodianship for exotic and collector cars",
  description:
    "An appointment-only care practice for exotic and collector cars. Paint correction, concours preparation, and ongoing custodianship, documented car by car.",
};

/**
 * Direction contract. Emitted as a real HTML comment so it survives the
 * production build and can be audited with grep. Do not remove.
 */
const CONTRACT = `<!--
IMPECCABLE DIRECTION CONTRACT

THESIS: This practice sells judgement, not shine. The page is one car's condition
record, so the argument is the documentation itself. It refuses the services
card-grid and the black-and-gold luxury-car reflex.

OWN-WORLD: Warm paper ground (#F2EFE9), ink (#14120F), red-oxide primer accent
(#7A2E22) — what a bare shell wears mid-restoration. Newsreader over Archivo.
Hairline rules, near-square 2px radii, tabular figures. Documents, not chrome.

STORY: An owner deliberating over an irreplaceable car sees a real record kept
with restraint, believes this shop removes less and documents more, and requests
an assessment.

FIRST VIEWPORT: Full-bleed dark intake plate. Headline left at display scale,
intake stamp right, four measured readings on a rule across the base. Primary
action sits inline under the headline.

FORM: The Dossier — index 3 of 7, dealt lead. Seed key 28a8fffe (degraded roll,
no challengers: roll service unreachable).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${display.variable} ${sans.variable}`}>
      <body>
        <noscript>
          {/* Without JS the reveal variants never run; force the initial
              styles Framer Motion server-renders back to visible. */}
          <style
            dangerouslySetInnerHTML={{
              __html:
                '[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;filter:none!important;transform:none!important}',
            }}
          />
        </noscript>
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md focus:z-50 focus:bg-accent focus:px-md focus:py-sm focus:text-on-accent"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
