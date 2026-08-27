import { z } from 'zod';
import { addOns, plateTiers, standTiers } from '@/data/products';

const standTierIds = standTiers.map((tier) => tier.id) as [string, ...string[]];
const plateTierIds = plateTiers.map((tier) => tier.id) as [string, ...string[]];
const addOnIds = addOns.map((addOn) => addOn.id) as [string, ...string[]];
const skuIds = [...standTierIds, ...plateTierIds, ...addOnIds] as [string, ...string[]];

/**
 * The client sends what was chosen. It never sends a price — every amount is
 * looked up server-side from the catalog before it reaches Stripe.
 */
export const cartLineSchema = z.object({
  sku: z.enum(skuIds),
  qty: z.number().int().min(1).max(99),
  color: z.enum(['black', 'white']).optional(),
  linkMode: z.enum(['shared', 'per-unit']).optional(),
});

export const checkoutRequestSchema = z.object({
  lines: z.array(cartLineSchema).min(1).max(20),
  /** The checkout order bump, at its bump price. */
  bump: z.boolean().default(false),
  reviewLink: z.string().trim().max(500).optional(),
  email: z.string().trim().email().max(254).optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const upsellRequestSchema = z.object({
  sessionId: z.string().trim().min(10).max(200),
});

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(1, 'Add your name').max(120),
  business: z.string().trim().min(1, 'Add your business name').max(160),
  email: z.string().trim().email('Check the email address').max(254),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  locations: z.coerce.number().int().min(1, 'At least one location').max(2000),
  standsPerLocation: z.coerce.number().int().min(1, 'At least one stand').max(500),
  logoPrinting: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
