import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MySubscription() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile) {
      loadSubscription();
    }
  }, [profile, authLoading]);

  async function loadSubscription() {
    if (!profile) return;

    try {
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      
      setSubscription(subData);
      setPlan(subData?.subscription_plans);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card className="bg-gray-800/50 border-gray-700 max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">No Active Subscription</h2>
              <p className="text-gray-400 mb-6">Subscribe to a plan to access all features</p>
              <Button onClick={() => navigate('/subscription')}>
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Subscription
        </h1>

        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white text-2xl">{plan?.display_name}</CardTitle>
                <CardDescription className="text-gray-400 mt-2">{plan?.description}</CardDescription>
              </div>
              <Badge className="bg-green-500">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Monthly Price</p>
                <p className="text-white text-2xl font-bold">₹{plan?.price_monthly}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Billing Cycle</p>
                <p className="text-white text-xl capitalize">{subscription.billing_cycle}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Next Billing Date</p>
                <p className="text-white">{subscription.next_billing_date}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Auto Renew</p>
                <p className="text-white">{subscription.auto_renew ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-white font-semibold mb-4">Usage This Month</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Campaigns</p>
                  <p className="text-white">
                    {subscription.campaigns_used} / {plan?.max_campaigns}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ads Created</p>
                  <p className="text-white">
                    {subscription.ads_created} / {plan?.max_ads_per_month}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">AI Generations</p>
                  <p className="text-white">
                    {subscription.ai_generations_used} / {plan?.ai_generations_per_month}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate('/subscription')}>
                Upgrade Plan
              </Button>
              <Button variant="outline">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
