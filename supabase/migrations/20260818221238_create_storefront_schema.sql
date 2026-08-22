/*
# Northbound Goods storefront schema

1. Overview
This is a single-tenant, no-auth e-commerce storefront. Product catalog is
publicly readable. Orders and newsletter subscribers accept public inserts.
There is no sign-in screen, so all policies target `anon, authenticated`.

2. New Tables
- `products`: the catalog. Columns: id (uuid), name, slug (unique), tagline,
  description, price_cents (int), category, badge, featured (bool),
  rating (numeric), created_at.
- `product_images`: 2-3 images per product. Columns: id, product_id (fk),
  url, alt, position.
- `orders`: submitted orders. Columns: id (uuid), order_number (unique,
  human-readable), customer_name, email, address, city, postal_code, country,
  subtotal_cents, shipping_cents, total_cents, status, created_at.
- `order_items`: line items per order. Columns: id, order_id (fk), product_id
  (fk), product_name, unit_price_cents, quantity, variant.
- `subscribers`: newsletter signups. Columns: id, email (unique), created_at.

3. Security
- RLS enabled on every table.
- products: public SELECT only (no public write).
- product_images: public SELECT only.
- orders: public INSERT (anyone can place an order), public SELECT (so the
  confirmation page can fetch an order by id without auth).
- order_items: public INSERT, public SELECT.
- subscribers: public INSERT only (no public read, to protect emails).

4. Notes
- Prices stored as integer cents to avoid float rounding issues.
- `order_number` is a human-readable confirmation code (NB-XXXXXX) generated
  server-side by the edge function, with a unique constraint.
- `slug` on products is unique and used for friendly URLs.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text,
  description text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  category text NOT NULL,
  badge text,
  featured boolean NOT NULL DEFAULT false,
  rating numeric(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text NOT NULL,
  position integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'United States',
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  variant text
);

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- products: public read, no public write
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- product_images: public read, no public write
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

-- orders: public insert + public read (confirmation page fetches by id)
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_orders" ON orders;
CREATE POLICY "public_read_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

-- order_items: public insert + public read
DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_order_items" ON order_items;
CREATE POLICY "public_read_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

-- subscribers: public insert only (no read, protects emails)
DROP POLICY IF EXISTS "public_insert_subscribers" ON subscribers;
CREATE POLICY "public_insert_subscribers" ON subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
