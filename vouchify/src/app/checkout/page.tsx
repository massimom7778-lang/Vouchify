import type { Metadata } from 'next';
import { CheckoutForm } from './CheckoutForm';
import { Eyebrow, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;

  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Eyebrow>Checkout</Eyebrow>
        <h1 className="mt-4 text-2xl md:text-3xl">Check it over, then pay.</h1>

        {/* Stripe's cancel_url lands here. Coming back from a payment page you
            chose to leave is not an error, and nothing was charged — say so
            plainly rather than leaving people wondering. */}
        {cancelled ? (
          <p
            role="status"
            className="mt-6 max-w-prose rounded-md border border-warm-400 bg-warm-100 px-4 py-3 text-sm text-warm-700"
          >
            <span className="font-semibold text-ink">Nothing was charged.</span> You came back from
            the payment page before finishing. Your order is exactly as you left it — pay whenever
            you are ready.
          </p>
        ) : null}

        <div className="mt-10">
          <CheckoutForm />
        </div>
      </Section>
    </main>
  );
}
