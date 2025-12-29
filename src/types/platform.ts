// ============================================================================
// TYPE DEFINITIONS - Complete Marketing SaaS Platform
// ============================================================================

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: 'product' | 'service' | 'shop' | 'restaurant' | 'other';
  description?: string;
  price?: number;
  logo_url?: string;
  images?: string[];
  target_age_min?: number;
  target_age_max?: number;
  target_gender?: 'male' | 'female' | 'all';
  target_interests?: string[];
  target_location?: {
    country?: string;
    city?: string;
    area?: string;
  };
  status: 'draft' | 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Actor {
  id: string;
  name: string;
  profile_image_url?: string;
  bio?: string;
  specialization?: string[];
  cost_per_ad: number;
  delivery_days: number;
  sample_videos?: string[];
  total_ads_completed: number;
  rating: number;
  is_available: boolean;
  status: 'active' | 'inactive' | 'busy';
}

export interface AIAvatar {
  id: string;
  name: string;
  avatar_image_url: string;
  voice_type?: 'male' | 'female' | 'neutral';
  language: string;
  base_cost: number;
  cost_per_additional_30s: number;
  supports_emotions: boolean;
  supports_gestures: boolean;
  max_duration_seconds: number;
  is_premium: boolean;
  status: 'active' | 'inactive';
}

export interface Advertisement {
  id: string;
  user_id: string;
  product_id?: string;
  ad_type: 'real_actor' | 'ai_generated' | 'uploaded';
  
  // Real Actor
  actor_id?: string;
  actor_instructions?: string;
  actor?: Actor;
  
  // AI Generated
  ai_avatar_id?: string;
  ai_script?: string;
  ai_voice_settings?: Record<string, any>;
  ai_avatar?: AIAvatar;
  
  // Uploaded
  uploaded_video_url?: string;
  uploaded_video_duration?: number;
  
  // Final Video
  final_video_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  
  // Cost
  base_cost?: number;
  platform_fee?: number;
  total_cost?: number;
  
  // Status
  status: 'draft' | 'pending' | 'in_review' | 'needs_revision' | 'approved' | 'rejected' | 'active' | 'completed' | 'archived';
  reviewed_by?: string;
  reviewed_at?: string;
  admin_feedback?: string;
  revision_notes?: string[];
  
  // Payment
  payment_status: 'unpaid' | 'paid' | 'refunded';
  paid_at?: string;
  
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface MarketingPlatform {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
  description?: string;
  base_cpm?: number;
  base_cpc?: number;
  supports_video: boolean;
  supports_image: boolean;
  min_budget?: number;
  is_active: boolean;
}

export interface MarketingCampaign {
  id: string;
  user_id: string;
  product_id?: string;
  advertisement_id?: string;
  campaign_name: string;
  objective?: 'reach' | 'engagement' | 'conversions' | 'traffic' | 'awareness';
  
  // Platforms
  platforms: {
    platform_id: string;
    budget_allocated: number;
    status: string;
  }[];
  
  // Location
  target_countries?: string[];
  target_cities?: string[];
  target_areas?: string[];
  location_hierarchy?: Record<string, any>;
  
  // Budget
  total_budget: number;
  daily_budget?: number;
  duration_months: number;
  start_date?: string;
  end_date?: string;
  
  // Plan
  plan_type?: 'basic' | 'standard' | 'premium' | 'enterprise';
  
  // Estimates
  estimated_reach?: number;
  estimated_impressions?: number;
  estimated_clicks?: number;
  estimated_ctr?: number;
  
  // Status
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  paid_at?: string;
  total_spent: number;
  
  created_at: string;
  updated_at: string;
  
  product?: Product;
  advertisement?: Advertisement;
}

export interface CampaignPlatformStats {
  id: string;
  campaign_id: string;
  platform_id: string;
  allocated_budget?: number;
  spent_budget: number;
  impressions: number;
  clicks: number;
  reach: number;
  engagements: number;
  conversions: number;
  ctr: number;
  platform?: MarketingPlatform;
}

export interface AnalyticsDailySummary {
  id: string;
  campaign_id: string;
  platform_id?: string;
  date: string;
  impressions: number;
  clicks: number;
  reach: number;
  engagements: number;
  video_views: number;
  video_completions: number;
  conversions: number;
  purchases: number;
  signups: number;
  add_to_carts: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  total_campaigns: number;
  active_campaigns: number;
  total_spend: number;
  total_revenue: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  average_ctr: number;
  average_roas: number;
  last_updated: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  currency: string;
  features?: Record<string, any>;
  max_campaigns?: number;
  max_ads_per_month?: number;
  max_budget_per_campaign?: number;
  platforms_included?: string[];
  includes_ai_generation: boolean;
  ai_generations_per_month: number;
  support_level: 'email' | 'priority' | '24x7';
  is_active: boolean;
  is_popular: boolean;
  display_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'suspended';
  campaigns_used: number;
  ads_created: number;
  ai_generations_used: number;
  last_payment_date?: string;
  next_billing_date?: string;
  cancellation_date?: string;
  cancellation_reason?: string;
  plan?: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  payment_type: 'subscription' | 'ad_creation' | 'campaign_budget' | 'top_up' | 'refund';
  subscription_id?: string;
  advertisement_id?: string;
  campaign_id?: string;
  amount: number;
  currency: string;
  payment_method?: 'card' | 'upi' | 'netbanking' | 'wallet' | 'stripe';
  payment_gateway?: string;
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  payment_date?: string;
  completed_at?: string;
  failed_at?: string;
  refunded_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  payment_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  line_items?: {
    description: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  country: string;
  country_code?: string;
  state_province?: string;
  city?: string;
  area_locality?: string;
  parent_id?: string;
  level: 'country' | 'state' | 'city' | 'area';
  population?: number;
  is_active: boolean;
}

// Form Types
export interface ProductFormData {
  name: string;
  category: Product['category'];
  description?: string;
  price?: number;
  logo_url?: string;
  images?: string[];
  target_age_min?: number;
  target_age_max?: number;
  target_gender?: Product['target_gender'];
  target_interests?: string[];
  target_location?: Product['target_location'];
}

export interface AdCreationFormData {
  product_id?: string;
  ad_type: Advertisement['ad_type'];
  actor_id?: string;
  actor_instructions?: string;
  ai_avatar_id?: string;
  ai_script?: string;
  uploaded_video_url?: string;
}

export interface CampaignFormData {
  product_id?: string;
  advertisement_id?: string;
  campaign_name: string;
  objective?: MarketingCampaign['objective'];
  platforms: {
    platform_id: string;
    budget_allocated: number;
  }[];
  target_countries?: string[];
  target_cities?: string[];
  target_areas?: string[];
  total_budget: number;
  duration_months: number;
  start_date?: string;
}
