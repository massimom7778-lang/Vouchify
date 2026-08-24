import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink, Eyebrow, Grid, PhotoBlock, Reveal, Section } from '@/components/ui';
import { coreProduct } from '@/data/products';
import { setupSteps } from '@/data/steps';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'What happens when a customer taps: NFC, the QR fallback, which phones read it, and why the stand needs no power, wifi or app.',
  alternates: { canonical: '/how-it-works' },
};

const compatibility = [
  {
    device: 'iPhone XS and newer',
    behaviour: 'Taps automatically',
    detail: 'Hold the top edge of the phone near the stand. The link appears as a banner; tap it.',
  },
  {
    device: 'iPhone 7 – iPhone X',
    behaviour: 'Taps once awake',
    detail: 'Wake and unlock the phone first, then hold the top edge against the stand.',
  },
  {
    device: 'iPhone 6s and older',
    behaviour: 'Uses the QR code',
    detail: 'No NFC reading for tags. Point the camera at the QR code on the face instead.',
  },
  {
    device: 'Android, 2015 onward',
    behaviour: 'Taps automatically',
    detail: 'Hold the middle of the back of the phone against the stand. NFC is on by default.',
  },
  {
    device: 'Android without NFC',
    behaviour: 'Uses the QR code',
    detail: 'Some budget models ship without an NFC antenna. The camera reads the QR code.',
  },
];

export default function HowItWorksPage() {
  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>How it works</Eyebrow>
            <h1 className="mt-4 text-2xl md:text-3xl lg:text-4xl">
              A phone touches
              <br />
              a piece of acrylic.
            </h1>
          </div>
          <div className="col-span-4 self-end md:col-span-4 md:col-start-9">
            <p className="text-base text-warm-700">
              There is no clever part. A chip inside the stand holds a web address. A phone held
              against it reads that address and opens it. Everything else on this page is detail.
            </p>
          </div>
        </Grid>
      </Section>

      <Section rhythm="tight">
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <PhotoBlock photo={coreProduct.photos.inHand} vignette />
          </div>
          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <h2 className="text-xl md:text-2xl">Setup, start to finish</h2>
            <ol className="mt-6">
              {setupSteps.map((step) => (
                <Reveal
                  as="li"
                  key={step.n}
                  delay={step.n * 60}
                  className="flex gap-5 border-b border-warm-300 py-6 first:border-t"
                >
                  <span
                    data-numeric
                    className="font-display text-2xl font-extrabold leading-none tracking-tight text-signal-deep"
                  >
                    {step.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-bold tracking-tight">
                      {step.title}
                    </span>
                    <span className="mt-2 block text-base text-warm-700">{step.body}</span>
                    <span className="mt-2 block text-sm text-warm-600">{step.detail}</span>
                  </span>
                </Reveal>
              ))}
            </ol>
          </div>
        </Grid>
      </Section>

      <Section tone="ink" bordered>
        <Grid className="gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow tone="onDark">NFC and QR</Eyebrow>
            <h2 className="mt-4 text-2xl md:text-3xl">Two ways in, one link.</h2>
            <p className="mt-5 text-base text-warm-300">
              Every stand carries both. The NFC chip is the fast path — no camera, no aiming, no
              app. The QR code on the face is the fallback for phones that will not read a tag, and
              for the customer standing a metre away.
            </p>
            <p className="mt-4 text-base text-warm-300">
              Both point at the same TapRate address, which forwards to your review page. That is
              why changing the link later is free: the chip and the printed code never have to
              change.
            </p>
          </div>
          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <dl className="divide-y divide-warm-800 border-y border-warm-800">
              {[
                ['Power', 'None. The chip runs on the field the phone puts out.'],
                ['Wifi', 'Not needed by the stand. The customer’s phone loads the page.'],
                ['App', 'None, on either side of the counter.'],
                ['Range', 'About a centimetre. It will not fire from a pocket.'],
                ['Read time', 'Under a second, and it can be read repeatedly.'],
                ['Customer data', 'A tap count per stand. Nothing that identifies anyone.'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap gap-x-6 gap-y-1 py-4">
                  <dt className="w-32 shrink-0 text-2xs font-semibold uppercase tracking-wide text-warm-400">
                    {label}
                  </dt>
                  <dd className="flex-1 text-sm text-warm-300">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Grid>
      </Section>

      <Section bordered>
        <Grid className="gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow>Compatibility</Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl">Which phones read it.</h2>
            <p className="mt-5 text-sm text-warm-700">
              In a normal week almost every customer taps. The QR code is there so the rest are not
              a dead end.
            </p>
          </div>
          <div className="col-span-4 md:col-span-8 md:col-start-5">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Phone compatibility</caption>
              <thead>
                <tr className="border-y border-warm-300">
                  <th scope="col" className="py-3 pr-4 text-2xs font-semibold uppercase tracking-wide text-warm-600">
                    Phone
                  </th>
                  <th scope="col" className="py-3 pr-4 text-2xs font-semibold uppercase tracking-wide text-warm-600">
                    Behaviour
                  </th>
                  <th scope="col" className="hidden py-3 text-2xs font-semibold uppercase tracking-wide text-warm-600 sm:table-cell">
                    What the customer does
                  </th>
                </tr>
              </thead>
              <tbody>
                {compatibility.map((row) => (
                  <tr key={row.device} className="border-b border-warm-300">
                    <th scope="row" className="py-4 pr-4 align-top text-sm font-semibold">
                      {row.device}
                    </th>
                    <td className="py-4 pr-4 align-top text-sm text-warm-700">{row.behaviour}</td>
                    <td className="hidden py-4 align-top text-sm text-warm-700 sm:table-cell">
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-warm-600 sm:hidden">
              On a phone without NFC, the customer points the camera at the QR code on the face of
              the stand.
            </p>
          </div>
        </Grid>
      </Section>

      <Section tone="warm" bordered rhythm="tight">
        <Grid className="items-center gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <h2 className="text-xl md:text-2xl">Where we stand on review policy</h2>
            <p className="mt-4 max-w-prose text-base text-warm-700">
              Asking every customer is fine. Offering something in return for a review, or screening
              so only happy customers get asked, is not — and we do not build either. The stand opens
              your public review page for everyone who taps it.{' '}
              <Link href="/faq#google-policy" className="font-semibold text-signal-deep underline underline-offset-4">
                The longer answer is in the FAQ
              </Link>
              .
            </p>
          </div>
          <div className="col-span-4 md:col-span-4 md:col-start-9 md:justify-self-end">
            <ButtonLink href={`/products/${coreProduct.slug}`} size="lg">
              Choose your bundle
            </ButtonLink>
          </div>
        </Grid>
      </Section>
    </main>
  );
}
