import { renderOgImage } from '@/lib/og';
import { site } from '@/data/site';

export const runtime = 'nodejs';
export const alt = `${site.name}, ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({ heading: 'Ask for the review. Or don’t.', sub: site.tagline });
}
