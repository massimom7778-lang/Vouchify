import type { MetadataRoute } from 'next';
import { addOnPages, coreProduct } from '@/data/products';
import { legalPages } from '@/data/legal';
import { site } from '@/data/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '');
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: `/products/${coreProduct.slug}`, priority: 0.9, changeFrequency: 'weekly' },
    { path: '/bundles', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/how-it-works', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/multi-location', priority: 0.6, changeFrequency: 'monthly' },
    ...addOnPages.map((addOn) => ({
      path: `/products/${addOn.slug}`,
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    })),
    ...legalPages.map((page) => ({
      path: `/legal/${page.slug}`,
      priority: 0.2,
      changeFrequency: 'yearly' as const,
    })),
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
