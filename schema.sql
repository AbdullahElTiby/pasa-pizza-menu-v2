-- ============================================================
-- Pasa Pizzeria — Supabase Schema (idempotent / safe to re-run)
-- Paste this into your Supabase project's SQL Editor and click "Run"
-- ============================================================

-- ============================================================
-- 1. Categories Table
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_tr TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Menu Items Table
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_price NUMERIC(10,2),
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    name_ar TEXT,
    description_ar TEXT,
    name_tr TEXT,
    description_tr TEXT,
    sub_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Row Level Security (RLS)
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Allow public read on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin insert on categories" ON categories;
DROP POLICY IF EXISTS "Allow admin update on categories" ON categories;
DROP POLICY IF EXISTS "Allow admin delete on categories" ON categories;
DROP POLICY IF EXISTS "Allow admin insert on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin update on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin delete on menu_items" ON menu_items;

-- Recreate all policies
CREATE POLICY "Allow public read on categories"
    ON categories FOR SELECT USING (true);

CREATE POLICY "Allow public read on menu_items"
    ON menu_items FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on categories"
    ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update on categories"
    ON categories FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete on categories"
    ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin insert on menu_items"
    ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update on menu_items"
    ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete on menu_items"
    ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. Optional Indexes (for performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_popular ON menu_items(is_popular);

-- ============================================================
-- 5. Storage Bucket for Menu Images
-- ============================================================
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('menu-images', 'menu-images', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read on menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads on menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on menu-images" ON storage.objects;

-- Allow public read access to the bucket
CREATE POLICY "Allow public read on menu-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads on menu-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated delete on menu-images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
