import { ButtonLink, Container, Eyebrow } from '@/components/ui';
import { site } from '@/data/site';

/**
 * Placeholder. The real homepage is build step 5 — it lands after the PDP,
 * which is where the tier engine lives.
 */
export default function HomePage() {
  return (
    <main id="main" className="flex min-h-dvh items-center bg-ink text-paper">
      <Container>
        <Eyebrow tone="onDark">{site.name} — in build</Eyebrow>
        <h1 className="mt-5 max-w-[16ch] text-2xl md:text-3xl lg:text-4xl">
          Tap. Review. Done.
        </h1>
        <p className="mt-6 max-w-prose text-lg text-warm-300">
          The storefront is being built in the order set out in the brief. Steps 1 and 2 — theme
          tokens, catalog, and primitives — are ready to review.
        </p>
        <div className="mt-8">
          <ButtonLink href="/styleguide" size="lg">
            Theme tokens and primitives
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
