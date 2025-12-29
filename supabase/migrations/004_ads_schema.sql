-- ============================================================================
-- MARKETING SAAS PLATFORM - ADS MODULE
-- Actors, AI Avatars, and Advertisement Creation
-- ============================================================================

-- Drop tables if they exist from previous failed runs
DROP TABLE IF EXISTS advertisements CASCADE;
DROP TABLE IF EXISTS ai_avatars CASCADE;
DROP TABLE IF EXISTS actors CASCADE;

-- Real Actors table
CREATE TABLE actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor Info
  name TEXT NOT NULL,
  profile_image_url TEXT,
  bio TEXT,
  specialization TEXT[], -- ['comedy', 'professional', 'lifestyle']
  
  -- Pricing
  cost_per_ad DECIMAL(10, 2) NOT NULL,
  delivery_days INTEGER DEFAULT 7,
  
  -- Portfolio
  sample_videos TEXT[], -- Array of video URLs
  total_ads_completed INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Avatars table
CREATE TABLE ai_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Avatar Info
  name TEXT NOT NULL,
  avatar_image_url TEXT NOT NULL,
  voice_type TEXT, -- 'male', 'female', 'neutral'
  language TEXT DEFAULT 'english',
  
  -- Pricing (based on duration)
  base_cost DECIMAL(10, 2) NOT NULL, -- Base cost for 30 seconds
  cost_per_additional_30s DECIMAL(10, 2) NOT NULL,
  
  -- Features
  supports_emotions BOOLEAN DEFAULT false,
  supports_gestures BOOLEAN DEFAULT false,
  max_duration_seconds INTEGER DEFAULT 180,
  
  -- Metadata
  is_premium BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advertisements table
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Ad Type
  ad_type TEXT NOT NULL CHECK (ad_type IN ('real_actor', 'ai_generated', 'uploaded')),
  
  -- For Real Actor Ads
  actor_id UUID REFERENCES actors(id) ON DELETE SET NULL,
  actor_instructions TEXT,
  
  -- For AI Generated Ads
  ai_avatar_id UUID REFERENCES ai_avatars(id) ON DELETE SET NULL,
  ai_script TEXT,
  ai_voice_settings JSONB,
  
  -- For Uploaded Ads
  uploaded_video_url TEXT,
  uploaded_video_duration INTEGER, -- seconds
  
  -- Generated/Final Video
  final_video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  
  -- Cost Breakdown
  base_cost DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  
  -- Status & Review
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',           -- User creating
    'pending',         -- Submitted for review
    'in_review',       -- Admin reviewing
    'needs_revision',  -- Admin requested changes
    'approved',        -- Ready for marketing
    'rejected',        -- Rejected by admin
    'active',          -- Currently in campaigns
    'completed',       -- Campaign finished
    'archived'         -- Archived
  )),
  
  -- Admin Review
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_feedback TEXT,
  revision_notes TEXT[],
  
  -- Payment
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  paid_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ads_user_id ON advertisements(user_id);
CREATE INDEX idx_ads_product_id ON advertisements(product_id);
CREATE INDEX idx_ads_status ON advertisements(status);
CREATE INDEX idx_ads_ad_type ON advertisements(ad_type);
CREATE INDEX idx_ads_created_at ON advertisements(created_at DESC);

-- RLS Policies for actors
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available actors"
  ON actors FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admin can manage actors"
  ON actors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for AI avatars
ALTER TABLE ai_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI avatars"
  ON ai_avatars FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage AI avatars"
  ON ai_avatars FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for advertisements
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ads"
  ON advertisements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ads"
  ON advertisements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft ads"
  ON advertisements FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'needs_revision'))
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all ads"
  ON advertisements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'service')
    )
  );

CREATE POLICY "Admin can update all ads"
  ON advertisements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'service')
    )
  );

-- Update trigger
CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ads_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_ads_updated_at();

-- ============================================================================
-- SEED DATA - Sample Actors
-- ============================================================================
INSERT INTO actors (name, profile_image_url, bio, specialization, cost_per_ad, delivery_days, sample_videos, is_available) VALUES
('Rahul Sharma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'Professional actor with 5+ years experience in commercial advertising', ARRAY['professional', 'corporate'], 5000.00, 5, ARRAY['https://example.com/sample1.mp4'], true),
('Priya Patel', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'Energetic personality perfect for lifestyle and beauty brands', ARRAY['lifestyle', 'beauty', 'fashion'], 4500.00, 5, ARRAY['https://example.com/sample2.mp4'], true),
('Amit Kumar', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'Comedy specialist, great for memorable ads', ARRAY['comedy', 'casual'], 4000.00, 7, ARRAY['https://example.com/sample3.mp4'], true),
('Sneha Reddy', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', 'Elegant presenter for luxury and premium brands', ARRAY['luxury', 'professional'], 6000.00, 5, ARRAY['https://example.com/sample4.mp4'], true),
('Vikram Singh', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', 'Sports & fitness expert for active lifestyle brands', ARRAY['sports', 'fitness'], 4500.00, 6, ARRAY['https://example.com/sample5.mp4'], true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA - Sample AI Avatars
-- ============================================================================
INSERT INTO ai_avatars (name, avatar_image_url, voice_type, language, base_cost, cost_per_additional_30s, supports_emotions, supports_gestures, is_premium) VALUES
('AI Sarah', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', 'female', 'english', 1000.00, 500.00, true, true, false),
('AI David', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', 'male', 'english', 1000.00, 500.00, true, true, false),
('AI Maya (Premium)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 'female', 'english', 2000.00, 800.00, true, true, true),
('AI Alex', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'neutral', 'english', 1200.00, 600.00, true, false, false),
('AI Priya', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb', 'female', 'hindi', 1500.00, 700.00, true, true, true)
ON CONFLICT DO NOTHING;
