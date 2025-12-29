/**
 * Stripe Payment Integration
 * Handles campaign payment processing
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe (get publishable key from environment)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a payment intent for a campaign
 */
export async function createCampaignPayment(
  campaignId: string,
  amount: number
): Promise<PaymentIntent> {
  // In production, this would call your backend API
  // For now, we'll use Supabase Edge Functions or direct Stripe API
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // TODO: Call Stripe API via secure backend
  // This is a simplified example - in production use Supabase Edge Functions
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      campaignId,
      amount: Math.round(amount * 100), // Convert to cents
    }),
  });

  if (!response.ok) {
    throw new Error('Payment intent creation failed');
  }

  return await response.json();
}

/**
 * Process payment for a campaign
 */
export async function processCampaignPayment(
  campaignId: string,
  amount: number
): Promise<boolean> {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    // Create payment intent
    const paymentIntent = await createCampaignPayment(campaignId, amount);

    // Redirect to Stripe Checkout
    const { error } = await stripe.confirmPayment({
      clientSecret: paymentIntent.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/campaign/${campaignId}?payment=success`,
      },
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Payment error:', error);
    return false;
  }
}

/**
 * Create Stripe Checkout Session (alternative to Payment Intent)
 */
export async function createCheckoutSession(
  campaignId: string,
  amount: number
): Promise<void> {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe not loaded');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // Call backend to create checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      campaignId,
      amount: Math.round(amount * 100),
      successUrl: `${window.location.origin}/campaign/${campaignId}?payment=success`,
      cancelUrl: `${window.location.origin}/campaign/${campaignId}?payment=cancelled`,
    }),
  });

  const { sessionId } = await response.json();

  // Redirect to Stripe Checkout
  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    throw error;
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(campaignId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('campaign_requests')
    .select('payment_status, stripe_payment_intent_id')
    .eq('id', campaignId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.payment_status === 'paid';
}

/**
 * Handle successful payment webhook
 * This should be called from your backend webhook handler
 */
export async function handlePaymentSuccess(
  campaignId: string,
  paymentIntentId: string
): Promise<void> {
  // Update campaign payment status
  await supabase
    .from('campaign_requests')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
      status: 'paid', // Move to paid status so service team can see it
    })
    .eq('id', campaignId);

  // Get campaign details
  const { data: campaign } = await supabase
    .from('campaign_requests')
    .select('user_id')
    .eq('id', campaignId)
    .single();

  if (campaign) {
    // Create notification for user
    await supabase.from('notifications').insert({
      user_id: campaign.user_id,
      title: 'Payment Successful',
      message: 'Your campaign payment has been processed. Our team will start working on it shortly.',
      type: 'success',
      link: `/campaign/${campaignId}`,
    });

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: campaign.user_id,
      campaign_id: campaignId,
      action: 'payment_completed',
      details: { payment_intent_id: paymentIntentId },
    });
  }
}

/**
 * Refund a payment
 * Admin only functionality
 */
export async function refundPayment(
  campaignId: string,
  amount?: number
): Promise<boolean> {
  const { data: campaign } = await supabase
    .from('campaign_requests')
    .select('stripe_payment_intent_id, total_cost')
    .eq('id', campaignId)
    .single();

  if (!campaign?.stripe_payment_intent_id) {
    throw new Error('No payment found for this campaign');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // Call backend to process refund
  const response = await fetch('/api/refund-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      paymentIntentId: campaign.stripe_payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
    }),
  });

  if (!response.ok) {
    throw new Error('Refund failed');
  }

  // Update campaign status
  await supabase
    .from('campaign_requests')
    .update({ payment_status: 'refunded' })
    .eq('id', campaignId);

  return true;
}
