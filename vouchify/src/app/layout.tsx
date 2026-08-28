import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { body, display, mono } from '@/lib/fonts';
import { site } from '@/data/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name}, ${site.tagline}`,
    description: site.description,
    locale: 'en_CA',
  },
  robots: { index: true, follow: true },
};

/**
 * viewportFit: 'cover' lets the page paint into the notch and home-indicator
 * areas, which is what makes env(safe-area-inset-*) return real values. The
 * sticky buy bar and the cart drawer both depend on it.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Matches --color-paper / --color-ink in globals.css exactly — any drift
  // here shows as a seam of the wrong colour under mobile Safari's address bar.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#15151A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        {/* Vercel Analytics. Cookieless and first-party, which is why there is
            no consent banner: nothing is stored on the visitor's device and no
            third-party script is loaded. It renders nothing, so it cannot
            affect layout, and it is a client component inside a server layout,
            so the static routes stay static. */}
        <Analytics />
      </body>
    </html>
  );
}
