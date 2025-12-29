-- ============================================================================
-- MARKETING SAAS PLATFORM - SUBSCRIPTION & PAYMENTS MODULE
-- Monthly subscription plans and payment tracking
-- ============================================================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan Details
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2), -- Optional yearly pricing
  currency TEXT DEFAULT 'INR',
  
  -- Features & Limits
  features JSONB, -- {campaigns_limit, ads_limit, platforms_limit, etc}
  max_campaigns INTEGER,
  max_ads_per_month INTEGER,
  max_budget_per_campaign DECIMAL(10, 2),
  platforms_included TEXT[], -- Platform access
  
  -- AI Features
  includes_ai_generation BOOLEAN DEFAULT false,
  ai_generations_per_month INTEGER DEFAULT 0,
  
  -- Support
  support_level TEXT DEFAULT 'email' CHECK (support_level IN ('email', 'priority', '24x7')),
  
  -- Plan Status
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  
  -- Subscription Period
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'trial',
    'active',
    'past_due',
    'cancelled',
    'expired',
    'suspended'
  )),
  
  -- Usage Tracking
  campaigns_used INTEGER DEFAULT 0,
  ads_created INTEGER DEFAULT 0,
  ai_generations_used INTEGER DEFAULT 0,
  
  -- Payment
  last_payment_date DATE,
  next_billing_date DATE,
  
  -- Metadata
  cancellation_date DATE,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Type
  payment_type TEXT NOT NULL CHECK (payment_type IN (
    'subscription',
    'ad_creation',
    'campaign_budget',
    'top_up',
    'refund'
  )),
  
  -- Related Records
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  advertisement_id UUID REFERENCES advertisements(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  
  -- Amount
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Payment Details
  payment_method TEXT CHECK (payment_method IN ('card', 'upi', 'netbanking', 'wallet', 'stripe')),
  payment_gateway TEXT, -- 'stripe', 'razorpay', etc
  transaction_id TEXT UNIQUE,
  gateway_response JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded',
    'disputed'
  )),
  
  -- Timestamps
  payment_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  
  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Line Items
  line_items JSONB, -- [{description, quantity, price, total}]
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  
  -- PDF
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods (saved cards, UPI, etc.)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Method Details
  method_type TEXT NOT NULL CHECK (method_type IN ('card', 'upi', 'netbanking', 'wallet')),
  
  -- Card Details (if card)
  card_last_4 TEXT,
  card_brand TEXT,
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  
  -- UPI Details (if UPI)
  upi_id TEXT,
  
  -- Gateway Token
  gateway_token TEXT,
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscriptions_dates ON user_subscriptions(start_date, end_date);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all subscriptions"
  ON user_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- ============================================================================
-- SEED DATA - Subscription Plans
-- ============================================================================
INSERT INTO subscription_plans (
  name,
  display_name,
  description,
  price_monthly,
  price_yearly,
  max_campaigns,
  max_ads_per_month,
  max_budget_per_campaign,
  platforms_included,
  includes_ai_generation,
  ai_generations_per_month,
  support_level,
  is_popular,
  display_order,
  features
) VALUES
(
  'starter',
  'Starter',
  'Perfect for small businesses just getting started',
  999.00,
  9990.00,
  5,
  10,
  10000.00,
  ARRAY['google_ads'],
  false,
  0,
  'email',
  false,
  1,
  '{"analytics": "basic", "custom_targeting": false, "advanced_reports": false}'::jsonb
),
(
  'growth',
  'Growth',
  'Ideal for growing businesses scaling their marketing',
  2499.00,
  24990.00,
  15,
  30,
  50000.00,
  ARRAY['google_ads', 'facebook', 'instagram'],
  true,
  10,
  'priority',
  true,
  2,
  '{"analytics": "advanced", "custom_targeting": true, "advanced_reports": true, "api_access": false}'::jsonb
),
(
  'pro',
  'Professional',
  'Complete marketing suite for established businesses',
  4999.00,
  49990.00,
  50,
  100,
  200000.00,
  ARRAY['google_ads', 'facebook', 'instagram', 'youtube', 'linkedin', 'twitter'],
  true,
  50,
  '24x7',
  false,
  3,
  '{"analytics": "advanced", "custom_targeting": true, "advanced_reports": true, "api_access": true, "dedicated_support": true, "white_label": false}'::jsonb
),
(
  'enterprise',
  'Enterprise',
  'Custom solution for large organizations',
  9999.00,
  99990.00,
  999,
  999,
  999999.00,
  ARRAY['google_ads', 'facebook', 'instagram', 'youtube', 'linkedin', 'twitter', 'tiktok'],
  true,
  999,
  '24x7',
  false,
  4,
  '{"analytics": "advanced", "custom_targeting": true, "advanced_reports": true, "api_access": true, "dedicated_support": true, "white_label": true, "custom_integration": true}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_user_id UUID,
  p_limit_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
  v_current_count INTEGER;
BEGIN
  -- Get active subscription
  SELECT us.*, sp.*
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  AND us.status = 'active'
  AND us.end_date >= CURRENT_DATE
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN false; -- No active subscription
  END IF;
  
  -- Check specific limit
  IF p_limit_type = 'campaigns' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM marketing_campaigns
    WHERE user_id = p_user_id
    AND status IN ('active', 'pending_approval', 'approved');
    
    RETURN v_current_count < v_subscription.max_campaigns;
    
  ELSIF p_limit_type = 'ads' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM advertisements
    WHERE user_id = p_user_id
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE);
    
    RETURN v_current_count < v_subscription.max_ads_per_month;
    
  ELSIF p_limit_type = 'ai_generations' THEN
    RETURN v_subscription.ai_generations_used < v_subscription.ai_generations_per_month;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := TO_CHAR(CURRENT_DATE, 'YY');
  v_month TEXT := TO_CHAR(CURRENT_DATE, 'MM');
  v_sequence INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM invoices
  WHERE invoice_number LIKE 'INV' || v_year || v_month || '%';
  
  RETURN 'INV' || v_year || v_month || LPAD(v_sequence::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
