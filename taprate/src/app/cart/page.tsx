import type { Metadata } from 'next';
import { CartContents } from './CartContents';
import { Eyebrow, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <main id="main">
      <Section rhythm="tight" className="pt-10 md:pt-16">
        <Eyebrow>Cart</Eyebrow>
        <h1 className="mt-4 text-2xl md:text-3xl">Your order</h1>
        <div className="mt-10">
          <CartContents />
        </div>
      </Section>
    </main>
  );
}
