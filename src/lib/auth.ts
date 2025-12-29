import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to get current user's profile and role
 */
export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Profile query error:', error);
        
        // If profile doesn't exist (PGRST116 = no rows returned)
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', session.user.id);
          // Don't throw error, just set profile to null
          // The dashboard components will handle redirecting to profile setup
          setProfile(null);
          setLoading(false);
          return;
        }
        
        throw error;
      }
      
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: `Failed to load user profile: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  return {
    profile,
    loading,
    isAuthenticated: !!profile,
    isUser: profile?.role === 'user',
    isService: profile?.role === 'service',
    isAdmin: profile?.role === 'admin',
  };
}

/**
 * Check if user has required role
 */
export function hasRole(profile: Profile | null, role: UserRole | UserRole[]): boolean {
  if (!profile) return false;
  
  if (Array.isArray(role)) {
    return role.includes(profile.role);
  }
  
  return profile.role === role;
}

/**
 * Redirect based on user role
 */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'service':
      return '/service';
    case 'user':
    default:
      return '/dashboard';
  }
}
