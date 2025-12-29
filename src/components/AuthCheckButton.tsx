import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/**
 * Auth Check Button Component
 * Shows "Get Started" button if not logged in
 * Shows "Access Service" button if logged in
 */
export function AuthCheckButton({ 
  serviceName,
  className = "" 
}: { 
  serviceName: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  }

  const handleClick = () => {
    if (isAuthenticated) {
      // User is logged in - take them to their dashboard or campaign creation
      navigate("/campaign/create");
    } else {
      // User is not logged in - redirect to auth page
      navigate("/auth", {
        state: { 
          message: `Please login or sign up to access ${serviceName}`,
          returnTo: window.location.pathname
        }
      });
    }
  };

  if (loading) {
    return (
      <Button disabled className={className}>
        Loading...
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleClick}
      className={className}
      variant={isAuthenticated ? "default" : "hero"}
    >
      {isAuthenticated ? `Access ${serviceName}` : "Get Started - Login Required"}
    </Button>
  );
}

/**
 * Simple redirect to auth if not authenticated
 */
export async function requireAuth(navigate: any, message?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    navigate("/auth", {
      state: { 
        message: message || "Please login to access this feature",
        replace: true
      }
    });
    return false;
  }
  
  return true;
}
