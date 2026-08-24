'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getStore } from '@/lib/store';
import { normaliseCode } from '@/lib/store/codes';

const updateSchema = z.object({
  token: z.string().trim().min(20).max(64),
  code: z.string().trim().min(4).max(16),
  targetUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), {
      message: 'Paste a link starting with https://',
    }),
});

export interface UpdateResult {
  ok: boolean;
  message: string;
}

/**
 * Re-points one stand.
 *
 * The token in the form decides which order may be touched; the stand code is
 * then checked against that order in the store. A code belonging to someone
 * else's order is simply not found, so guessing one gains nothing.
 */
export async function updateStandTarget(
  _previous: UpdateResult | null,
  formData: FormData,
): Promise<UpdateResult> {
  const parsed = updateSchema.safeParse({
    token: formData.get('token'),
    code: formData.get('code'),
    targetUrl: formData.get('targetUrl'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'That link could not be read.',
    };
  }

  const store = getStore();
  const order = await store.getOrderByToken(parsed.data.token);
  if (!order) {
    return { ok: false, message: 'This dashboard link is not valid any more.' };
  }

  const code = normaliseCode(parsed.data.code);
  const updated = await store.updateTarget(order.id, code, parsed.data.targetUrl);
  if (!updated) {
    return { ok: false, message: 'That stand is not part of this order.' };
  }

  revalidatePath(`/dashboard/${parsed.data.token}`);
  return {
    ok: true,
    message: parsed.data.targetUrl
      ? 'Saved. The next tap goes to the new link.'
      : 'Cleared. This stand now shows the “no link yet” page.',
  };
}
