import { IBM_Plex_Mono, Instrument_Sans, Public_Sans } from 'next/font/google';

/** Display. Instrument Sans at 700, set tight. */
export const display = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display-face',
  weight: ['500', '600', '700'],
});

/** Body. Public Sans, 400 and 500. */
export const body = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body-face',
  weight: ['400', '500', '600'],
});

/** Utility. IBM Plex Mono, for eyebrow tags and small metadata only. */
export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-face',
  weight: ['400', '500'],
});
