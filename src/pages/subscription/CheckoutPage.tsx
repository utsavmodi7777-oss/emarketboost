import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Shield, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QSpDFP29YfY9hGJ9u8VZVY7kGYhzWZVqTzO7EEwLwKyv5LAa8eKIrRv4zJ1IkiNFsNwH7gJeG6TxlOdBr6OMgzz00M8H7GQNf');

interface Plan {
  id: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  max_campaigns: number;
  max_ads_per_month: number;
  ai_generations_per_month: number;
  support_level: string;
}

function CheckoutForm({ plan, billingCycle }: { plan: Plan; billingCycle: 'monthly' | 'annual' }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_annual;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-2">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>{plan.display_name} Plan</span>
            <span>₹{amount}</span>
          </div>
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Billing Cycle</span>
            <span className="capitalize">{billingCycle}</span>
          </div>
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="flex justify-between text-white font-bold">
              <span>Total</span>
              <span>₹{amount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Lock className="h-4 w-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'google_pay', 'apple_pay'],
          }}
        />

        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Shield className="h-4 w-4" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay ₹{amount}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By confirming your subscription, you allow eMarketBoost to charge your payment method for this payment and future payments in accordance with their terms.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile && planId) {
      loadPlanAndCreatePaymentIntent();
    }
  }, [authLoading, profile, planId]);

  async function loadPlanAndCreatePaymentIntent() {
    try {
      // Load plan details
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      // Create payment intent (this would normally be done via backend/edge function)
      // For now, we'll create a demo client secret
      // In production, call your backend API or Supabase Edge Function
      const amount = billingCycle === 'monthly' ? planData.price_monthly : planData.price_annual;
      
      // TODO: Replace this with actual API call to create Stripe PaymentIntent
      const mockClientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
      setClientSecret(mockClientSecret);

      toast({
        title: "Demo Mode",
        description: "This is a demo checkout. In production, this would process real payments.",
      });

    } catch (error: any) {
      console.error('Error loading plan:', error);
      toast({
        title: "Error",
        description: "Failed to load plan details",
        variant: "destructive",
      });
      navigate("/subscription");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#3B82F6',
      colorBackground: '#1F2937',
      colorText: '#F3F4F6',
      colorDanger: '#EF4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Complete Your Subscription
            </h1>
            <p className="text-gray-400">Secure checkout with multiple payment options</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div>
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-white">{plan.display_name}</CardTitle>
                    {plan.is_popular && (
                      <Badge className="bg-blue-500">Most Popular</Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`flex-1 p-3 rounded-lg border ${
                        billingCycle === 'monthly'
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-700 text-gray-400'
                      }`}
                    >
                      <div className="text-sm">Monthly</div>
                      <div className="text-lg font-bold">₹{plan.price_monthly}</div>
                      <div className="text-xs">per month</div>
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`flex-1 p-3 rounded-lg border ${
                        billingCycle === 'annual'
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-700 text-gray-400'
                      }`}
                    >
                      <div className="text-sm">Annual</div>
                      <div className="text-lg font-bold">₹{plan.price_annual}</div>
                      <div className="text-xs">per year</div>
                      <Badge className="mt-1 bg-green-500 text-xs">Save 20%</Badge>
                    </button>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold mb-3">Plan Includes:</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {plan.max_campaigns} Campaigns
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {plan.max_ads_per_month} Ads per month
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {plan.ai_generations_per_month} AI Generations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {plan.support_level} Support
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        All major platforms included
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Payment Details</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance,
                      }}
                    >
                      <CheckoutForm plan={plan} billingCycle={billingCycle} />
                    </Elements>
                  )}
                </CardContent>
              </Card>

              <div className="mt-4 grid grid-cols-4 gap-4 opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-8 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-8 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-8 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-8 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
