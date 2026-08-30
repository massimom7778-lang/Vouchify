import { renderOgImage } from '@/lib/og';
import { coreProduct } from '@/data/products';

export const runtime = 'nodejs';
export const alt = coreProduct.fullName;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderOgImage({ heading: coreProduct.fullName, sub: coreProduct.headline });
}
