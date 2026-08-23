import type { Metadata } from 'next';
import { CheckoutForm } from './CheckoutForm';
import { Eyebrow, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Eyebrow>Checkout</Eyebrow>
        <h1 className="mt-4 text-2xl md:text-3xl">Check it over, then pay.</h1>
        <div className="mt-10">
          <CheckoutForm />
        </div>
      </Section>
    </main>
  );
}
