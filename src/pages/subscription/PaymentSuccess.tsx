import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    // You can verify the payment here by calling your backend
    if (paymentIntent) {
      console.log('Payment Intent:', paymentIntent);
      // TODO: Verify payment and update subscription status
    }
  }, [paymentIntent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-xl text-center">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-3xl text-white mb-2">
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-400 text-lg">
                Thank you for subscribing to eMarketBoost. Your subscription is now active!
              </p>

              <div className="bg-gray-800/50 rounded-lg p-6 space-y-3 text-left">
                <h3 className="text-white font-semibold text-lg mb-3">What's Next?</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Access your dashboard</strong>
                      <p className="text-sm text-gray-400">Start creating campaigns and managing your marketing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Check your email</strong>
                      <p className="text-sm text-gray-400">We've sent you a confirmation with your subscription details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Explore features</strong>
                      <p className="text-sm text-gray-400">Take advantage of all the tools included in your plan</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate('/subscription/manage')}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  size="lg"
                >
                  Manage Subscription
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Payment ID: {paymentIntent || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
