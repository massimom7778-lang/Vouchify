import { Bricolage_Grotesque, Inter } from 'next/font/google';

/** Display. Variable optical-size axis, used heavy (600–800) and tight. */
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
  weight: ['600', '700', '800'],
});

/** Body. 16–17px, 1.6 line height, tabular numerals wherever a price appears. */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});
