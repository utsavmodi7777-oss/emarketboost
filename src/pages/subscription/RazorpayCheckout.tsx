import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Shield, Lock, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  is_popular: boolean;
}

export default function RazorpayCheckout() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile && planId) {
      loadPlan();
    }
  }, [authLoading, profile, planId]);

  async function loadPlan() {
    try {
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      setPlan(planData);
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

  const handlePayment = async () => {
    if (!plan || !profile) return;

    setIsProcessing(true);

    const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_annual;
    const amountInPaise = amount * 100; // Convert to paise (Razorpay uses smallest currency unit)

    try {
      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key', // Replace with your key
        amount: amountInPaise,
        currency: 'INR',
        name: 'eMarketBoost',
        description: `${plan.display_name} Plan - ${billingCycle}`,
        image: '/logo.png',
        prefill: {
          name: profile.full_name || '',
          email: profile.email || '',
          contact: profile.phone || '',
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async function (response: any) {
          // Payment successful
          console.log('Payment successful:', response);
          
          // Save subscription to database
          try {
            const { error } = await supabase
              .from('subscriptions')
              .insert({
                user_id: profile.id,
                plan_id: plan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(
                  Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
                ).toISOString(),
              });

            if (error) throw error;

            toast({
              title: "Payment Successful!",
              description: "Your subscription is now active.",
            });

            navigate('/subscription/success?payment_id=' + response.razorpay_payment_id);
          } catch (error: any) {
            console.error('Error saving subscription:', error);
            toast({
              title: "Error",
              description: "Payment successful but failed to activate subscription. Please contact support.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
            });
          }
        },
        notes: {
          plan_id: plan.id,
          user_id: profile.id,
          billing_cycle: billingCycle,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

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

  const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_annual;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Complete Your Subscription
            </h1>
            <p className="text-gray-400">Secure checkout with Razorpay - India's trusted payment gateway</p>
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
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        billingCycle === 'monthly'
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-sm">Monthly</div>
                      <div className="text-lg font-bold">₹{plan.price_monthly}</div>
                      <div className="text-xs">per month</div>
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        billingCycle === 'annual'
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
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

            {/* Payment Details */}
            <div>
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Payment Details</CardTitle>
                  <CardDescription className="text-gray-400">
                    Pay securely with Razorpay
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        <div className="flex justify-between text-white font-bold text-lg">
                          <span>Total</span>
                          <span>₹{amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Lock className="h-4 w-4" />
                      <span>Secure payment powered by Razorpay</span>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-blue-400" />
                        Multiple Payment Options
                      </h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-400" />
                          Credit/Debit Cards (Visa, Mastercard, RuPay)
                        </li>
                        <li className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-green-400" />
                          UPI (Google Pay, PhonePe, Paytm, etc.)
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-orange-400" />
                          Net Banking
                        </li>
                        <li className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-purple-400" />
                          Wallets (Paytm, Mobikwik, etc.)
                        </li>
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Shield className="h-4 w-4" />
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
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
                </CardContent>
              </Card>

              {/* Payment Method Logos */}
              <div className="mt-4 flex items-center justify-center gap-4 opacity-60">
                <div className="text-xs text-gray-500">Powered by</div>
                <img 
                  src="https://razorpay.com/assets/razorpay-glyph.svg" 
                  alt="Razorpay" 
                  className="h-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
