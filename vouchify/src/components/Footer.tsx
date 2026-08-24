import Link from 'next/link';
import { Container } from '@/components/ui';
import { Wordmark } from '@/components/Wordmark';
import { footerNav, googleDisclaimer, site } from '@/data/site';

export function Footer() {
  return (
    <footer className="border-t border-warm-800 bg-ink text-paper">
      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-4 gap-x-6 gap-y-10 md:grid-cols-12">
          <div className="col-span-4 md:col-span-4">
            <Wordmark descriptor size="lg" />
            <p className="mt-4 max-w-[28ch] text-sm text-warm-300">{site.tagline}</p>
            <a
              href={`mailto:${site.supportEmail}`}
              className="mt-5 inline-block text-sm font-semibold underline decoration-warm-500 underline-offset-4 hover:decoration-gold"
            >
              {site.supportEmail}
            </a>
          </div>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="col-span-2 md:col-span-2 md:col-start-auto">
              <h2 className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-400">
                {group.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-warm-300 hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-4 md:col-span-3 md:col-start-10">
            <h2 className="font-sans text-2xs font-semibold uppercase tracking-wide text-warm-400">
              Multi-location
            </h2>
            <p className="mt-4 text-sm text-warm-300">
              Ten stands or more, or more than one address? We price the whole group and program each
              location to its own review page.
            </p>
            <Link
              href="/multi-location"
              className="mt-4 inline-block text-sm font-semibold text-gold underline decoration-warm-700 underline-offset-4 hover:decoration-gold"
            >
              Get a quote
            </Link>
          </div>
        </div>
      </Container>

      <div className="border-t border-warm-800">
        <Container className="flex flex-col gap-3 py-6 text-2xs text-warm-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalEntity}
          </p>
          <p className="max-w-[70ch]">{googleDisclaimer}</p>
        </Container>
      </div>
    </footer>
  );
}
