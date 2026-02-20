# Blue Delta Jeans — Supabase Demo Database: Claude Code Build Specification

> **Purpose**: This document is a complete build specification for Claude Code to create a Supabase PostgreSQL database backing the Blue Delta Jeans dashboard demo (currently live at https://blue-delta-dashboard.vercel.app/ with static mock data). Feed this entire file as context.
>
> **What this does**: Creates 12 PostgreSQL tables in Supabase matching the dashboard's existing TypeScript interfaces, seeds them with ~1,500 rows of realistic test data, sets up Row Level Security policies, creates useful views and indexes, and wires the existing React dashboard to read from Supabase instead of in-memory mock data.
>
> **What this is NOT**: A production database. No real customer data. Demo/presentation purposes only.

---

## Project Rules for Database Work


```
# Supabase Integration Rules

## Database
- All table and column names use snake_case (PostgreSQL convention)
- Primary keys: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps: always `timestamptz`, never `timestamp` — defaults to `now()`
- Use CHECK constraints for enum-like values, NOT native PostgreSQL ENUMs
- Every foreign key column gets a manual B-tree index (Supabase does NOT auto-index FKs)
- ON DELETE CASCADE for dependent child records, ON DELETE SET NULL for optional references
- JSONB for semi-structured data (addresses, customization options)
- All tables get `created_at timestamptz NOT NULL DEFAULT now()` and `updated_at timestamptz`

## Row Level Security
- RLS enabled on EVERY table
- Demo policy: allow anon + authenticated full read access
- Allow authenticated users full write access
- Never leave a table with RLS enabled but no policies (returns 0 rows)

## Supabase Client
- Use @supabase/supabase-js (v2.x)
- Singleton client in `src/lib/supabase.ts`
- Environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env.local`
- Generate TypeScript types with: npx supabase gen types typescript --project-id "$PROJECT_REF" > src/lib/database.types.ts
- Use typed client: createClient<Database>(url, key)

## Data Access
- Use Supabase's nested select syntax for joins (not raw SQL from client)
- Pagination with .range(start, end), not .limit()
- Counts with .select('*', { count: 'exact', head: true })
- All queries go through Zustand store actions — components never call supabase directly
```

---

## Phase 1: Schema Creation

Run all SQL below in the Supabase SQL Editor (dashboard.supabase.com → your project → SQL Editor). Execute each block sequentially — tables must be created in dependency order.

### Prompt for Claude Code — Phase 1

```
I need you to generate the complete SQL schema for a Supabase PostgreSQL database that backs the Blue Delta Jeans dashboard demo. This will be run in the Supabase SQL Editor as a single migration.

Generate ONE complete SQL file called `supabase-schema.sql` that I can paste into the SQL Editor. Follow these rules exactly:

RULES:
- All table/column names in snake_case
- Primary keys: id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- All timestamps use timestamptz NOT NULL DEFAULT now()
- Use CHECK constraints for enum-like values (NOT native PostgreSQL ENUMs)
- Every foreign key gets a named index
- ON DELETE CASCADE for required children, ON DELETE SET NULL for optional references
- JSONB for addresses and arrays (customization_options, other_addresses)
- Include updated_at columns with moddatetime trigger
- Enable RLS on every table with permissive demo policies
- Add COMMENT ON TABLE for each table describing its purpose

The schema must create these 12 tables in this exact order (respecting FK dependencies):

=== TABLE 1: partners ===
Maps to the dashboard's Partner interface. B2B wholesale partners like Tom James Company.

Columns:
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
  name              text NOT NULL                    -- "Tom James Company"
  type              text NOT NULL CHECK (type IN ('Clothier', 'Corporate', 'Retailer'))
  contact_email     text NOT NULL
  contact_phone     text NOT NULL
  address           jsonb NOT NULL                   -- { street, city, state, zip, country }
  total_orders      integer NOT NULL DEFAULT 0
  total_revenue     numeric(12,2) NOT NULL DEFAULT 0
  active_orders     integer NOT NULL DEFAULT 0
  account_since     date NOT NULL
  payment_terms     text NOT NULL DEFAULT 'Net 30'   -- "Net 30", "Net 45", "Net 60"
  notes             text
  created_at        timestamptz NOT NULL DEFAULT now()
  updated_at        timestamptz

COMMENT: 'B2B wholesale partners — clothiers, corporate gifting, retailers'

=== TABLE 2: partner_reps ===
Sales representatives belonging to a partner. FK to partners.

Columns:
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
  partner_id          uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE
  first_name          text NOT NULL
  last_name           text NOT NULL
  email               text NOT NULL
  phone               text NOT NULL
  territory           text NOT NULL              -- "Southeast US", "Northeast", etc.
  total_orders        integer NOT NULL DEFAULT 0
  total_revenue       numeric(12,2) NOT NULL DEFAULT 0
  average_return_rate numeric(5,2) NOT NULL DEFAULT 0  -- percentage, lower = better
  created_at          timestamptz NOT NULL DEFAULT now()
  updated_at          timestamptz

INDEX: idx_partner_reps_partner_id ON partner_reps(partner_id)
COMMENT: 'Sales representatives for B2B partners with territory assignments'

=== TABLE 3: customers ===
The core customer record. Blue Delta's Customer 360.

Columns:
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
  first_name              text NOT NULL
  last_name               text NOT NULL
  nickname                text                     -- "Johnny", "Mike", etc.
  email                   text NOT NULL UNIQUE
  phone                   text NOT NULL             -- cell phone
  land_line               text
  date_of_birth           date
  height                  text                      -- "5'10\""
  weight                  text                      -- "170 lbs"
  shipping_address        jsonb NOT NULL             -- { street, city, state, zip, country }
  billing_address         jsonb                      -- null defaults to shipping
  other_addresses         jsonb DEFAULT '[]'::jsonb  -- array of address objects
  company                 text                       -- company name and role
  spouse_name             text
  spouse_account_id       uuid REFERENCES customers(id) ON DELETE SET NULL
  social_media_handles    text
  mexico_shipping_tax_id  text
  how_heard_about_us      text NOT NULL CHECK (how_heard_about_us IN ('Social Media', 'Referral', 'Press', 'Event', 'Search', 'Word of Mouth'))
  referral_source         text
  preferred_purchase      text NOT NULL DEFAULT 'Online' CHECK (preferred_purchase IN ('Online', 'In-Store', 'Phone'))
  preferred_contact       text NOT NULL DEFAULT 'Email' CHECK (preferred_contact IN ('Phone', 'Email', 'SMS', 'In-Person'))
  last_contact_method     text
  last_contact_date       timestamptz
  favorite_color          text
  climate                 text                      -- "Hot & Humid", "Temperate"
  normal_pants_type       text                      -- "Slim straight, raw denim"

  -- Aggregated fields (updated by triggers or application logic)
  loyalty_tier            text NOT NULL DEFAULT 'New' CHECK (loyalty_tier IN ('New', 'Returning', 'VIP', 'Ambassador'))
  reward_points           integer NOT NULL DEFAULT 0
  total_spent             numeric(12,2) NOT NULL DEFAULT 0
  total_orders            integer NOT NULL DEFAULT 0
  average_order_spent     numeric(10,2) NOT NULL DEFAULT 0
  average_product_spent   numeric(10,2) NOT NULL DEFAULT 0
  last_order_date         timestamptz
  channel                 text NOT NULL DEFAULT 'DTC Web' CHECK (channel IN ('DTC Web', 'DTC Store', 'B2B Tom James', 'B2B Other', 'Trunk Show'))

  -- Flags
  is_white_glove          boolean NOT NULL DEFAULT false
  has_fit_confirmation    boolean NOT NULL DEFAULT false
  has_empty_measurements  boolean NOT NULL DEFAULT true

  -- Notes
  profile_note            text
  call_notes              text

  -- Related counts
  orders_returned         integer NOT NULL DEFAULT 0
  items_altered           integer NOT NULL DEFAULT 0
  active_alterations      integer NOT NULL DEFAULT 0

  created_at              timestamptz NOT NULL DEFAULT now()
  updated_at              timestamptz

INDEX: idx_customers_loyalty_tier ON customers(loyalty_tier)
INDEX: idx_customers_channel ON customers(channel)
INDEX: idx_customers_email ON customers(email)  -- already UNIQUE but explicit for clarity
COMMENT: 'Customer 360 — full profile for every Blue Delta customer'

=== TABLE 4: measurement_profiles ===
Body measurements taken for bespoke fitting. 1-3 profiles per customer, exactly one active.

Columns:
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
  customer_id           uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE
  date_taken            date NOT NULL
  source                text NOT NULL CHECK (source IN ('Bold Metrics AI', 'In-Store', 'Tom James Rep', 'Trunk Show', 'Self-Measured'))
  is_active             boolean NOT NULL DEFAULT false
  fitted_by             text                     -- name of person who took measurements

  -- Core measurements (inches, stored as numeric for precision)
  waist                 numeric(5,2) NOT NULL
  seat                  numeric(5,2) NOT NULL
  thigh                 numeric(5,2) NOT NULL
  knee                  numeric(5,2) NOT NULL
  inseam                numeric(5,2) NOT NULL
  outseam               numeric(5,2) NOT NULL
  rise_front            numeric(5,2) NOT NULL
  rise_back             numeric(5,2) NOT NULL
  hip                   numeric(5,2) NOT NULL
  leg_opening           numeric(5,2) NOT NULL
  calf                  numeric(5,2)
  ankle                 numeric(5,2)

  -- Additional sizing
  jacket_size           text                     -- "42R"
  shoe_size             text                     -- "10.5"
  belt_size             text                     -- "34"
  belt_measure_method   text CHECK (belt_measure_method IN ('Try-On', 'Virtual Tailor', 'Tape Measured') OR belt_measure_method IS NULL)

  -- Fit preferences
  fit                   text CHECK (fit IN ('Slim', 'Regular', 'Relaxed') OR fit IS NULL)
  heel_height           text
  split_belt_loops      boolean NOT NULL DEFAULT false
  back_pocket_placement text CHECK (back_pocket_placement IN ('Standard', 'Higher', 'Lower') OR back_pocket_placement IS NULL)
  front_pocket_style    text CHECK (front_pocket_style IN ('Slant', 'Straight') OR front_pocket_style IS NULL)
  pocket_bag_depth      text CHECK (pocket_bag_depth IN ('Standard', 'Deep') OR pocket_bag_depth IS NULL)

  -- Monogram
  last_monogram         text                     -- "JWS"
  monogram_style        text CHECK (monogram_style IN ('Block', 'Script') OR monogram_style IS NULL)

  -- Thread
  last_thread_color     text

  -- Notes
  measurement_note      text                     -- "Left leg 0.5 inches shorter"
  fit_note              text                     -- "Prefers break over shoe"
  alteration_notes      text

  created_at            timestamptz NOT NULL DEFAULT now()
  updated_at            timestamptz

INDEX: idx_measurement_profiles_customer_id ON measurement_profiles(customer_id)
INDEX: idx_measurement_profiles_active ON measurement_profiles(customer_id) WHERE is_active = true
COMMENT: 'Body measurement profiles — 16-point bespoke fitting system'

=== TABLE 5: products ===
Blue Delta's product catalog.

Columns:
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
  name                    text NOT NULL             -- "Custom Raw Denim Jean"
  category                text NOT NULL CHECK (category IN ('Pants', 'Jacket', 'Belt', 'Accessory'))
  base_price              numeric(10,2) NOT NULL
  description             text NOT NULL
  fabric_family           text CHECK (fabric_family IN ('Raw Denim', 'Cotton Chino', 'Performance', 'Cashiers Collection') OR fabric_family IS NULL)
  is_active               boolean NOT NULL DEFAULT true
  customization_options   jsonb DEFAULT '[]'::jsonb  -- ["Thread Color", "Monogram", "Pocket Style"]
  created_at              timestamptz NOT NULL DEFAULT now()
  updated_at              timestamptz

COMMENT: 'Product catalog — pants, jackets, belts, accessories'

=== TABLE 6: fabric_rolls ===
Physical fabric roll inventory with shrinkage and yardage tracking.

Columns:
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
  material_name         text NOT NULL             -- "9.5oz Raw Denim - Dark Indigo"
  fabric_family         text NOT NULL CHECK (fabric_family IN ('Raw Denim', 'Cotton Chino', 'Performance', 'Cashiers Collection'))
  color                 text NOT NULL
  weight_oz             numeric(4,1) NOT NULL
  composition           text NOT NULL             -- "75% Cotton / 25% Elastane"
  supplier              text NOT NULL             -- "Cone Mills", "Kaihara", "Candiani"
  batch_dye_lot         text NOT NULL             -- "DL-2024-0892"
  width_inches          numeric(5,1) NOT NULL
  shrinkage_warp_pct    numeric(4,3) NOT NULL     -- 0.030 = 3%
  shrinkage_weft_pct    numeric(4,3) NOT NULL
  initial_yards         numeric(6,1) NOT NULL
  current_yards         numeric(6,1) NOT NULL
  reorder_point_yards   numeric(5,1) NOT NULL DEFAULT 20
  cost_per_yard         numeric(6,2) NOT NULL
  location              text NOT NULL             -- "Rack A-3, Bay 2"
  status                text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Low', 'Depleted', 'Quarantine'))
  received_date         date NOT NULL
  notes                 text
  created_at            timestamptz NOT NULL DEFAULT now()
  updated_at            timestamptz

COMMENT: 'Physical fabric roll inventory with shrinkage specs and yardage tracking'

=== TABLE 7: hardware_items ===
Tennessee-sourced custom brass hardware inventory.

Columns:
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
  name                  text NOT NULL             -- "YKK #5 Brass Zipper"
  type                  text NOT NULL CHECK (type IN ('Zipper', 'Main Button', 'Rivet', 'Snap', 'Buckle'))
  variant               text NOT NULL             -- "Brass", "Nickel", "Antique Brass"
  supplier              text NOT NULL
  current_stock         integer NOT NULL DEFAULT 0
  reorder_point         integer NOT NULL
  cost_per_unit         numeric(6,2) NOT NULL
  bom_quantity_per_jean integer NOT NULL DEFAULT 1 -- how many needed per standard jean
  location              text NOT NULL
  status                text NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low', 'Out of Stock'))
  created_at            timestamptz NOT NULL DEFAULT now()
  updated_at            timestamptz

COMMENT: 'Hardware inventory — zippers, buttons, rivets, snaps, buckles'

=== TABLE 8: orders ===
Production orders. The central table linking customers, products, fabric, and pipeline.

Columns:
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
  display_id              text NOT NULL UNIQUE       -- "ORD-0001" human-readable ID
  customer_id             uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT
  measurement_profile_id  uuid NOT NULL REFERENCES measurement_profiles(id) ON DELETE RESTRICT
  channel                 text NOT NULL CHECK (channel IN ('DTC Web', 'DTC Store', 'B2B Tom James', 'B2B Other', 'Trunk Show'))
  status                  text NOT NULL DEFAULT 'Order Received' CHECK (status IN ('Order Received', 'Pattern Drafting', 'Cutting', 'Sewing', 'Finishing', 'QC', 'Shipped'))
  product_id              uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT
  fabric_roll_id          uuid REFERENCES fabric_rolls(id) ON DELETE SET NULL
  quantity                integer NOT NULL DEFAULT 1
  unit_price              numeric(10,2) NOT NULL
  total_price             numeric(10,2) NOT NULL
  yardage_used            numeric(4,2)              -- filled after cutting

  -- Customization
  thread_color            text NOT NULL DEFAULT 'Tonal'
  monogram                text
  monogram_style          text CHECK (monogram_style IN ('Block', 'Script') OR monogram_style IS NULL)
  pocket_style            text NOT NULL DEFAULT 'Slant' CHECK (pocket_style IN ('Slant', 'Straight'))
  hardware                text NOT NULL DEFAULT 'Brass' CHECK (hardware IN ('Brass', 'Nickel', 'Antique Brass'))

  -- Production
  assigned_artisan        text                     -- name of artisan

  -- B2B fields
  partner_id              uuid REFERENCES partners(id) ON DELETE SET NULL
  partner_rep_id          uuid REFERENCES partner_reps(id) ON DELETE SET NULL
  partner_order_ref       text
  branding_pack_id        text

  -- Dates
  order_date              timestamptz NOT NULL DEFAULT now()
  promised_date           timestamptz NOT NULL
  completed_date          timestamptz

  -- Notes
  order_note              text
  gift_note               text
  gift_recipient          text
  gift_sender             text

  created_at              timestamptz NOT NULL DEFAULT now()
  updated_at              timestamptz

INDEX: idx_orders_customer_id ON orders(customer_id)
INDEX: idx_orders_product_id ON orders(product_id)
INDEX: idx_orders_fabric_roll_id ON orders(fabric_roll_id)
INDEX: idx_orders_partner_id ON orders(partner_id)
INDEX: idx_orders_partner_rep_id ON orders(partner_rep_id)
INDEX: idx_orders_measurement_profile_id ON orders(measurement_profile_id)
INDEX: idx_orders_status ON orders(status)
INDEX: idx_orders_channel ON orders(channel)
INDEX: idx_orders_order_date ON orders(order_date DESC)
INDEX: idx_orders_display_id ON orders(display_id)
COMMENT: 'Production orders — the central table linking customers, products, and manufacturing pipeline'

=== TABLE 9: pipeline_stages ===
Individual stage transitions for an order's journey through the 7-stage pipeline.
This is a separate table (not embedded JSONB) for queryability and reporting.

Columns:
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE
  stage         text NOT NULL CHECK (stage IN ('Order Received', 'Pattern Drafting', 'Cutting', 'Sewing', 'Finishing', 'QC', 'Shipped'))
  entered_at    timestamptz NOT NULL
  exited_at     timestamptz                     -- null = current stage
  artisan       text                             -- who handled this stage
  notes         text
  created_at    timestamptz NOT NULL DEFAULT now()

INDEX: idx_pipeline_stages_order_id ON pipeline_stages(order_id)
INDEX: idx_pipeline_stages_stage ON pipeline_stages(stage)
COMMENT: 'Production pipeline stage transitions — tracks each order through 7 manufacturing stages'

=== TABLE 10: shipments ===
Shipping/fulfillment records for completed orders.

Columns:
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
  order_id            uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE
  customer_id         uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT
  carrier             text NOT NULL CHECK (carrier IN ('UPS', 'FedEx', 'USPS'))
  tracking_number     text NOT NULL
  status              text NOT NULL DEFAULT 'Label Created' CHECK (status IN ('Label Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'))
  shipped_date        timestamptz NOT NULL
  estimated_delivery  timestamptz NOT NULL
  actual_delivery     timestamptz
  shipping_address    jsonb NOT NULL              -- { street, city, state, zip, country }
  weight              text NOT NULL               -- "2.4 lbs"
  cost                numeric(8,2) NOT NULL
  created_at          timestamptz NOT NULL DEFAULT now()
  updated_at          timestamptz

INDEX: idx_shipments_order_id ON shipments(order_id)
INDEX: idx_shipments_customer_id ON shipments(customer_id)
INDEX: idx_shipments_status ON shipments(status)
COMMENT: 'Shipping and fulfillment tracking for completed orders'

=== TABLE 11: shipment_stages ===
Tracking timeline entries for a shipment's journey.

Columns:
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
  shipment_id   uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE
  status        text NOT NULL CHECK (status IN ('Label Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'))
  timestamp     timestamptz NOT NULL
  location      text NOT NULL                   -- "Tupelo, MS", "Memphis, TN Hub"
  created_at    timestamptz NOT NULL DEFAULT now()

INDEX: idx_shipment_stages_shipment_id ON shipment_stages(shipment_id)
COMMENT: 'Shipment tracking timeline — geographic progression from Tupelo to destination'

=== TABLE 12: monthly_metrics ===
Pre-aggregated monthly analytics for dashboard charts.

Columns:
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
  month                   date NOT NULL UNIQUE       -- first day of month, e.g., '2025-01-01'
  revenue                 numeric(12,2) NOT NULL
  order_count             integer NOT NULL
  new_customers           integer NOT NULL
  dtc_web_orders          integer NOT NULL
  dtc_store_orders        integer NOT NULL
  b2b_orders              integer NOT NULL
  trunk_show_orders       integer NOT NULL
  average_lead_time_days  numeric(5,1) NOT NULL
  on_time_delivery_rate   numeric(5,2) NOT NULL      -- percentage
  fabric_yards_consumed   numeric(8,1) NOT NULL
  fabric_yards_received   numeric(8,1) NOT NULL
  created_at              timestamptz NOT NULL DEFAULT now()
  updated_at              timestamptz

COMMENT: 'Pre-aggregated monthly dashboard metrics — revenue, orders, delivery performance'

=== AFTER ALL TABLES — Set up moddatetime triggers ===

Enable the moddatetime extension and add update triggers to all tables with updated_at:

CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

Then for EACH table that has updated_at (all except pipeline_stages and shipment_stages):
  CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON <table_name>
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

=== AFTER TRIGGERS — Enable RLS and create demo policies ===

For EVERY one of the 12 tables:

  ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Allow public read access"
    ON <table_name> FOR SELECT
    TO anon, authenticated
    USING (true);

  CREATE POLICY "Allow authenticated write access"
    ON <table_name> FOR ALL
    TO authenticated
    USING (true) WITH CHECK (true);

=== AFTER RLS — Enable Realtime for key tables ===

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE fabric_rolls;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;

=== VIEWS — Dashboard aggregation helpers ===

Create these views (they are automatically exposed via the Supabase REST API):

VIEW: customer_summary
  SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.loyalty_tier,
    c.total_spent,
    c.total_orders,
    c.channel,
    c.is_white_glove,
    c.shipping_address->>'city' AS city,
    c.shipping_address->>'state' AS state,
    c.reward_points,
    c.last_order_date,
    c.created_at
  FROM customers c
  ORDER BY c.created_at DESC;

VIEW: production_pipeline_summary
  SELECT
    o.status AS stage,
    COUNT(*) AS order_count,
    AVG(
      EXTRACT(EPOCH FROM (COALESCE(ps.exited_at, now()) - ps.entered_at)) / 86400
    )::numeric(5,1) AS avg_days_in_stage
  FROM orders o
  LEFT JOIN pipeline_stages ps ON ps.order_id = o.id AND ps.stage = o.status
  WHERE o.status != 'Shipped'
  GROUP BY o.status
  ORDER BY
    CASE o.status
      WHEN 'Order Received' THEN 1
      WHEN 'Pattern Drafting' THEN 2
      WHEN 'Cutting' THEN 3
      WHEN 'Sewing' THEN 4
      WHEN 'Finishing' THEN 5
      WHEN 'QC' THEN 6
    END;

VIEW: inventory_alerts
  SELECT
    'fabric' AS item_type,
    fr.id,
    fr.material_name AS name,
    fr.color,
    fr.current_yards::text || ' yards' AS remaining,
    fr.reorder_point_yards::text || ' yards' AS reorder_point,
    fr.status,
    CASE
      WHEN fr.current_yards <= 3 THEN 'critical'
      WHEN fr.current_yards <= fr.reorder_point_yards THEN 'warning'
      ELSE 'ok'
    END AS severity
  FROM fabric_rolls fr
  WHERE fr.status IN ('Low', 'Depleted', 'Quarantine')

  UNION ALL

  SELECT
    'hardware' AS item_type,
    hw.id,
    hw.name,
    hw.variant AS color,
    hw.current_stock::text || ' units' AS remaining,
    hw.reorder_point::text || ' units' AS reorder_point,
    hw.status,
    CASE
      WHEN hw.current_stock = 0 THEN 'critical'
      WHEN hw.current_stock <= hw.reorder_point THEN 'warning'
      ELSE 'ok'
    END AS severity
  FROM hardware_items hw
  WHERE hw.status IN ('Low', 'Out of Stock')

  ORDER BY severity DESC, name;

VIEW: order_detail_view
  SELECT
    o.*,
    c.first_name AS customer_first_name,
    c.last_name AS customer_last_name,
    c.email AS customer_email,
    p.name AS product_name,
    p.category AS product_category,
    fr.material_name AS fabric_name,
    fr.color AS fabric_color,
    par.name AS partner_name,
    pr.first_name || ' ' || pr.last_name AS partner_rep_name
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  JOIN products p ON p.id = o.product_id
  LEFT JOIN fabric_rolls fr ON fr.id = o.fabric_roll_id
  LEFT JOIN partners par ON par.id = o.partner_id
  LEFT JOIN partner_reps pr ON pr.id = o.partner_rep_id;

Now generate the COMPLETE SQL file combining all of the above into a single executable script. Use this structure:

-- ============================================================
-- Blue Delta Jeans — Demo Database Schema
-- Run in Supabase SQL Editor as a single transaction
-- ============================================================
BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Tables (in dependency order)
-- ... all 12 CREATE TABLE statements ...

-- Indexes (all FK indexes)
-- ... all CREATE INDEX statements ...

-- Triggers (moddatetime for updated_at)
-- ... all CREATE TRIGGER statements ...

-- Row Level Security
-- ... ALTER TABLE + CREATE POLICY for all 12 tables ...

-- Realtime
-- ... ALTER PUBLICATION statements ...

-- Views
-- ... all CREATE VIEW statements ...

COMMIT;

Output the complete file to /home/claude/supabase-schema.sql
```

---

## Phase 2: Seed Data

### Prompt for Claude Code — Phase 2

```
Now generate the seed data SQL for the Blue Delta Jeans demo database. All tables from Phase 1 must already exist in Supabase. This seed data will be run in the SQL Editor after the schema.

Generate ONE complete SQL file called `supabase-seed.sql`. Follow these rules:

RULES:
- Use EXPLICIT UUIDs (generate them deterministically so FKs reference correctly)
- Use the format: uuid_generate_v5(uuid_ns_url(), 'table-name:XXXX') or just hardcode UUID literals
- Actually, for simplicity and reliability, use hardcoded UUID literals in format:
  Partners: 00000000-0000-0000-0000-00000000p001 through p005
  Partner Reps: 00000000-0000-0000-0000-0000000pr001 through pr025
  Customers: 00000000-0000-0000-0000-0000000c0001 through c0200
  Measurements: 00000000-0000-0000-0000-0000000m0001 through m0400
  Products: 00000000-0000-0000-0000-00000000pd01 through pd10
  Fabric Rolls: 00000000-0000-0000-0000-00000000fr01 through fr28
  Hardware: 00000000-0000-0000-0000-00000000hw01 through hw10
  Orders: 00000000-0000-0000-0000-0000000o0001 through o0500
  Shipments: 00000000-0000-0000-0000-0000000s0001 through s0100
- Wrap everything in BEGIN; ... COMMIT;
- Insert parent tables before children
- All data should be realistic for Blue Delta Jeans specifically

=== SEED DATA SPECIFICATIONS ===

PARTNERS (5 rows):
1. Tom James Company — Clothier, Dallas TX, account since 2019, Net 30, 480 total orders, $216,000 revenue
2. Nordstrom Personal Styling — Retailer, Seattle WA, account since 2023, Net 60, 85 orders, $38,250 revenue
3. Goldman Sachs Corporate Gifting — Corporate, New York NY, account since 2022, Net 30, 120 orders, $54,000 revenue
4. Soho House Members Club — Corporate, Los Angeles CA, account since 2024, Net 45, 40 orders, $18,000 revenue
5. J. Hilburn Custom Clothiers — Clothier, Dallas TX, account since 2021, Net 30, 200 orders, $90,000 revenue

PARTNER REPS (25 rows):
- Tom James gets 8 reps (territories: Southeast, Northeast, Midwest, Southwest, West Coast, Mid-Atlantic, Central, Pacific Northwest)
- Nordstrom gets 4 reps
- Goldman gets 5 reps
- Soho House gets 3 reps
- J. Hilburn gets 5 reps
- Average return rates: 2-12% (realistic, lower = better measurement skills)
- Use realistic Southern/professional names

CUSTOMERS (50 rows for demo — not 200, keeps seed manageable):
Instead of 200, seed 50 representative customers that cover all segments:
- 28 DTC Web (56%), 7 DTC Store (14%), 8 B2B Tom James (16%), 5 B2B Other (10%), 2 Trunk Show (4%)
- Loyalty: 15 New (1 order), 15 Returning (2-4 orders), 12 VIP (5-9 orders), 8 Ambassador (10+ orders)
- Cities: NYC, LA, Chicago, Houston, Dallas, Nashville, Atlanta, Miami, Denver, SF, Tupelo MS, Memphis TN, Jackson MS
- 5 White Glove customers
- 10 with profile_note or call_notes
- Total spent ranges: $450 (1 order) to $15,000+ (Ambassador)
- Realistic names, emails matching names (john.smith@gmail.com format)
- Addresses as JSONB: {"street": "123 Main St", "city": "Nashville", "state": "TN", "zip": "37201", "country": "US"}
- Reward points: total_orders * 45 + some variance

MEASUREMENT PROFILES (75 rows):
- 1-2 per customer, one active per customer
- Use "body size factor" pattern: base measurements * factor (0.7-1.3) + small random variance
  Base: waist=34, seat=42, thigh=24, knee=18, inseam=32, outseam=42, rise_front=11, rise_back=15, hip=40, leg_opening=16
  Small factor → slim build, large factor → larger build
- Source distribution matching channel:
  DTC Web customers → Bold Metrics AI
  DTC Store → In-Store
  B2B Tom James → Tom James Rep
  Trunk Show → Trunk Show
- 30% with fit preferences set
- 15% with monogram info
- 20% with measurement_note or fit_note ("Left leg slightly shorter", "Prefers break over shoe")

PRODUCTS (10 rows — Blue Delta's actual product line):
  1. Custom Raw Denim Jean — Pants, $450, Raw Denim
  2. Custom Chino — Pants, $450, Cotton Chino
  3. Custom Performance Jean — Pants, $450, Performance
  4. Cashiers Collection Jean — Pants, $450, Cashiers Collection
  5. Denim Trucker Jacket — Jacket, $525, Raw Denim
  6. Chore Coat — Jacket, $575, Raw Denim
  7. Lined Rancher Jacket — Jacket, $600, Raw Denim
  8. Custom Leather Belt — Belt, $200, null fabric family
  9. Monogrammed Pocket Square — Accessory, $75, null
  10. Custom Denim Apron — Accessory, $150, Raw Denim

Each with description and customization_options JSONB array.

FABRIC ROLLS (28 rows — Blue Delta's actual fabric lines):

Raw Denim (9.5 oz, 75% Cotton / 25% Elastane, supplier: Cone Mills or Kaihara):
  8 rolls: Dark Indigo, Smooth Indigo, Natural Indigo, Postman Blue, Steel Gray, Cast Gray, Charcoal, Super Black
  Width: 32-36", shrinkage warp: 0.030-0.050, weft: 0.040-0.070
  Initial: 80-120 yards, current: varies (some full, some low)

Cotton Chino (9 oz, 63% Cotton / 35% EcoVero Viscose / 2% Elastane, supplier: Candiani or ISKO):
  10 rolls: Banana Olive, British Khaki, Harbor Gray, Powder Blue, Stone, Moss, Terracotta, Navy, Cream, Slate
  Width: 56-60", shrinkage warp: 0.020-0.030, weft: 0.030-0.050

Performance (8 oz, 50% Cotton / 47% Nylon / 3% Spandex, supplier: ISKO or Burlington):
  5 rolls: Indigo, Black, Charcoal, Khaki, Navy
  Width: 58-62", shrinkage warp: 0.010-0.020, weft: 0.020-0.030

Cashiers Collection (12.6 oz, 98% Cotton / 2% Elastane, supplier: Cone Mills):
  5 rolls: Dark Blue, Graphite, Forest, Buckskin Brown, White
  Width: 34-36", shrinkage warp: 0.050-0.080, weft: 0.060-0.100

CRITICAL: 3-4 rolls at "Low" status (current_yards near reorder_point), 2 at "Depleted" (under 3 yards), 2 at "Quarantine" for demo alert display.

HARDWARE ITEMS (10 rows):
  1. YKK #5 Brass Zipper — stock: 800, reorder: 200, BOM: 1, $2.50/unit
  2. YKK #5 Nickel Zipper — stock: 350, reorder: 200, BOM: 1, $2.50/unit
  3. Main Button Brass — stock: 600, reorder: 150, BOM: 1, $1.25/unit
  4. Main Button Nickel — stock: 400, reorder: 150, BOM: 1, $1.25/unit
  5. Main Button Antique Brass — stock: 250, reorder: 150, BOM: 1, $1.50/unit
  6. Bar-Tack Rivet Positions — stock: 5000, reorder: 1000, BOM: 6, $0.15/unit
  7. Snap Brass — stock: 300, reorder: 100, BOM: 2, $0.75/unit
  8. Snap Nickel — stock: 200, reorder: 100, BOM: 2, $0.75/unit
  9. Belt Buckle Brass — stock: 150, reorder: 50, BOM: 1, $4.50/unit
  10. Belt Buckle Nickel — stock: 80, reorder: 50, BOM: 1, $4.50/unit (LOW status)
  Supplier for all: "Tennessee Brass Co." or "YKK Americas"
  CRITICAL: Item #10 should be "Low" status, Item #2 should be "Low" status for demo alerts.

ORDERS (100 rows for demo — not 500):
Seed 100 orders covering the full pipeline distribution:
- Status: 8 Order Received, 10 Pattern Drafting, 12 Cutting, 25 Sewing, 15 Finishing, 10 QC, 20 Shipped
- Every order references a valid customer_id, measurement_profile_id (the active one), and product_id
- Product mix: 75 Pants ($450), 15 Jackets ($300-600), 5 Belts ($200), 5 Accessories ($75-150)
- display_id format: ORD-0001 through ORD-0100
- Thread colors: Tonal (50%), Gold (15%), White (10%), Navy (10%), Red (5%), Custom (10%)
- Hardware: Brass (60%), Nickel (30%), Antique Brass (10%)
- Pocket style: Slant (70%), Straight (30%)
- ~25% B2B orders referencing valid partner_id and partner_rep_id
- fabric_roll_id only for orders past Cutting stage
- yardage_used: 1.4-1.8 for pants, 2.0-2.8 for jackets (only after cutting)
- Order dates: span 2024-06 through 2026-02
- promised_date = order_date + 35 days
- completed_date for Shipped orders
- 10% with order_note, 5% as gifts
- Artisan names from pool: Mary Catherine Wells, James Patterson, Dorothy Mae Harris, Robert Lee Thompson, Helen Grace Tucker, Willie James Brown, Betty Jo Mitchell, Charles Ray Stevens, Martha Ann Collier, Thomas Earl Boyd, Sarah Jane Cooper, David Wayne Phillips, Linda Sue Carpenter, Johnny Ray Dixon, Patricia Lynn Foster (use ~15 artisans)

PIPELINE STAGES (for each of the 100 orders):
- Each order gets stage entries UP TO its current status
- Timestamps chronological, 2-7 day gaps between stages
- Current stage has exited_at = NULL
- Shipped orders have all 7 stages completed
- Assign artisan names to Cutting through QC stages
- This will be ~350-400 rows total

SHIPMENTS (20 rows — for the 20 Shipped orders):
- Carrier: UPS 50%, FedEx 35%, USPS 15%
- Realistic tracking numbers:
  UPS: "1Z999AA10123456784" format
  FedEx: "123456789012" format
  USPS: "9400111899223100001234" format
- shipped_date matches the order's completed_date
- estimated_delivery: shipped_date + 3-7 days
- actual_delivery: 80% delivered (estimated ± 1 day), 20% still in transit
- Weight: 1.8-2.5 lbs (pants), 3.0-4.5 lbs (jackets)
- Cost: $12-25
- shipping_address: copy from customer's shipping_address

SHIPMENT STAGES (for each shipment):
- Label Created → Picked Up (same day or +1)
- Picked Up → In Transit (+1 day, location: "Tupelo, MS")
- In Transit → Out for Delivery (+2-5 days, hub city)
- Out for Delivery → Delivered (+1 day, customer city)
- Not-yet-delivered shipments stop at "In Transit"
- ~80-100 rows total

MONTHLY METRICS (18 rows — 2024-09 through 2026-02):
  Revenue growth: ~$150K/month in 2024 → ~$220K/month in 2026
  Order count: 300-500/month with bumps in Nov-Dec and Mar-Apr
  New customers: 15-35/month
  Channel split evolving: B2B growing from 20% to 30%
  On-time delivery: 88-96%
  Average lead time: 30-38 days
  Fabric consumed: order_count * 1.6 yards average
  Fabric received: consumed * 1.05-1.15 (slightly more than consumed, building buffer)

OUTPUT: Generate the complete seed SQL file at /home/claude/supabase-seed.sql

The file MUST:
- Start with BEGIN;
- Insert in dependency order: partners → partner_reps → customers → measurement_profiles → products → fabric_rolls → hardware_items → orders → pipeline_stages → shipments → shipment_stages → monthly_metrics
- End with COMMIT;
- All UUID values hardcoded as literals
- All FK references verified to point to real parent UUIDs
- All JSONB values properly formatted
- All CHECK constraint values matching the schema exactly
```

---

## Phase 3: React Integration

### Prompt for Claude Code — Phase 3

```
Now wire the existing Blue Delta Jeans dashboard (Vite + React + TypeScript) to read from Supabase instead of in-memory mock data. The Supabase database already has the schema and seed data from Phases 1-2.

STEP 1 — Install and configure Supabase client:

npm install @supabase/supabase-js

Create src/lib/supabase.ts:
  import { createClient } from '@supabase/supabase-js'
  import type { Database } from './database.types'

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Copy .env.example to .env.local and fill in your project values.')
  }

  export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

Create .env.example:
  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here

Create .env.local (gitignored):
  VITE_SUPABASE_URL=<actual URL from Supabase dashboard>
  VITE_SUPABASE_ANON_KEY=<actual anon key from Supabase dashboard>

Add .env.local to .gitignore if not already there.

STEP 2 — Generate TypeScript types:

Run: npx supabase gen types typescript --project-id "<PROJECT_REF>" --schema public > src/lib/database.types.ts

This creates types matching the actual database schema. Use these types in all Supabase queries.

STEP 3 — Create a data access layer:

Create src/lib/queries.ts with typed query functions that abstract all Supabase calls. The dashboard components should call these functions, NOT supabase directly.

Key query functions needed:

// === CUSTOMERS ===
fetchCustomers(filters?: { tier?: string; channel?: string; search?: string; limit?: number; offset?: number })
  → supabase.from('customers').select('*').order('created_at', { ascending: false })
  Apply .eq() for tier/channel, .or() for search across first_name, last_name, email
  Return: { data: Customer[]; count: number }

fetchCustomerById(id: string)
  → supabase.from('customers').select('*').eq('id', id).single()

fetchCustomerWithDetails(id: string)
  → supabase.from('customers').select(`
      *,
      measurement_profiles(*),
      orders(*, products(*), pipeline_stages(*), shipments(*))
    `).eq('id', id).single()
  This uses Supabase's nested select to get customer + measurements + orders in one call.

// === ORDERS ===
fetchOrders(filters?: { status?: string; channel?: string; search?: string; limit?: number; offset?: number })
  → supabase.from('orders').select(`
      *,
      customers(id, first_name, last_name, email),
      products(id, name, category)
    `).order('order_date', { ascending: false })

fetchOrderById(id: string)
  → supabase.from('orders').select(`
      *,
      customers(*),
      products(*),
      fabric_rolls(*),
      partners(*),
      partner_reps(*),
      pipeline_stages(*),
      shipments(*, shipment_stages(*))
    `).eq('id', id).single()

fetchOrdersByStatus()
  → supabase.from('production_pipeline_summary').select('*')
  Uses the view we created.

// === INVENTORY ===
fetchFabricRolls()
  → supabase.from('fabric_rolls').select('*').order('status', { ascending: true })

fetchHardwareItems()
  → supabase.from('hardware_items').select('*')

fetchInventoryAlerts()
  → supabase.from('inventory_alerts').select('*')
  Uses the view.

// === PRODUCTION ===
fetchProductionOrders()
  → supabase.from('orders').select(`
      *,
      customers(id, first_name, last_name),
      products(id, name, category),
      fabric_rolls(id, color, fabric_family),
      pipeline_stages(*)
    `).neq('status', 'Shipped')
    .order('order_date', { ascending: true })

advanceOrderStage(orderId: string, newStatus: string, artisan?: string)
  → Transaction-like: update the current pipeline_stage exited_at, insert new pipeline_stage, update order status
  Use supabase.from('pipeline_stages').update() then .insert() then supabase.from('orders').update()

// === SHIPPING ===
fetchShipments(filters?)
  → supabase.from('shipments').select(`
      *,
      orders(id, display_id),
      customers(id, first_name, last_name),
      shipment_stages(*)
    `).order('shipped_date', { ascending: false })

// === PARTNERS ===
fetchPartners()
  → supabase.from('partners').select('*')

fetchPartnerById(id: string)
  → supabase.from('partners').select(`
      *,
      partner_reps(*)
    `).eq('id', id).single()

fetchPartnerOrders(partnerId: string)
  → supabase.from('orders').select(`
      *,
      customers(id, first_name, last_name),
      products(id, name)
    `).eq('partner_id', partnerId)

// === ANALYTICS ===
fetchMonthlyMetrics()
  → supabase.from('monthly_metrics').select('*').order('month', { ascending: true })

fetchDashboardKPIs()
  → Multiple parallel queries:
    - Orders this month count
    - Active production count (status != 'Shipped')
    - Revenue MTD
    - Avg lead time for shipped orders this month
    - On-time delivery rate this month
    - Inventory alerts count
  Use Promise.all() for parallel execution

// === PRODUCTS ===
fetchProducts(filters?)
  → supabase.from('products').select('*').order('name')

STEP 4 — Update Zustand stores to use Supabase:

Modify each Zustand store to:
1. Replace the in-memory mock data initialization with async Supabase fetches
2. Add loading and error states
3. Keep the same public API (selectors and actions) so components don't need to change
4. Add a `fetchData()` action that components call on mount

Pattern for each store:

interface CustomerStoreState {
  customers: Customer[]
  selectedCustomer: Customer | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCustomers: (filters?: Filters) => Promise<void>
  fetchCustomerById: (id: string) => Promise<void>
  // ... same actions as before
}

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,

  fetchCustomers: async (filters) => {
    set({ isLoading: true, error: null })
    const { data, error } = await fetchCustomers(filters)
    if (error) set({ error: error.message, isLoading: false })
    else set({ customers: data ?? [], isLoading: false })
  },

  fetchCustomerById: async (id) => {
    set({ isLoading: true, error: null })
    const { data, error } = await fetchCustomerWithDetails(id)
    if (error) set({ error: error.message, isLoading: false })
    else set({ selectedCustomer: data, isLoading: false })
  },
}))

Apply this pattern to ALL stores: useCustomerStore, useOrderStore, useInventoryStore, useProductionStore, useShippingStore, usePartnerStore, useAnalyticsStore.

STEP 5 — Add loading states to page components:

Each page that fetches data should:
1. Call the store's fetch action in a useEffect on mount
2. Show shadcn Skeleton components while isLoading is true
3. Show an error Alert if error is set
4. Render the data table/charts when data is available

Pattern:
  const { customers, isLoading, error, fetchCustomers } = useCustomerStore()

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  if (isLoading) return <CustomerListSkeleton />
  if (error) return <Alert variant="destructive">{error}</Alert>
  return <CustomerDataTable data={customers} />

STEP 6 — Add Realtime subscriptions for production pipeline:

In the Production page, subscribe to order changes so the Kanban board updates live:

  useEffect(() => {
    const channel = supabase
      .channel('production-orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: 'status=neq.Shipped' },
        () => { fetchProductionOrders() }  // refetch on any change
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

Also subscribe to fabric_rolls for live inventory alerts on the Dashboard.

STEP 7 — Environment variable handling for Vercel deployment:

The dashboard is deployed on Vercel. To make it work there:
- Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as Environment Variables in Vercel project settings
- These are public/safe values (the anon key is designed to be exposed in client code — RLS protects the data)
- Redeploy after adding env vars

STEP 8 — Dual-mode support (optional but recommended):

To keep the dashboard working both with and without Supabase, add a feature flag:

Create src/lib/config.ts:
  export const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL)

In each store, check this flag:
  fetchCustomers: async (filters) => {
    if (!USE_SUPABASE) {
      // Fall back to existing mock data generators
      const mockData = generateCustomers()
      set({ customers: mockData, isLoading: false })
      return
    }
    // Supabase fetch path
    set({ isLoading: true })
    const { data, error } = await fetchCustomers(filters)
    ...
  }

This way:
- If VITE_SUPABASE_URL is set → reads from Supabase
- If not set → falls back to the existing faker-generated mock data
- The dashboard works in both modes without code changes
```

---

## Phase 4: Verification and Cleanup

### Prompt for Claude Code — Phase 4

```
Final verification pass. Run through each of these checks and fix any issues:

1. SCHEMA VERIFICATION:
   - Every table has RLS enabled with at least one SELECT policy
   - Every FK column has a named index
   - All CHECK constraints match the exact string values used in seed data
   - moddatetime triggers on all tables with updated_at

2. SEED DATA VERIFICATION:
   - Every order.customer_id points to an existing customer
   - Every order.measurement_profile_id points to an existing measurement (and it's the active one for that customer)
   - Every order.product_id points to an existing product
   - Every order.fabric_roll_id (where not null) points to an existing roll
   - Every order.partner_id (where not null) points to an existing partner
   - Every pipeline_stage.order_id points to an existing order
   - Every shipment.order_id points to a Shipped order
   - Pipeline stage timestamps are chronological per order
   - Shipped orders have exactly 7 pipeline stages

3. QUERY VERIFICATION:
   - All views return expected data
   - Nested selects resolve correctly (orders → customers, orders → products, etc.)
   - Filters work: .eq('status', 'Sewing'), .ilike('first_name', '%john%')
   - Pagination works: .range(0, 24) returns first 25 rows
   - Count works: .select('*', { count: 'exact', head: true })

4. REACT INTEGRATION VERIFICATION:
   - Dashboard loads KPIs from Supabase
   - Customer list loads and filters work
   - Customer detail loads with nested measurements and orders
   - Production kanban loads orders grouped by status
   - Inventory alerts view returns low-stock items
   - Monthly metrics chart data loads correctly

5. TYPE SAFETY:
   - Generated database.types.ts matches the actual schema
   - No TypeScript errors in query functions
   - Store types align with database column names (snake_case from DB, camelCase in app — add mapping if needed)

6. COLUMN NAME MAPPING:
   If the existing dashboard uses camelCase (firstName, lastName, fabricRollId) but the database uses snake_case (first_name, last_name, fabric_roll_id), create a mapping utility:

   src/lib/mappers.ts:
   - mapCustomerFromDB(row) → converts snake_case DB row to camelCase Customer interface
   - mapOrderFromDB(row) → same for orders
   - ... for all entity types

   Apply these mappers in the query layer so stores receive camelCase data matching existing component expectations.

Output a verification checklist with pass/fail for each item.
```

---

## Appendix A: Table Relationship Diagram

```
partners ──────────┐
                   │ 1:N
partner_reps ──────┘
     │
     │ (optional FK)
     ▼
orders ◄──────────── customers
  │  │                   │
  │  │ 1:N               │ 1:N
  │  ▼                   ▼
  │  pipeline_stages   measurement_profiles
  │
  │ 1:1
  ▼
shipments
  │
  │ 1:N
  ▼
shipment_stages

orders ──► products        (required FK)
orders ──► fabric_rolls    (optional FK, set after Cutting)
orders ──► measurement_profiles (required FK)

monthly_metrics              (standalone, no FKs)
hardware_items               (standalone, no FKs)
```

## Appendix B: Supabase Dashboard Navigation Reference

After running the schema and seed SQL, verify in the Supabase dashboard:

**Table Editor** → You should see all 12 tables listed. Click any table to browse rows.
**SQL Editor** → Where you ran the schema and seed scripts. Use for ad-hoc queries.
**Database → Configuration** → Where database-level settings live (moved from Project Settings in Jan 2026).
**Settings → API Keys** → Find your `anon` public key and project URL.
**Authentication → Policies** → Verify RLS policies are active on all tables.

## Appendix C: Quick Reference — Supabase Query Patterns

```typescript
// Simple select with filter
const { data } = await supabase.from('customers').select('*').eq('loyalty_tier', 'VIP')

// Nested join (automatic via FK detection)
const { data } = await supabase.from('orders').select('*, customers(*), products(*)')

// Count without fetching rows
const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Sewing')

// Pagination
const { data } = await supabase.from('customers').select('*').range(0, 24).order('created_at', { ascending: false })

// Search across multiple columns
const { data } = await supabase.from('customers').select('*').or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)

// Insert
const { data, error } = await supabase.from('orders').insert({ customer_id: '...', status: 'Order Received', ... }).select()

// Update
const { data, error } = await supabase.from('orders').update({ status: 'Cutting' }).eq('id', orderId).select()

// Realtime subscription
const channel = supabase.channel('orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback).subscribe()

// View query (views are queried like tables)
const { data } = await supabase.from('inventory_alerts').select('*')
const { data } = await supabase.from('production_pipeline_summary').select('*')
```

## Appendix D: File Checklist After All Phases

New or modified files in the blue-delta-dashboard project:

```
blue-delta-dashboard/
├── .env.example                      # NEW — template for Supabase env vars
├── .env.local                        # NEW — actual Supabase env vars (gitignored)
├── CLAUDE.md                         # MODIFIED — added Supabase integration rules
├── supabase-schema.sql               # NEW — complete database schema (keep for reference)
├── supabase-seed.sql                 # NEW — complete seed data (keep as backup)
├── src/
│   ├── lib/
│   │   ├── supabase.ts               # NEW — Supabase client singleton
│   │   ├── database.types.ts         # NEW — auto-generated from schema
│   │   ├── queries.ts                # NEW — typed query functions
│   │   ├── mappers.ts                # NEW — snake_case → camelCase converters
│   │   ├── config.ts                 # NEW — USE_SUPABASE feature flag
│   │   └── utils.ts                  # EXISTING
│   ├── stores/
│   │   ├── useCustomerStore.ts       # MODIFIED — async Supabase fetches
│   │   ├── useOrderStore.ts          # MODIFIED
│   │   ├── useInventoryStore.ts      # MODIFIED
│   │   ├── useProductionStore.ts     # MODIFIED
│   │   ├── useShippingStore.ts       # MODIFIED
│   │   ├── usePartnerStore.ts        # MODIFIED
│   │   └── useAnalyticsStore.ts      # MODIFIED
│   ├── data/                         # EXISTING — kept as fallback for mock mode
```
