-- ============================================================================
-- MARKETING SAAS PLATFORM - MARKETING CAMPAIGNS MODULE
-- Marketing plans, platform targeting, location targeting, budgets
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS campaign_platform_stats CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS marketing_platforms CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Marketing Platforms (Instagram, Facebook, Google Ads, YouTube, etc.)
CREATE TABLE marketing_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  
  -- Pricing factors
  base_cpm DECIMAL(10, 2), -- Cost per 1000 impressions
  base_cpc DECIMAL(10, 2), -- Cost per click
  
  -- Platform capabilities
  supports_video BOOLEAN DEFAULT true,
  supports_image BOOLEAN DEFAULT true,
  min_budget DECIMAL(10, 2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  advertisement_id UUID REFERENCES advertisements(id) ON DELETE SET NULL,
  
  -- Campaign Info
  campaign_name TEXT NOT NULL,
  objective TEXT CHECK (objective IN ('reach', 'engagement', 'conversions', 'traffic', 'awareness')),
  
  -- Selected Platforms
  platforms JSONB NOT NULL, -- [{platform_id, budget_allocated, status}]
  
  -- Location Targeting
  target_countries TEXT[],
  target_cities TEXT[],
  target_areas TEXT[], -- Specific localities
  location_hierarchy JSONB, -- {country -> [cities] -> [areas]}
  
  -- Budget & Duration
  total_budget DECIMAL(10, 2) NOT NULL,
  daily_budget DECIMAL(10, 2),
  duration_months INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  
  -- Plan Type (based on budget)
  plan_type TEXT CHECK (plan_type IN ('basic', 'standard', 'premium', 'enterprise')),
  
  -- Estimated Metrics (calculated)
  estimated_reach INTEGER,
  estimated_impressions INTEGER,
  estimated_clicks INTEGER,
  estimated_ctr DECIMAL(5, 2), -- Click-through rate %
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_approval',
    'approved',
    'active',
    'paused',
    'completed',
    'cancelled'
  )),
  
  -- Payment
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  paid_at TIMESTAMPTZ,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Platform Performance (per-platform breakdown)
CREATE TABLE campaign_platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES marketing_platforms(id) ON DELETE CASCADE,
  
  -- Budget for this platform
  allocated_budget DECIMAL(10, 2),
  spent_budget DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Time-series data
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, platform_id)
);

-- Location Hierarchy (for dropdown selection)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  country TEXT NOT NULL,
  country_code TEXT,
  state_province TEXT,
  city TEXT,
  area_locality TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES locations(id),
  level TEXT CHECK (level IN ('country', 'state', 'city', 'area')),
  
  -- Metadata
  population INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_platform_stats_campaign ON campaign_platform_stats(campaign_id);
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);

-- RLS Policies for marketing platforms
ALTER TABLE marketing_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active platforms"
  ON marketing_platforms FOR SELECT
  USING (is_active = true);

-- RLS Policies for marketing campaigns
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns"
  ON marketing_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON marketing_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON marketing_campaigns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all campaigns"
  ON marketing_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'service')
    )
  );

-- RLS for campaign stats
ALTER TABLE campaign_platform_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign stats"
  ON campaign_platform_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = campaign_platform_stats.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all campaign stats"
  ON campaign_platform_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'service')
    )
  );

-- RLS for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active locations"
  ON locations FOR SELECT
  USING (is_active = true);

-- Update trigger
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- ============================================================================
-- SEED DATA - Marketing Platforms
-- ============================================================================
INSERT INTO marketing_platforms (name, display_name, icon, description, base_cpm, base_cpc, supports_video, supports_image, min_budget, is_active) VALUES
('google_ads', 'Google Ads', 'https://www.google.com/favicon.ico', 'Search and display advertising on Google', 2.50, 1.50, true, true, 500.00, true),
('facebook', 'Facebook', 'https://www.facebook.com/favicon.ico', 'Social media advertising on Facebook', 5.00, 0.80, true, true, 300.00, true),
('instagram', 'Instagram', 'https://www.instagram.com/favicon.ico', 'Visual advertising on Instagram', 6.00, 1.00, true, true, 400.00, true),
('youtube', 'YouTube', 'https://www.youtube.com/favicon.ico', 'Video advertising on YouTube', 8.00, 0.50, true, false, 1000.00, true),
('linkedin', 'LinkedIn', 'https://www.linkedin.com/favicon.ico', 'Professional network advertising', 10.00, 2.00, true, true, 800.00, true),
('twitter', 'Twitter/X', 'https://twitter.com/favicon.ico', 'Social media advertising on X', 7.00, 1.20, true, true, 500.00, true),
('tiktok', 'TikTok', 'https://www.tiktok.com/favicon.ico', 'Short-form video advertising', 9.00, 1.50, true, false, 600.00, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA - Sample Locations (India example)
-- ============================================================================
INSERT INTO locations (country, country_code, level, is_active) VALUES
('India', 'IN', 'country', true),
('United States', 'US', 'country', true),
('United Kingdom', 'UK', 'country', true)
ON CONFLICT DO NOTHING;

-- Get India's ID for child locations
DO $$
DECLARE
  india_id UUID;
BEGIN
  SELECT id INTO india_id FROM locations WHERE country = 'India' LIMIT 1;
  
  -- Major Indian cities
  INSERT INTO locations (country, country_code, city, level, parent_id, is_active) VALUES
  ('India', 'IN', 'Mumbai', 'city', india_id, true),
  ('India', 'IN', 'Delhi', 'city', india_id, true),
  ('India', 'IN', 'Bangalore', 'city', india_id, true),
  ('India', 'IN', 'Hyderabad', 'city', india_id, true),
  ('India', 'IN', 'Chennai', 'city', india_id, true),
  ('India', 'IN', 'Kolkata', 'city', india_id, true),
  ('India', 'IN', 'Pune', 'city', india_id, true),
  ('India', 'IN', 'Ahmedabad', 'city', india_id, true)
  ON CONFLICT DO NOTHING;
END $$;

-- Function to calculate campaign estimates
CREATE OR REPLACE FUNCTION calculate_campaign_estimates(
  p_budget DECIMAL,
  p_duration_months INTEGER,
  p_platforms JSONB
)
RETURNS TABLE (
  estimated_reach INTEGER,
  estimated_impressions INTEGER,
  estimated_clicks INTEGER,
  estimated_ctr DECIMAL
) AS $$
DECLARE
  daily_budget DECIMAL;
  avg_cpm DECIMAL := 6.00;
  avg_cpc DECIMAL := 1.00;
  avg_ctr DECIMAL := 2.50;
BEGIN
  daily_budget := p_budget / (p_duration_months * 30);
  
  RETURN QUERY SELECT
    CAST((p_budget / avg_cpc) * 0.1 AS INTEGER) as estimated_reach,
    CAST((p_budget / avg_cpm) * 1000 AS INTEGER) as estimated_impressions,
    CAST((p_budget / avg_cpc) AS INTEGER) as estimated_clicks,
    avg_ctr as estimated_ctr;
END;
$$ LANGUAGE plpgsql;
