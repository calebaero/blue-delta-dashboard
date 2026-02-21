-- ============================================================
-- Blue Delta Jeans — Demo Database Schema
-- Run in Supabase SQL Editor as a single transaction
-- ============================================================

BEGIN;

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- ============================================================
-- Tables (in dependency order)
-- ============================================================

-- TABLE 1: partners
CREATE TABLE partners (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  type            text NOT NULL CHECK (type IN ('Clothier', 'Corporate', 'Retailer')),
  contact_email   text NOT NULL,
  contact_phone   text NOT NULL,
  address         jsonb NOT NULL,
  total_orders    integer NOT NULL DEFAULT 0,
  total_revenue   numeric(12,2) NOT NULL DEFAULT 0,
  active_orders   integer NOT NULL DEFAULT 0,
  account_since   date NOT NULL,
  payment_terms   text NOT NULL DEFAULT 'Net 30',
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);
COMMENT ON TABLE partners IS 'B2B wholesale partners — clothiers, corporate gifting, retailers';

-- TABLE 2: partner_reps
CREATE TABLE partner_reps (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id          uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  first_name          text NOT NULL,
  last_name           text NOT NULL,
  email               text NOT NULL,
  phone               text NOT NULL,
  territory           text NOT NULL,
  total_orders        integer NOT NULL DEFAULT 0,
  total_revenue       numeric(12,2) NOT NULL DEFAULT 0,
  average_return_rate numeric(5,2) NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz
);
COMMENT ON TABLE partner_reps IS 'Sales representatives for B2B partners with territory assignments';

-- TABLE 3: customers
CREATE TABLE customers (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name              text NOT NULL,
  last_name               text NOT NULL,
  nickname                text,
  email                   text NOT NULL UNIQUE,
  phone                   text NOT NULL,
  land_line               text,
  date_of_birth           date,
  height                  text,
  weight                  text,
  shipping_address        jsonb NOT NULL,
  billing_address         jsonb,
  other_addresses         jsonb DEFAULT '[]'::jsonb,
  company                 text,
  spouse_name             text,
  spouse_account_id       uuid REFERENCES customers(id) ON DELETE SET NULL,
  social_media_handles    text,
  mexico_shipping_tax_id  text,
  how_heard_about_us      text NOT NULL CHECK (how_heard_about_us IN ('Social Media', 'Referral', 'Press', 'Event', 'Search', 'Word of Mouth')),
  referral_source         text,
  preferred_purchase      text NOT NULL DEFAULT 'Online' CHECK (preferred_purchase IN ('Online', 'In-Store', 'Phone')),
  preferred_contact       text NOT NULL DEFAULT 'Email' CHECK (preferred_contact IN ('Phone', 'Email', 'SMS', 'In-Person')),
  last_contact_method     text,
  last_contact_date       timestamptz,
  favorite_color          text,
  climate                 text,
  normal_pants_type       text,
  loyalty_tier            text NOT NULL DEFAULT 'New' CHECK (loyalty_tier IN ('New', 'Returning', 'VIP', 'Ambassador')),
  reward_points           integer NOT NULL DEFAULT 0,
  total_spent             numeric(12,2) NOT NULL DEFAULT 0,
  total_orders            integer NOT NULL DEFAULT 0,
  average_order_spent     numeric(10,2) NOT NULL DEFAULT 0,
  average_product_spent   numeric(10,2) NOT NULL DEFAULT 0,
  last_order_date         timestamptz,
  channel                 text NOT NULL DEFAULT 'DTC Web' CHECK (channel IN ('DTC Web', 'DTC Store', 'B2B Tom James', 'B2B Other', 'Trunk Show')),
  is_white_glove          boolean NOT NULL DEFAULT false,
  has_fit_confirmation    boolean NOT NULL DEFAULT false,
  has_empty_measurements  boolean NOT NULL DEFAULT true,
  profile_note            text,
  call_notes              text,
  orders_returned         integer NOT NULL DEFAULT 0,
  items_altered           integer NOT NULL DEFAULT 0,
  active_alterations      integer NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz
);
COMMENT ON TABLE customers IS 'Customer 360 — full profile for every Blue Delta customer';

-- TABLE 4: measurement_profiles
CREATE TABLE measurement_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id           uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  date_taken            date NOT NULL,
  source                text NOT NULL CHECK (source IN ('Bold Metrics AI', 'In-Store', 'Tom James Rep', 'Trunk Show', 'Self-Measured')),
  is_active             boolean NOT NULL DEFAULT false,
  fitted_by             text,
  waist                 numeric(5,2) NOT NULL,
  seat                  numeric(5,2) NOT NULL,
  thigh                 numeric(5,2) NOT NULL,
  knee                  numeric(5,2) NOT NULL,
  inseam                numeric(5,2) NOT NULL,
  outseam               numeric(5,2) NOT NULL,
  rise_front            numeric(5,2) NOT NULL,
  rise_back             numeric(5,2) NOT NULL,
  hip                   numeric(5,2) NOT NULL,
  leg_opening           numeric(5,2) NOT NULL,
  calf                  numeric(5,2),
  ankle                 numeric(5,2),
  jacket_size           text,
  shoe_size             text,
  belt_size             text,
  belt_measure_method   text CHECK (belt_measure_method IN ('Try-On', 'Virtual Tailor', 'Tape Measured') OR belt_measure_method IS NULL),
  fit                   text CHECK (fit IN ('Slim', 'Regular', 'Relaxed') OR fit IS NULL),
  heel_height           text,
  split_belt_loops      boolean NOT NULL DEFAULT false,
  back_pocket_placement text CHECK (back_pocket_placement IN ('Standard', 'Higher', 'Lower') OR back_pocket_placement IS NULL),
  front_pocket_style    text CHECK (front_pocket_style IN ('Slant', 'Straight') OR front_pocket_style IS NULL),
  pocket_bag_depth      text CHECK (pocket_bag_depth IN ('Standard', 'Deep') OR pocket_bag_depth IS NULL),
  last_monogram         text,
  monogram_style        text CHECK (monogram_style IN ('Block', 'Script') OR monogram_style IS NULL),
  last_thread_color     text,
  measurement_note      text,
  fit_note              text,
  alteration_notes      text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);
COMMENT ON TABLE measurement_profiles IS 'Body measurement profiles — 16-point bespoke fitting system';

-- TABLE 5: products
CREATE TABLE products (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text NOT NULL,
  category                text NOT NULL CHECK (category IN ('Pants', 'Jacket', 'Belt', 'Hat', 'Accessory')),
  base_price              numeric(10,2) NOT NULL,
  description             text NOT NULL,
  fabric_family           text CHECK (fabric_family IN ('Raw Denim', 'Cotton Chino', 'Performance', 'Cashiers Collection', 'Waxed Canvas', 'Canvas', 'Leather', 'Hat Fabric') OR fabric_family IS NULL),
  is_active               boolean NOT NULL DEFAULT true,
  customization_options   jsonb DEFAULT '[]'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz
);
COMMENT ON TABLE products IS 'Product catalog — pants, jackets, belts, accessories';

-- TABLE 6: fabric_rolls
CREATE TABLE fabric_rolls (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name         text NOT NULL,
  fabric_family         text NOT NULL CHECK (fabric_family IN ('Raw Denim', 'Cotton Chino', 'Performance', 'Cashiers Collection', 'Waxed Canvas', 'Canvas', 'Leather', 'Hat Fabric')),
  color                 text NOT NULL,
  weight_oz             numeric(4,1) NOT NULL,
  composition           text NOT NULL,
  supplier              text NOT NULL,
  batch_dye_lot         text NOT NULL,
  width_inches          numeric(5,1) NOT NULL,
  shrinkage_warp_pct    numeric(4,3) NOT NULL,
  shrinkage_weft_pct    numeric(4,3) NOT NULL,
  initial_yards         numeric(6,1) NOT NULL,
  current_yards         numeric(6,1) NOT NULL,
  reorder_point_yards   numeric(5,1) NOT NULL DEFAULT 20,
  cost_per_yard         numeric(6,2) NOT NULL,
  location              text NOT NULL,
  status                text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Low', 'Depleted', 'Quarantine')),
  received_date         date NOT NULL,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);
COMMENT ON TABLE fabric_rolls IS 'Physical fabric roll inventory with shrinkage specs and yardage tracking';

-- TABLE 7: hardware_items
CREATE TABLE hardware_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  type                  text NOT NULL CHECK (type IN ('Zipper', 'Main Button', 'Rivet', 'Snap', 'Buckle')),
  variant               text NOT NULL,
  supplier              text NOT NULL,
  current_stock         integer NOT NULL DEFAULT 0,
  reorder_point         integer NOT NULL,
  cost_per_unit         numeric(6,2) NOT NULL,
  bom_quantity_per_jean integer NOT NULL DEFAULT 1,
  location              text NOT NULL,
  status                text NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low', 'Out of Stock')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);
COMMENT ON TABLE hardware_items IS 'Hardware inventory — zippers, buttons, rivets, snaps, buckles';

-- TABLE 8: orders
CREATE TABLE orders (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id              text NOT NULL UNIQUE,
  customer_id             uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  measurement_profile_id  uuid NOT NULL REFERENCES measurement_profiles(id) ON DELETE RESTRICT,
  channel                 text NOT NULL CHECK (channel IN ('DTC Web', 'DTC Store', 'B2B Tom James', 'B2B Other', 'Trunk Show')),
  status                  text NOT NULL DEFAULT 'Order Received' CHECK (status IN ('Order Received', 'Pattern Drafting', 'Cutting', 'Sewing', 'Finishing', 'QC', 'Shipped')),
  product_id              uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  fabric_roll_id          uuid REFERENCES fabric_rolls(id) ON DELETE SET NULL,
  quantity                integer NOT NULL DEFAULT 1,
  unit_price              numeric(10,2) NOT NULL,
  total_price             numeric(10,2) NOT NULL,
  yardage_used            numeric(4,2),
  thread_color            text NOT NULL DEFAULT 'Tonal',
  monogram                text,
  monogram_style          text CHECK (monogram_style IN ('Block', 'Script') OR monogram_style IS NULL),
  pocket_style            text NOT NULL DEFAULT 'Slant' CHECK (pocket_style IN ('Slant', 'Straight')),
  hardware                text NOT NULL DEFAULT 'Brass' CHECK (hardware IN ('Brass', 'Nickel', 'Antique Brass')),
  assigned_artisan        text,
  partner_id              uuid REFERENCES partners(id) ON DELETE SET NULL,
  partner_rep_id          uuid REFERENCES partner_reps(id) ON DELETE SET NULL,
  partner_order_ref       text,
  branding_pack_id        text,
  order_date              timestamptz NOT NULL DEFAULT now(),
  promised_date           timestamptz NOT NULL,
  completed_date          timestamptz,
  order_note              text,
  gift_note               text,
  gift_recipient          text,
  gift_sender             text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz
);
COMMENT ON TABLE orders IS 'Production orders — the central table linking customers, products, and manufacturing pipeline';

-- TABLE 9: pipeline_stages
CREATE TABLE pipeline_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage         text NOT NULL CHECK (stage IN ('Order Received', 'Pattern Drafting', 'Cutting', 'Sewing', 'Finishing', 'QC', 'Shipped')),
  entered_at    timestamptz NOT NULL,
  exited_at     timestamptz,
  artisan       text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE pipeline_stages IS 'Production pipeline stage transitions — tracks each order through 7 manufacturing stages';

-- TABLE 10: shipments
CREATE TABLE shipments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id         uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  carrier             text NOT NULL CHECK (carrier IN ('UPS', 'FedEx', 'USPS')),
  tracking_number     text NOT NULL,
  status              text NOT NULL DEFAULT 'Label Created' CHECK (status IN ('Label Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered')),
  shipped_date        timestamptz NOT NULL,
  estimated_delivery  timestamptz NOT NULL,
  actual_delivery     timestamptz,
  shipping_address    jsonb NOT NULL,
  weight              text NOT NULL,
  cost                numeric(8,2) NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz
);
COMMENT ON TABLE shipments IS 'Shipping and fulfillment tracking for completed orders';

-- TABLE 11: shipment_stages
CREATE TABLE shipment_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id   uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status        text NOT NULL CHECK (status IN ('Label Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered')),
  timestamp     timestamptz NOT NULL,
  location      text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE shipment_stages IS 'Shipment tracking timeline — geographic progression from Tupelo to destination';

-- TABLE 12: monthly_metrics
CREATE TABLE monthly_metrics (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month                   date NOT NULL UNIQUE,
  revenue                 numeric(12,2) NOT NULL,
  order_count             integer NOT NULL,
  new_customers           integer NOT NULL,
  dtc_web_orders          integer NOT NULL,
  dtc_store_orders        integer NOT NULL,
  b2b_orders              integer NOT NULL,
  trunk_show_orders       integer NOT NULL,
  average_lead_time_days  numeric(5,1) NOT NULL,
  on_time_delivery_rate   numeric(5,2) NOT NULL,
  fabric_yards_consumed   numeric(8,1) NOT NULL,
  fabric_yards_received   numeric(8,1) NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz
);
COMMENT ON TABLE monthly_metrics IS 'Pre-aggregated monthly dashboard metrics — revenue, orders, delivery performance';

-- ============================================================
-- Indexes (all FK and query-pattern indexes)
-- ============================================================

-- partner_reps
CREATE INDEX idx_partner_reps_partner_id ON partner_reps(partner_id);

-- customers
CREATE INDEX idx_customers_loyalty_tier ON customers(loyalty_tier);
CREATE INDEX idx_customers_channel ON customers(channel);
-- email already has UNIQUE constraint but explicit for clarity
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_spouse_account_id ON customers(spouse_account_id);

-- measurement_profiles
CREATE INDEX idx_measurement_profiles_customer_id ON measurement_profiles(customer_id);
CREATE INDEX idx_measurement_profiles_active ON measurement_profiles(customer_id) WHERE is_active = true;

-- orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_fabric_roll_id ON orders(fabric_roll_id);
CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_partner_rep_id ON orders(partner_rep_id);
CREATE INDEX idx_orders_measurement_profile_id ON orders(measurement_profile_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_channel ON orders(channel);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_orders_display_id ON orders(display_id);

-- pipeline_stages
CREATE INDEX idx_pipeline_stages_order_id ON pipeline_stages(order_id);
CREATE INDEX idx_pipeline_stages_stage ON pipeline_stages(stage);

-- shipments
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX idx_shipments_status ON shipments(status);

-- shipment_stages
CREATE INDEX idx_shipment_stages_shipment_id ON shipment_stages(shipment_id);

-- ============================================================
-- Triggers (moddatetime for updated_at)
-- ============================================================

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON partner_reps
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON measurement_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON fabric_rolls
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON hardware_items
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

-- pipeline_stages: no updated_at column

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

-- shipment_stages: no updated_at column

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON monthly_metrics
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

-- ============================================================
-- Row Level Security
-- ============================================================

-- partners
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON partners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- partner_reps
ALTER TABLE partner_reps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON partner_reps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON partner_reps FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- measurement_profiles
ALTER TABLE measurement_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON measurement_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON measurement_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- fabric_rolls
ALTER TABLE fabric_rolls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON fabric_rolls FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON fabric_rolls FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- hardware_items
ALTER TABLE hardware_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON hardware_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON hardware_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- pipeline_stages
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON pipeline_stages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON pipeline_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- shipments
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON shipments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- shipment_stages
ALTER TABLE shipment_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON shipment_stages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON shipment_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- monthly_metrics
ALTER TABLE monthly_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON monthly_metrics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON monthly_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Realtime
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE fabric_rolls;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;

-- ============================================================
-- Views
-- ============================================================

CREATE VIEW customer_summary
WITH (security_invoker = true) AS
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

CREATE VIEW production_pipeline_summary
WITH (security_invoker = true) AS
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

CREATE VIEW inventory_alerts
WITH (security_invoker = true) AS
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

CREATE VIEW order_detail_view
WITH (security_invoker = true) AS
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

COMMIT;
