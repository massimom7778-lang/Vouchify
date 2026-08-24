type ClassValue = string | number | false | null | undefined;

/** Tiny class joiner. No dependency, no merge magic — components own their
 *  ordering and pass `className` last so callers can always override. */
export function cn(...values: ClassValue[]): string {
  return values.filter((v): v is string | number => Boolean(v)).join(' ');
}
