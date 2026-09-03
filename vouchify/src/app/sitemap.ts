import type { MetadataRoute } from 'next';
import { execSync } from 'node:child_process';
import { addOnPages, coreProduct, plateProduct } from '@/data/products';
import { legalPages } from '@/data/legal';
import { site } from '@/data/site';

/**
 * The real last-commit date for a source file, computed once at build time
 * (this route has nothing dynamic in it, so Next prerenders it statically).
 * Every URL sharing `new Date()` told Google that all ten pages changed on
 * every redeploy, whether or not their content actually had.
 *
 * Falls back to now if git history is unavailable for some reason — a
 * shallow checkout, no git binary in the build image — so a missing commit
 * degrades that one route back to today's previous behaviour rather than
 * failing the whole sitemap.
 */
function lastModified(filePath: string): Date {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    return iso ? new Date(iso) : new Date();
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '');

  const routes: {
    path: string;
    /** Repo-relative path to the file whose content actually drives this
     *  route, for lastModified — not necessarily the route file itself: the
     *  legal pages all share one template, so their date comes from the copy
     *  in data/legal.ts instead. */
    file: string;
    priority: number;
    changeFrequency: 'weekly' | 'monthly' | 'yearly';
  }[] = [
    { path: '/', file: 'src/app/page.tsx', priority: 1, changeFrequency: 'weekly' },
    {
      path: `/products/${coreProduct.slug}`,
      file: 'src/app/products/nfc-review-stand/page.tsx',
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      path: `/products/${plateProduct.slug}`,
      file: 'src/app/products/review-plate/page.tsx',
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    { path: '/bundles', file: 'src/app/bundles/page.tsx', priority: 0.8, changeFrequency: 'monthly' },
    {
      path: '/how-it-works',
      file: 'src/app/how-it-works/page.tsx',
      priority: 0.7,
      changeFrequency: 'monthly',
    },
    { path: '/faq', file: 'src/app/faq/page.tsx', priority: 0.7, changeFrequency: 'monthly' },
    {
      path: '/multi-location',
      file: 'src/app/multi-location/page.tsx',
      priority: 0.6,
      changeFrequency: 'monthly',
    },
    ...addOnPages.map((addOn) => ({
      path: `/products/${addOn.slug}`,
      file: 'src/app/products/[slug]/page.tsx',
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    })),
    ...legalPages.map((page) => ({
      path: `/legal/${page.slug}`,
      file: 'src/data/legal.ts',
      priority: 0.2,
      changeFrequency: 'yearly' as const,
    })),
  ];

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: lastModified(route.file),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
