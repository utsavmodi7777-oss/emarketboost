import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Video, Eye, Trash2 } from "lucide-react";

export default function AdsList() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile) {
      loadAds();
    }
  }, [profile, authLoading]);

  async function loadAds() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*, products(name)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      pending_review: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      active: 'bg-blue-500',
      paused: 'bg-orange-500',
      completed: 'bg-green-600',
      archived: 'bg-gray-600',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Advertisements
            </h1>
            <p className="text-gray-400">Create and manage your ad creatives</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/ads/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        </div>

        {ads.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No ads yet</h3>
              <p className="text-gray-400 mb-6">Create your first advertisement using our 3 methods</p>
              <Button onClick={() => navigate('/ads/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Ad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <Card key={ad.id} className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
                <CardHeader>
                  {(ad.video_url || ad.image_url) && (
                    <div className="w-full h-48 bg-gray-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {ad.video_url ? (
                        <video src={ad.video_url} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={ad.image_url} alt={ad.script_text} className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">
                        {ad.creation_method.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {ad.products?.name || 'No product'}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(ad.status)}>
                      {ad.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {ad.script_text}
                  </p>
                  {ad.cost && (
                    <p className="text-primary font-bold mb-4">₹{ad.cost}</p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/ads/${ad.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={async () => {
                        if (confirm('Delete this ad?')) {
                          await supabase.from('advertisements').delete().eq('id', ad.id);
                          loadAds();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
