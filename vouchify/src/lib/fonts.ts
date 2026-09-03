import { IBM_Plex_Mono, Instrument_Sans, Public_Sans } from 'next/font/google';

/** Display. Every use of font-display site-wide is font-bold — h1–h4's own
 *  base rule in globals.css forces 700 too — so 700 is the only weight
 *  loaded. Add 500/600 back only once a real use of them ships. */
export const display = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display-face',
  weight: ['700'],
});

/** Body. The one family that genuinely needs three: 400 for ordinary body
 *  text (nothing sets a weight on it), 500 and 600 both appear on real UI
 *  copy (labels, emphasis) throughout the site. */
export const body = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body-face',
  weight: ['400', '500', '600'],
});

/** Utility. IBM Plex Mono, for eyebrow tags and small metadata only — every
 *  site-wide use of font-mono is paired with font-medium, so 500 is the only
 *  weight loaded. */
export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-face',
  weight: ['500'],
});
