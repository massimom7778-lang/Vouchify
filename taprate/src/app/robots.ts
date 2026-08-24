import type { MetadataRoute } from 'next';
import { site } from '@/data/site';

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nothing here is secret; these pages are just noise in an index.
      disallow: [
        '/cart',
        '/checkout',
        '/thank-you',
        '/styleguide',
        '/api/',
        // The forwarder and the dashboard are for people holding a phone or a
        // card, not for crawlers. /r/ especially: a crawler following every
        // stand link is pure noise.
        '/r/',
        '/dashboard/',
        '/stand/',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
