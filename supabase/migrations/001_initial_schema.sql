-- EMarketBoost Database Schema
-- Three-Panel SaaS Platform with Real-time Sync

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (User roles & auth data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'service', 'admin')) DEFAULT 'user',
  subscription_plan_id UUID,
  google_id TEXT UNIQUE,
  auth_provider TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLANS TABLE (Subscription pricing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT CHECK (billing_period IN ('monthly', 'annual')),
  discount_percentage INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')) DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- ============================================================================
-- SERVICE_TEAM TABLE (Internal staff details)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_team (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization TEXT[], -- e.g., ['video_editing', 'ad_creation']
  assigned_campaigns INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_completed INTEGER DEFAULT 0,
  availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'offline')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTORS TABLE (Actor database with rates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS actors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  profile_image TEXT,
  bio TEXT,
  category TEXT, -- e.g., 'celebrity', 'model', 'voice_actor'
  rate_per_day DECIMAL(10,2) NOT NULL,
  availability BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_projects INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CAMPAIGN_REQUESTS TABLE (Main campaign data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES service_team(id),
  
  -- Campaign details
  service_type TEXT NOT NULL CHECK (service_type IN ('brand_marketing', 'ad_creation', 'full_marketing')),
  ad_type TEXT NOT NULL CHECK (ad_type IN ('actor_ad', 'ai_generated', 'upload_premade')),
  actor_id UUID REFERENCES actors(id),
  
  -- Targeting
  target_locations JSONB DEFAULT '[]'::jsonb, -- [{country, state, city, area}]
  is_worldwide BOOLEAN DEFAULT false,
  
  -- Budget breakdown
  budget_google_ads DECIMAL(10,2) DEFAULT 0,
  budget_instagram_ads DECIMAL(10,2) DEFAULT 0,
  budget_facebook_ads DECIMAL(10,2) DEFAULT 0,
  budget_youtube_ads DECIMAL(10,2) DEFAULT 0,
  duration_days INTEGER NOT NULL,
  
  -- Cost calculation
  production_cost DECIMAL(10,2) DEFAULT 0,
  platform_cost DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Campaign status
  status TEXT CHECK (status IN ('pending', 'paid', 'in_review', 'approved', 'in_progress', 'delivered', 'completed', 'cancelled')) DEFAULT 'pending',
  
  -- Files
  uploaded_video_url TEXT, -- User's uploaded video
  draft_video_urls JSONB DEFAULT '[]'::jsonb, -- Service team drafts
  final_video_url TEXT, -- Final deliverable
  
  -- Metadata
  user_requirements TEXT,
  internal_notes TEXT, -- Service team notes
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- CAMPAIGN_TASKS TABLE (Workflow tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaign_requests(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES service_team(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'review', 'completed')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS TABLE (Real-time alerts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  link TEXT, -- Optional link to campaign/task
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY_LOGS TABLE (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  campaign_id UUID REFERENCES campaign_requests(id),
  action TEXT NOT NULL, -- e.g., 'campaign_created', 'status_updated'
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS_EVENTS TABLE (Platform analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaign_requests(id),
  event_type TEXT NOT NULL, -- e.g., 'impression', 'click', 'conversion'
  platform TEXT, -- 'google', 'facebook', 'instagram', 'youtube'
  metrics JSONB DEFAULT '{}'::jsonb, -- {impressions: 1000, clicks: 50, cost: 25.50}
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS TABLE (User feedback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaign_requests(id),
  user_id UUID REFERENCES profiles(id),
  service_member_id UUID REFERENCES service_team(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MESSAGES TABLE (Campaign communication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaign_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_internal BOOLEAN DEFAULT false, -- Service/admin only
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service can view user profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('service', 'admin')
    )
  );

CREATE POLICY "Admin can do everything on profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PLANS POLICIES (Public read, admin write)
-- ============================================================================
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage plans"
  ON plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (true);

-- ============================================================================
-- ACTORS POLICIES (Public read, admin write)
-- ============================================================================
CREATE POLICY "Anyone can view available actors"
  ON actors FOR SELECT
  USING (availability = true);

CREATE POLICY "Admin can manage actors"
  ON actors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- CAMPAIGN_REQUESTS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own campaigns"
  ON campaign_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create campaigns"
  ON campaign_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own unpaid campaigns"
  ON campaign_requests FOR UPDATE
  USING (user_id = auth.uid() AND payment_status = 'pending');

CREATE POLICY "Service can view assigned campaigns"
  ON campaign_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('service', 'admin')
    )
  );

CREATE POLICY "Service can update assigned campaigns"
  ON campaign_requests FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can do everything on campaigns"
  ON campaign_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- ACTIVITY_LOGS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own activity"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all activity"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================
CREATE POLICY "Users can view campaign messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_requests
      WHERE id = campaign_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('service', 'admin')
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_google_id ON profiles(google_id);
CREATE INDEX idx_campaigns_user_id ON campaign_requests(user_id);
CREATE INDEX idx_campaigns_assigned_to ON campaign_requests(assigned_to);
CREATE INDEX idx_campaigns_status ON campaign_requests(status);
CREATE INDEX idx_campaigns_payment_status ON campaign_requests(payment_status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_campaign_id ON activity_logs(campaign_id);
CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaign_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Auto-create profile on signup (handles OAuth and email/phone)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  provider_type TEXT;
  google_sub TEXT;
BEGIN
  -- Detect provider type
  provider_type := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  
  -- Extract Google ID if Google OAuth
  IF provider_type = 'google' THEN
    google_sub := NEW.raw_user_meta_data->>'sub';
  END IF;
  
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    phone,
    role,
    google_id,
    auth_provider
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.phone,
    'user', -- Default role
    google_sub,
    provider_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- REALTIME PUBLICATION (Enable real-time subscriptions)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_tasks;
