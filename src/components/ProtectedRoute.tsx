import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "service" | "admin";
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Ensures user is authenticated before accessing protected pages
 * Redirects to login if not authenticated
 */
export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = "/auth" 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  useEffect(() => {
    async function checkAuth() {
      // Wait for auth to load
      if (loading) return;

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Not logged in - redirect to login
        navigate(redirectTo, { 
          state: { message: "Please login to access this page" },
          replace: true 
        });
        return;
      }

      // Check role if specified
      if (requiredRole && profile?.role !== requiredRole) {
        // Wrong role - redirect to appropriate dashboard
        if (profile?.role === "admin") {
          navigate("/admin");
        } else if (profile?.role === "service") {
          navigate("/service");
        } else {
          navigate("/user");
        }
      }
    }

    checkAuth();
  }, [loading, profile, navigate, redirectTo, requiredRole]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!profile) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Hook to check if user is authenticated
 * Returns true if authenticated, false otherwise
 */
export function useRequireAuth(redirectTo: string = "/auth") {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !profile) {
      navigate(redirectTo, { 
        state: { message: "Please login to continue" },
        replace: true 
      });
    }
  }, [loading, profile, navigate, redirectTo]);

  return { isAuthenticated: !!profile, loading };
}
