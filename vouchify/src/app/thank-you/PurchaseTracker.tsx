'use client';

import { useEffect } from 'react';
import { EVENTS, dollars, emit, onceForKey } from '@/lib/analytics';
import { useCart } from '@/lib/cart';
import { postPurchaseUpsell } from '@/data/products';
import type { StandTierId } from '@/data/products';

/**
 * Renders nothing. It exists because /thank-you is a server component and the
 * purchase event has to be sent from the browser.
 *
 * Everything it sends is read on the server from the Stripe session and passed
 * down as plain numbers, so the client never has to be trusted with the order
 * value, and no session id leaves the page — the id is used only to key the
 * fire-once guard in localStorage, and never as an event property.
 */
export function PurchaseTracker({
  sessionId,
  valueCents,
  standCount,
  tierId,
  upsellReturned,
}: {
  sessionId: string;
  valueCents: number;
  standCount: number;
  tierId: StandTierId | 'none';
  /** True when Stripe sent the customer back from the upsell's 3-D Secure page. */
  upsellReturned: boolean;
}) {
  useEffect(() => {
    if (onceForKey(`purchase:${sessionId}`)) {
      emit(EVENTS.purchase, {
        value: dollars(valueCents),
        standCount,
        tierId,
      });
      // The customer just paid for everything currently in the cart. Left in
      // place, those lines show "Cart 3" in the header on this very page and
      // prime every product CTA to re-add what was just bought. The review
      // link is kept — it is the customer's own value, not part of the order
      // that just closed.
      useCart.getState().clear();
    }

    // The upsell's card-authentication fallback leaves the page for Stripe and
    // comes back here, so UpsellOffer never sees the outcome. Counting it here
    // is what stops that path looking like a rejected offer.
    if (upsellReturned && onceForKey(`upsell:${sessionId}`)) {
      emit(EVENTS.upsellAccepted, {
        tierId: postPurchaseUpsell.tierId,
        value: dollars(postPurchaseUpsell.priceCents),
      });
    }
  }, [sessionId, valueCents, standCount, tierId, upsellReturned]);

  return null;
}
