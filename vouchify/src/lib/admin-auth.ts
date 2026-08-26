import 'server-only';
import { timingSafeEqual } from 'node:crypto';

/**
 * The operator gate.
 *
 * Same trade the dashboard makes: one long secret, no accounts, no sessions.
 * The difference is that this one opens every order rather than a single one,
 * so it is compared in constant time and is never allowed to be empty.
 */

export type AdminCheck =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  // timingSafeEqual throws on a length mismatch, which would itself leak length.
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Accepts `Authorization: Bearer <token>` or `?token=` so the page can be
 * opened from a phone on the packing bench without a header-setting client.
 */
export function checkAdmin(request: Request): AdminCheck {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 16) {
    return {
      ok: false,
      status: 503,
      error:
        'ADMIN_TOKEN is not set, or is too short to be a credential. Set it to a long random string.',
    };
  }

  const header = request.headers.get('authorization') ?? '';
  const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const query = new URL(request.url).searchParams.get('token')?.trim() ?? '';
  const supplied = bearer || query;

  if (!supplied || !safeEqual(supplied, expected)) {
    return { ok: false, status: 401, error: 'Not authorised.' };
  }
  return { ok: true };
}
