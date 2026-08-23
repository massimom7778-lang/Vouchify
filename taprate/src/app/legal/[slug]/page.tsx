import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow, Grid, Section } from '@/components/ui';
import { getLegalPage, legalPages } from '@/data/legal';
import { googleDisclaimer, site } from '@/data/site';

export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.summary,
    alternates: { canonical: `/legal/${page.slug}` },
  };
}

export default async function LegalPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();

  const updated = new Date(page.updated).toLocaleDateString(site.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>Policies</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl">{page.title}</h1>
            <p className="mt-4 text-base text-warm-700">{page.summary}</p>
            <p className="mt-6 text-2xs uppercase tracking-wide text-warm-600">
              Last updated {updated}
            </p>

            <nav aria-label="Policies" className="mt-8 border-t border-warm-300">
              <ul>
                {legalPages.map((other) => (
                  <li key={other.slug} className="border-b border-warm-300">
                    <Link
                      href={`/legal/${other.slug}`}
                      aria-current={other.slug === page.slug ? 'page' : undefined}
                      className={
                        other.slug === page.slug
                          ? 'block py-3 text-sm font-semibold text-ink'
                          : 'block py-3 text-sm text-warm-700 hover:text-signal-deep'
                      }
                    >
                      {other.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-span-4 md:col-span-7 md:col-start-6">
            {page.sections.map((section) => (
              <section key={section.heading} className="border-b border-warm-300 py-8 first:pt-0">
                <h2 className="text-xl">{section.heading}</h2>
                <div className="mt-4 max-w-prose space-y-4 text-base text-warm-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <p className="mt-8 max-w-prose text-xs text-warm-600">{googleDisclaimer}</p>
            <p className="mt-3 max-w-prose text-xs text-warm-600">
              Questions about any of this go to{' '}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-semibold text-signal-deep underline underline-offset-4"
              >
                {site.supportEmail}
              </a>
              .
            </p>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
