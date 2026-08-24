-- TapRate forwarder schema.
--
-- Apply with:  psql "$DATABASE_URL" -f src/lib/store/schema.sql
--
-- Note what is deliberately absent: there is no row per tap, no IP column, no
-- user agent, no session. A tap increments a daily counter for one stand. That
-- is the whole record, and it is what the privacy page commits to.

CREATE TABLE IF NOT EXISTS orders (
  id                    TEXT PRIMARY KEY,
  checkout_session_id   TEXT NOT NULL UNIQUE,
  dashboard_token       TEXT NOT NULL UNIQUE,
  email                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stands (
  code               TEXT PRIMARY KEY,
  order_id           TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  placement_number   INTEGER NOT NULL,
  placement_label    TEXT NOT NULL,
  target_url         TEXT NOT NULL DEFAULT '',
  color              TEXT NOT NULL DEFAULT 'black',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_updated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS stands_order_id_idx ON stands (order_id);

CREATE TABLE IF NOT EXISTS tap_counts (
  stand_code  TEXT NOT NULL REFERENCES stands(code) ON DELETE CASCADE,
  day         DATE NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (stand_code, day)
);

CREATE INDEX IF NOT EXISTS tap_counts_day_idx ON tap_counts (day);
