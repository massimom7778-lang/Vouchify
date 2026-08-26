-- Vouchify forwarder schema.
--
-- Apply with:  psql "$DATABASE_URL" -f src/lib/store/schema.sql
--
-- Safe to re-run: every statement is IF NOT EXISTS or ADD COLUMN IF NOT EXISTS,
-- so this doubles as the migration for a database created before the shipping
-- address, fulfilment flag, append log and quotes table existed.
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

-- Where the box goes. Columns rather than JSON: the only consumer is a packing
-- list, and a packing list prints fields.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_name        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_line1       TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_line2       TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_city        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_region      TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_country     TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ship_phone       TEXT;

-- Set when the operator has encoded and packed the order.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);

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

-- Every append of extra stands to an existing order, keyed by the thing that
-- caused it (an upsell PaymentIntent, a fallback Checkout Session). The primary
-- key is what makes a retried webhook add stands exactly once.
CREATE TABLE IF NOT EXISTS provision_events (
  ref          TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stand_count  INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tap_counts (
  stand_code  TEXT NOT NULL REFERENCES stands(code) ON DELETE CASCADE,
  day         DATE NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (stand_code, day)
);

CREATE INDEX IF NOT EXISTS tap_counts_day_idx ON tap_counts (day);

-- Multi-location quote requests. Written on every submission, whether or not
-- the notification email got through, so a mail outage cannot lose a lead.
CREATE TABLE IF NOT EXISTS quotes (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  business            TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  locations           INTEGER NOT NULL,
  stands_per_location INTEGER NOT NULL,
  total_stands        INTEGER NOT NULL,
  logo_printing       BOOLEAN NOT NULL DEFAULT false,
  notes               TEXT,
  delivered           TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes (created_at DESC);
