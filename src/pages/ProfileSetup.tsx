import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setSession(session);
  }

  async function createProfile() {
    if (!session) {
      toast({
        title: "Error",
        description: "No active session found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          role: 'user',
          auth_provider: session.user.app_metadata?.provider || 'email'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation - profile already exists
          toast({
            title: "Profile exists",
            description: "Your profile already exists. Redirecting...",
          });
          navigate("/dashboard");
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile created successfully!",
      });
      
      // Wait a moment then redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900/90 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl text-white">Profile Setup Required</CardTitle>
          <CardDescription className="text-gray-400">
            We need to set up your profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300 mb-2">
              <strong>Email:</strong> {session?.user?.email}
            </p>
            <p className="text-sm text-gray-300">
              <strong>ID:</strong> {session?.user?.id?.substring(0, 8)}...
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Click the button below to create your profile and access the dashboard.
          </p>

          <Button
            onClick={createProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile & Continue"
            )}
          </Button>

          <Button
            onClick={signOut}
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Sign Out
          </Button>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              If this issue persists, please contact support
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
