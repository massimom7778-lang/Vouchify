import { randomBytes } from 'node:crypto';

/**
 * Crockford base32 without I, L, O and U: no character pair a person can
 * confuse when reading a code off a piece of acrylic, and none that spell
 * anything by accident.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function fromRandom(length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let index = 0; index < length; index += 1) {
    out += ALPHABET[bytes[index]! % ALPHABET.length];
  }
  return out;
}

/** Printed on the chip. 7 characters is ~34 bits — plenty, and still short. */
export function newStandCode(): string {
  return fromRandom(7);
}

/**
 * The dashboard link is the only credential, so it is sized like one: 26
 * characters, ~130 bits. It is a bearer token in a URL, which is the trade for
 * "no account for your staff to remember".
 */
export function newDashboardToken(): string {
  return fromRandom(26).toLowerCase();
}

export function newOrderId(): string {
  return `ord_${fromRandom(16).toLowerCase()}`;
}

/** Codes are printed in caps; people will type them in whatever case they like. */
export function normaliseCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
}
