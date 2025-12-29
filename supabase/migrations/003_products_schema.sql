-- ============================================================================
-- MARKETING SAAS PLATFORM - PRODUCTS MODULE
-- Products/Services created by users
-- ============================================================================

-- Products table (user's products/services/shops/restaurants)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('product', 'service', 'shop', 'restaurant', 'other')),
  description TEXT,
  price DECIMAL(10, 2),
  
  -- Media
  logo_url TEXT,
  images TEXT[], -- Array of image URLs
  
  -- Target Audience
  target_age_min INTEGER,
  target_age_max INTEGER,
  target_gender TEXT CHECK (target_gender IN ('male', 'female', 'all', NULL)),
  target_interests TEXT[], -- Array of interest tags
  target_location JSONB, -- {country, city, area}
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can view all products
CREATE POLICY "Admin can view all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- ============================================================================
-- PRODUCT CATEGORIES REFERENCE (Optional - for dropdowns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO product_categories (name, description, icon, display_order) VALUES
('product', 'Physical or digital products', 'Package', 1),
('service', 'Professional services', 'Briefcase', 2),
('shop', 'Retail or online stores', 'Store', 3),
('restaurant', 'Food & dining establishments', 'Utensils', 4),
('other', 'Other business types', 'MoreHorizontal', 5)
ON CONFLICT (name) DO NOTHING;

-- RLS for categories (public read)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON product_categories FOR SELECT
  USING (true);

-- ============================================================================
-- INTEREST TAGS (for targeting)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interest_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common interest tags
INSERT INTO interest_tags (name, category) VALUES
-- Technology
('Technology', 'tech'),
('Gaming', 'tech'),
('Mobile Apps', 'tech'),
('Software', 'tech'),
-- Lifestyle
('Fashion', 'lifestyle'),
('Beauty', 'lifestyle'),
('Fitness', 'lifestyle'),
('Health', 'lifestyle'),
('Travel', 'lifestyle'),
-- Food & Drink
('Food', 'food'),
('Restaurants', 'food'),
('Cooking', 'food'),
('Coffee', 'food'),
-- Business
('Business', 'business'),
('Marketing', 'business'),
('Finance', 'business'),
('Real Estate', 'business'),
-- Entertainment
('Music', 'entertainment'),
('Movies', 'entertainment'),
('Sports', 'entertainment'),
('Books', 'entertainment'),
-- Shopping
('Shopping', 'shopping'),
('Luxury Goods', 'shopping'),
('Home Decor', 'shopping'),
('Electronics', 'shopping')
ON CONFLICT (name) DO NOTHING;

-- RLS for interest tags (public read)
ALTER TABLE interest_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interest tags"
  ON interest_tags FOR SELECT
  USING (true);
