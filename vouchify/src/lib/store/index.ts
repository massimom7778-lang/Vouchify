import 'server-only';
import { createMemoryStore } from './memory';
import { createPostgresStore } from './postgres';
import type { StandStore } from './types';

let store: StandStore | null = null;
let warned = false;

/**
 * Picks an adapter. Postgres when DATABASE_URL is set, otherwise the in-memory
 * one so a fresh clone runs with no services attached.
 *
 * The in-memory adapter is per-process, which on serverless means every request
 * may see a different empty store. It is fine for local development and tests
 * and is never fine in production, so it says so loudly once.
 */
export function getStore(): StandStore {
  if (store) return store;

  if (process.env.DATABASE_URL) {
    store = createPostgresStore();
    return store;
  }

  if (process.env.NODE_ENV === 'production' && !warned) {
    warned = true;
    console.warn(
      '[store] DATABASE_URL is not set. Falling back to the in-memory adapter, ' +
        'which does not persist between requests. Stands will not survive and the ' +
        'dashboard will look empty. Set DATABASE_URL and apply src/lib/store/schema.sql.',
    );
  }

  store = createMemoryStore();
  return store;
}

export function isStorePersistent(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export type { Stand, StandWithCounts, OrderRecord, DailyCount } from './types';
export { utcDay } from './types';
