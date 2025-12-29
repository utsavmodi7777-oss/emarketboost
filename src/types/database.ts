// Database Types - Auto-generated from Supabase schema

export type UserRole = 'user' | 'service' | 'admin';

export type ServiceType = 'brand_marketing' | 'ad_creation' | 'full_marketing';

export type AdType = 'actor_ad' | 'ai_generated' | 'upload_premade';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type CampaignStatus = 
  | 'pending' 
  | 'paid' 
  | 'in_review' 
  | 'approved' 
  | 'in_progress' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export type AvailabilityStatus = 'available' | 'busy' | 'offline';

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  subscription_plan_id: string | null;
  google_id: string | null;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billing_period: 'monthly' | 'annual';
  discount_percentage: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  cancelled_at: string | null;
}

export interface ServiceTeamMember {
  id: string;
  specialization: string[];
  assigned_campaigns: number;
  rating: number;
  total_completed: number;
  availability_status: AvailabilityStatus;
  created_at: string;
}

export interface Actor {
  id: string;
  name: string;
  profile_image: string | null;
  bio: string | null;
  category: string | null;
  rate_per_day: number;
  availability: boolean;
  rating: number;
  total_projects: number;
  created_at: string;
}

export interface TargetLocation {
  country: string;
  state?: string;
  city?: string;
  area?: string;
}

export interface CampaignRequest {
  id: string;
  user_id: string;
  assigned_to: string | null;
  
  // Campaign details
  service_type: ServiceType;
  ad_type: AdType;
  actor_id: string | null;
  
  // Targeting
  target_locations: TargetLocation[];
  is_worldwide: boolean;
  
  // Budget breakdown
  budget_google_ads: number;
  budget_instagram_ads: number;
  budget_facebook_ads: number;
  budget_youtube_ads: number;
  duration_days: number;
  
  // Cost calculation
  production_cost: number;
  platform_cost: number;
  service_fee: number;
  discount_amount: number;
  total_cost: number;
  
  // Payment
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  
  // Campaign status
  status: CampaignStatus;
  
  // Files
  uploaded_video_url: string | null;
  draft_video_urls: string[];
  final_video_url: string | null;
  
  // Metadata
  user_requirements: string | null;
  internal_notes: string | null;
  admin_notes: string | null;
  
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CampaignTask {
  id: string;
  campaign_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  campaign_id: string | null;
  action: string;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  campaign_id: string | null;
  event_type: string;
  platform: string | null;
  metrics: {
    impressions?: number;
    clicks?: number;
    cost?: number;
    conversions?: number;
    ctr?: number;
    cpc?: number;
  };
  recorded_at: string;
}

export interface Review {
  id: string;
  campaign_id: string;
  user_id: string;
  service_member_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  campaign_id: string;
  sender_id: string;
  message: string;
  attachments: string[];
  is_internal: boolean;
  created_at: string;
}

// Extended types with relations
export interface CampaignWithDetails extends CampaignRequest {
  user: Profile;
  assigned_service_member?: ServiceTeamMember & Profile;
  actor?: Actor;
  tasks: CampaignTask[];
  messages: Message[];
  analytics: AnalyticsEvent[];
}

export interface ProfileWithSubscription extends Profile {
  subscription?: Subscription & {
    plan: Plan;
  };
}

// Cost calculation input/output
export interface CostCalculationInput {
  adType: AdType;
  actorId?: string;
  durationDays: number;
  budgetGoogleAds: number;
  budgetInstagramAds: number;
  budgetFacebookAds: number;
  budgetYoutubeAds: number;
  subscriptionDiscount?: number;
}

export interface CostCalculationResult {
  productionCost: number;
  platformCostBreakdown: {
    google: number;
    instagram: number;
    facebook: number;
    youtube: number;
    total: number;
  };
  serviceFee: number;
  discountAmount: number;
  total: number;
}
