import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AddToCartButton } from '@/components/AddToCartButton';
import { JsonLd } from '@/components/JsonLd';
import {
  ButtonLink,
  Eyebrow,
  Grid,
  PhotoBlock,
  Price,
  Section,
} from '@/components/ui';
import { addOnPages, coreProduct, getAddOnBySlug } from '@/data/products';
import { site } from '@/data/site';
import { priceForSchema } from '@/lib/format';

export function generateStaticParams() {
  return addOnPages.map((addOn) => ({ slug: addOn.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const addOn = getAddOnBySlug(slug);
  if (!addOn) return {};
  return {
    title: addOn.name,
    description: addOn.summary,
    alternates: { canonical: `/products/${addOn.slug}` },
    openGraph: {
      type: 'website',
      title: `${addOn.name}, ${site.name}`,
      description: addOn.summary,
      url: `/products/${addOn.slug}`,
    },
  };
}

export default async function AddOnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const addOn = getAddOnBySlug(slug);
  if (!addOn || !addOn.hasPage) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: addOn.name,
    description: addOn.summary,
    sku: addOn.id,
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      price: priceForSchema(addOn.priceCents),
      priceCurrency: site.currency,
      availability: 'https://schema.org/InStock',
      url: `${site.url}/products/${addOn.slug}`,
    },
  };

  const others = addOnPages.filter((item) => item.id !== addOn.id);

  return (
    <main id="main">
      <JsonLd data={schema} />

      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-6">
            <PhotoBlock photo={addOn.photo} vignette />

            {/* The rest of the shots, in the same two-up grid the stand's page
                uses. A wide frame takes the full column rather than being
                squeezed into half of it. */}
            {addOn.gallery?.length ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {addOn.gallery.map((shot) => (
                  <PhotoBlock
                    key={shot.id}
                    photo={shot}
                    className={
                      shot.aspect === 'wide' ? 'col-span-2 sm:col-span-3' : undefined
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <Eyebrow>Add-on</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl">{addOn.name}</h1>
            <p className="mt-5 text-base text-warm-700">{addOn.summary}</p>

            <div className="mt-8 flex items-baseline gap-4 border-y border-warm-300 py-5">
              <Price cents={addOn.priceCents} size="xl" />
              <span className="text-sm text-warm-600">
                {addOn.perOrder ? 'Once per order' : 'Ships with your stands'}
              </span>
            </div>

            <div className="mt-6">
              <AddToCartButton sku={addOn.id} block>
                Add to cart
              </AddToCartButton>
              <p className="mt-3 text-xs text-warm-600">
                Works best alongside the stands.{' '}
                <Link
                  href={`/products/${coreProduct.slug}`}
                  className="font-semibold text-gold-deep underline underline-offset-4"
                >
                  See The Stand
                </Link>
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {addOn.details.map((detail) => (
                <li key={detail} className="border-b border-warm-300 pb-3 text-sm text-warm-700">
                  {detail}
                </li>
              ))}
            </ul>

            <dl className="mt-6 grid grid-cols-2 gap-x-6">
              {addOn.specs.map((spec) => (
                <div key={spec.label} className="border-b border-warm-300 py-3">
                  <dt className="text-2xs font-semibold uppercase tracking-wide text-warm-600">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-sm">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Grid>
      </Section>

      <Section tone="warm" bordered rhythm="tight">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow>Also</Eyebrow>
            <h2 className="mt-3 text-xl md:text-xl">The rest of the range</h2>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-8 md:col-start-5">
            {others.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="rounded-md border border-warm-300 bg-paper p-4 hover:border-ink"
              >
                <PhotoBlock photo={item.photo} className="mb-4" />
                <p className="font-display text-lg font-bold tracking-tight">{item.name}</p>
                <p className="mt-1 text-xs text-warm-600">{item.shortLine}</p>
                <p className="mt-3">
                  <Price cents={item.priceCents} size="sm" display={false} />
                </p>
              </Link>
            ))}
            <Link
              href={`/products/${coreProduct.slug}`}
              className="flex flex-col justify-between rounded-md border border-ink bg-ink p-4 text-paper hover:bg-warm-900"
            >
              <div>
                <p className="font-display text-lg font-bold tracking-tight">The Stand</p>
                <p className="mt-1 text-xs text-warm-400">
                  The one that sits on the counter. From $39.
                </p>
              </div>
              <span className="mt-6 text-sm font-semibold text-gold">Choose a bundle</span>
            </Link>
          </div>
        </Grid>
      </Section>

      <Section tone="ink" rhythm="tight" bordered>
        <Grid className="items-center gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <h2 className="text-xl md:text-2xl">One link across everything you order.</h2>
            <p className="mt-3 max-w-prose text-base text-warm-300">
              Stands and plates all point at the same review page, so changing it
              later is one change, not five.
            </p>
          </div>
          <div className="col-span-4 md:col-span-4 md:col-start-9 md:justify-self-end">
            <ButtonLink href="/how-it-works" variant="onDark" size="lg">
              How it works
            </ButtonLink>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
