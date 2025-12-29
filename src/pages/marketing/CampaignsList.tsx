import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Eye, Trash2 } from "lucide-react";

export default function CampaignsList() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile) {
      loadCampaigns();
    }
  }, [profile, authLoading]);

  async function loadCampaigns() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      pending_approval: 'bg-yellow-500',
      approved: 'bg-green-500',
      active: 'bg-blue-500',
      paused: 'bg-orange-500',
      completed: 'bg-green-600',
      cancelled: 'bg-red-500',
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
              Marketing Campaigns
            </h1>
            <p className="text-gray-400">Launch and manage multi-platform campaigns</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/campaigns/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
              <p className="text-gray-400 mb-6">Create your first marketing campaign</p>
              <Button onClick={() => navigate('/campaigns/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-white text-xl">{campaign.campaign_name}</CardTitle>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.replace('_', ' ')}
                        </Badge>
                        {campaign.payment_status === 'paid' && (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            Paid
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-400">
                        Objective: {campaign.objective} | Duration: {campaign.duration_months} months
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Total Budget</p>
                      <p className="text-white font-bold">₹{campaign.total_budget}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Est. Reach</p>
                      <p className="text-white font-bold">{campaign.estimated_reach?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Est. Clicks</p>
                      <p className="text-white font-bold">{campaign.estimated_clicks?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Platforms</p>
                      <p className="text-white font-bold">{campaign.platforms?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={async () => {
                        if (confirm('Delete this campaign?')) {
                          await supabase.from('marketing_campaigns').delete().eq('id', campaign.id);
                          loadCampaigns();
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
