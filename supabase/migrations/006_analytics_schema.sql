-- ============================================================================
-- MARKETING SAAS PLATFORM - ANALYTICS MODULE
-- Track campaign performance, user engagement, conversions
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS analytics_daily_summary CASCADE;
DROP TABLE IF EXISTS user_analytics CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;

-- Analytics Events (track individual events)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES marketing_platforms(id) ON DELETE SET NULL,
  
  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'impression',
    'click',
    'view',
    'engagement',
    'conversion',
    'purchase',
    'signup',
    'add_to_cart',
    'video_view',
    'video_complete'
  )),
  
  -- Event Metadata
  user_location JSONB, -- {country, city, area}
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  browser TEXT,
  referrer TEXT,
  
  -- Value
  conversion_value DECIMAL(10, 2),
  
  -- Timestamp
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Analytics Summary (aggregated per day)
CREATE TABLE analytics_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES marketing_platforms(id) ON DELETE SET NULL,
  
  date DATE NOT NULL,
  
  -- Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  video_completions INTEGER DEFAULT 0,
  
  -- Conversions
  conversions INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  add_to_carts INTEGER DEFAULT 0,
  
  -- Financial
  spend DECIMAL(10, 2) DEFAULT 0.00,
  revenue DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Calculated Metrics
  ctr DECIMAL(5, 2) DEFAULT 0.00, -- Click-through rate
  cpc DECIMAL(10, 2) DEFAULT 0.00, -- Cost per click
  cpm DECIMAL(10, 2) DEFAULT 0.00, -- Cost per 1000 impressions
  roas DECIMAL(10, 2) DEFAULT 0.00, -- Return on ad spend
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, platform_id, date)
);

-- User Analytics (overall user statistics)
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall Stats
  total_campaigns INTEGER DEFAULT 0,
  active_campaigns INTEGER DEFAULT 0,
  total_spend DECIMAL(10, 2) DEFAULT 0.00,
  total_revenue DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Performance
  total_impressions BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  total_conversions BIGINT DEFAULT 0,
  average_ctr DECIMAL(5, 2) DEFAULT 0.00,
  average_roas DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Updated
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign ON analytics_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_campaign ON analytics_daily_summary(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON user_analytics(user_id);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = analytics_events.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'service')
    )
  );

ALTER TABLE analytics_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign summary"
  ON analytics_daily_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = analytics_daily_summary.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all summaries"
  ON analytics_daily_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'service')
    )
  );

ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all user analytics"
  ON user_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics_daily_summary (
    campaign_id,
    platform_id,
    date,
    impressions,
    clicks,
    reach,
    engagements,
    conversions
  )
  SELECT
    campaign_id,
    platform_id,
    p_date,
    COUNT(*) FILTER (WHERE event_type = 'impression'),
    COUNT(*) FILTER (WHERE event_type = 'click'),
    COUNT(DISTINCT user_location->>'user_id') FILTER (WHERE event_type = 'impression'),
    COUNT(*) FILTER (WHERE event_type = 'engagement'),
    COUNT(*) FILTER (WHERE event_type = 'conversion')
  FROM analytics_events
  WHERE DATE(created_at) = p_date
  GROUP BY campaign_id, platform_id
  ON CONFLICT (campaign_id, platform_id, date)
  DO UPDATE SET
    impressions = EXCLUDED.impressions,
    clicks = EXCLUDED.clicks,
    reach = EXCLUDED.reach,
    engagements = EXCLUDED.engagements,
    conversions = EXCLUDED.conversions,
    updated_at = NOW();
    
  -- Calculate derived metrics
  UPDATE analytics_daily_summary
  SET
    ctr = CASE WHEN impressions > 0 THEN (clicks::DECIMAL / impressions * 100) ELSE 0 END,
    cpc = CASE WHEN clicks > 0 THEN (spend / clicks) ELSE 0 END,
    cpm = CASE WHEN impressions > 0 THEN (spend / impressions * 1000) ELSE 0 END,
    roas = CASE WHEN spend > 0 THEN (revenue / spend) ELSE 0 END
  WHERE date = p_date;
END;
$$ LANGUAGE plpgsql;

-- Function to update user analytics
CREATE OR REPLACE FUNCTION update_user_analytics(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_analytics (
    user_id,
    total_campaigns,
    active_campaigns,
    total_spend,
    total_impressions,
    total_clicks,
    total_conversions
  )
  SELECT
    p_user_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COALESCE(SUM(total_spent), 0),
    COALESCE(SUM(cps.impressions), 0),
    COALESCE(SUM(cps.clicks), 0),
    COALESCE(SUM(cps.conversions), 0)
  FROM marketing_campaigns mc
  LEFT JOIN campaign_platform_stats cps ON mc.id = cps.campaign_id
  WHERE mc.user_id = p_user_id
  GROUP BY mc.user_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_campaigns = EXCLUDED.total_campaigns,
    active_campaigns = EXCLUDED.active_campaigns,
    total_spend = EXCLUDED.total_spend,
    total_impressions = EXCLUDED.total_impressions,
    total_clicks = EXCLUDED.total_clicks,
    total_conversions = EXCLUDED.total_conversions,
    average_ctr = CASE 
      WHEN EXCLUDED.total_impressions > 0 
      THEN (EXCLUDED.total_clicks::DECIMAL / EXCLUDED.total_impressions * 100) 
      ELSE 0 
    END,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DUMMY ANALYTICS DATA (for testing)
-- ============================================================================

-- This will be populated by actual campaign events
-- For now, create a function to generate dummy data for a campaign

CREATE OR REPLACE FUNCTION generate_dummy_analytics(
  p_campaign_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS VOID AS $$
DECLARE
  current_date DATE := CURRENT_DATE - p_days;
  platform_record RECORD;
BEGIN
  -- For each platform in campaign
  FOR platform_record IN 
    SELECT DISTINCT platform_id FROM campaign_platform_stats WHERE campaign_id = p_campaign_id
  LOOP
    -- Generate daily summaries
    FOR i IN 0..p_days LOOP
      INSERT INTO analytics_daily_summary (
        campaign_id,
        platform_id,
        date,
        impressions,
        clicks,
        reach,
        engagements,
        conversions,
        spend,
        revenue
      ) VALUES (
        p_campaign_id,
        platform_record.platform_id,
        current_date + i,
        (RANDOM() * 10000 + 1000)::INTEGER,
        (RANDOM() * 500 + 50)::INTEGER,
        (RANDOM() * 5000 + 500)::INTEGER,
        (RANDOM() * 200 + 20)::INTEGER,
        (RANDOM() * 50 + 5)::INTEGER,
        (RANDOM() * 100 + 10)::DECIMAL(10,2),
        (RANDOM() * 500 + 50)::DECIMAL(10,2)
      )
      ON CONFLICT (campaign_id, platform_id, date) DO NOTHING;
    END LOOP;
  END LOOP;
  
  -- Recalculate metrics
  PERFORM aggregate_daily_analytics(current_date + i) FROM generate_series(0, p_days) i;
END;
$$ LANGUAGE plpgsql;
