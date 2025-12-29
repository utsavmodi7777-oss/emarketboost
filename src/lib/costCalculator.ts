import { CostCalculationInput, CostCalculationResult, AdType } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

/**
 * Production cost rates
 */
const PRODUCTION_COSTS = {
  ai_generated: 50, // Base AI generation cost
  upload_premade: 0, // No production cost for user uploads
  actor_ad: 0, // Calculated from actor rate
};

/**
 * Service fee configuration (percentage of total ad spend)
 */
const SERVICE_FEE_PERCENTAGE = 15; // 15% of platform costs

/**
 * Platform markup (our profit margin on ad spend)
 */
const PLATFORM_MARKUP_PERCENTAGE = 10; // 10% markup on ad costs

/**
 * Calculate total campaign cost
 * This is the core pricing engine for the platform
 */
export async function calculateCampaignCost(
  input: CostCalculationInput
): Promise<CostCalculationResult> {
  let productionCost = 0;

  // 1. Calculate production cost based on ad type
  if (input.adType === 'actor_ad' && input.actorId) {
    // Fetch actor rate from database
    const { data: actor } = await supabase
      .from('actors')
      .select('rate_per_day')
      .eq('id', input.actorId)
      .single();

    if (actor) {
      productionCost = actor.rate_per_day * input.durationDays;
    }
  } else if (input.adType === 'ai_generated') {
    productionCost = PRODUCTION_COSTS.ai_generated;
  } else {
    productionCost = PRODUCTION_COSTS.upload_premade;
  }

  // 2. Calculate platform costs (with markup)
  const platformCostBreakdown = {
    google: input.budgetGoogleAds * (1 + PLATFORM_MARKUP_PERCENTAGE / 100),
    instagram: input.budgetInstagramAds * (1 + PLATFORM_MARKUP_PERCENTAGE / 100),
    facebook: input.budgetFacebookAds * (1 + PLATFORM_MARKUP_PERCENTAGE / 100),
    youtube: input.budgetYoutubeAds * (1 + PLATFORM_MARKUP_PERCENTAGE / 100),
    total: 0,
  };

  platformCostBreakdown.total =
    platformCostBreakdown.google +
    platformCostBreakdown.instagram +
    platformCostBreakdown.facebook +
    platformCostBreakdown.youtube;

  // 3. Calculate service fee (percentage of platform costs)
  const serviceFee = platformCostBreakdown.total * (SERVICE_FEE_PERCENTAGE / 100);

  // 4. Calculate subtotal
  const subtotal = productionCost + platformCostBreakdown.total + serviceFee;

  // 5. Apply subscription discount if applicable
  const discountAmount = input.subscriptionDiscount
    ? subtotal * (input.subscriptionDiscount / 100)
    : 0;

  // 6. Final total
  const total = subtotal - discountAmount;

  return {
    productionCost,
    platformCostBreakdown,
    serviceFee,
    discountAmount,
    total: parseFloat(total.toFixed(2)),
  };
}

/**
 * Get cost breakdown for display in UI
 */
export function formatCostBreakdown(result: CostCalculationResult) {
  return {
    lineItems: [
      {
        label: 'Production Cost',
        amount: result.productionCost,
        description: 'Video creation, actor fees, or AI generation',
      },
      {
        label: 'Google Ads Budget',
        amount: result.platformCostBreakdown.google,
        description: 'Ad spend + 10% platform fee',
      },
      {
        label: 'Instagram Ads Budget',
        amount: result.platformCostBreakdown.instagram,
        description: 'Ad spend + 10% platform fee',
      },
      {
        label: 'Facebook Ads Budget',
        amount: result.platformCostBreakdown.facebook,
        description: 'Ad spend + 10% platform fee',
      },
      {
        label: 'YouTube Ads Budget',
        amount: result.platformCostBreakdown.youtube,
        description: 'Ad spend + 10% platform fee',
      },
      {
        label: 'Service Fee (15%)',
        amount: result.serviceFee,
        description: 'Campaign management and optimization',
      },
    ],
    discount: result.discountAmount,
    total: result.total,
  };
}

/**
 * Validate budget inputs
 */
export function validateBudgetInputs(input: CostCalculationInput): string[] {
  const errors: string[] = [];

  if (input.durationDays < 1) {
    errors.push('Campaign duration must be at least 1 day');
  }

  if (input.durationDays > 365) {
    errors.push('Campaign duration cannot exceed 365 days');
  }

  const totalBudget =
    input.budgetGoogleAds +
    input.budgetInstagramAds +
    input.budgetFacebookAds +
    input.budgetYoutubeAds;

  if (totalBudget < 10) {
    errors.push('Total ad budget must be at least $10');
  }

  if (input.adType === 'actor_ad' && !input.actorId) {
    errors.push('Please select an actor for actor-based ads');
  }

  return errors;
}
