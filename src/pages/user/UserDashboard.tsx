import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, getRoleDashboardPath } from "@/lib/auth";
import { useRealtimeSubscription, useNotifications } from "@/lib/realtime";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, FileVideo, TrendingUp, Users, Plus, Bell, MessageSquare, Download, Package, Video, Target, CreditCard } from "lucide-react";
import { CampaignRequest, CampaignStatus } from "@/types/database";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  pending: 'bg-yellow-500',
  paid: 'bg-blue-500',
  in_review: 'bg-purple-500',
  approved: 'bg-green-500',
  in_progress: 'bg-cyan-500',
  delivered: 'bg-orange-500',
  completed: 'bg-green-600',
  cancelled: 'bg-red-500',
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignRequest[]>([]);
  const [stats, setStats] = useState({
    active: 0,
    total_reach: 0,
    videos_created: 0,
    avg_engagement: 0,
  });
  const [loading, setLoading] = useState(true);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(profile?.id);

  useEffect(() => {
    if (!authLoading && !profile) {
      // Check if user is authenticated but has no profile
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // User is logged in but has no profile - redirect to setup
          navigate("/profile-setup");
        } else {
          // User is not logged in - redirect to auth
          navigate("/auth");
        }
      });
      return;
    }

    if (profile) {
      // Redirect non-users to their appropriate dashboards
      if (profile.role !== 'user') {
        navigate(getRoleDashboardPath(profile.role));
        return;
      }

      loadCampaigns();
    }
  }, [profile, authLoading]);

  // Real-time campaign updates
  useRealtimeSubscription(
    'campaign_requests',
    (payload: CampaignRequest) => {
      setCampaigns((prev) => {
        const exists = prev.find((c) => c.id === payload.id);
        if (exists) {
          return prev.map((c) => (c.id === payload.id ? payload : c));
        }
        return [...prev, payload];
      });
    },
    profile ? { column: 'user_id', value: profile.id } : undefined
  );

  async function loadCampaigns() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('campaign_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
      
      // Calculate stats
      const activeCampaigns = data?.filter(c => 
        ['paid', 'in_review', 'approved', 'in_progress'].includes(c.status)
      ).length || 0;

      setStats({
        active: activeCampaigns,
        total_reach: 0, // TODO: Calculate from analytics
        videos_created: data?.filter(c => c.final_video_url).length || 0,
        avg_engagement: 0, // TODO: Calculate from analytics
      });
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {profile?.full_name || profile?.email}
            </h1>
            <p className="text-gray-400">Here's an overview of your marketing campaigns</p>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="outline" size="icon" onClick={() => navigate('/notifications')}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.active}</div>
              <p className="text-xs text-gray-400">{campaigns.length} total campaigns</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Reach</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total_reach.toLocaleString()}</div>
              <p className="text-xs text-gray-400">Across all platforms</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Videos Created</CardTitle>
              <FileVideo className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.videos_created}</div>
              <p className="text-xs text-gray-400">{campaigns.length - stats.videos_created} in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg. Engagement</CardTitle>
              <BarChart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.avg_engagement.toFixed(1)}%</div>
              <p className="text-xs text-gray-400">Industry avg: 3.5%</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => navigate('/products')}
          >
            <CardHeader>
              <Package className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-white">Products</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your products & services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Products
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => navigate('/ads/create')}
          >
            <CardHeader>
              <Video className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-white">Create Ad</CardTitle>
              <CardDescription className="text-gray-400">
                3 methods: Actor, AI, Upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Create Ad
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => navigate('/campaigns/create')}
          >
            <CardHeader>
              <Target className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-white">Marketing</CardTitle>
              <CardDescription className="text-gray-400">
                Launch multi-platform campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Create Campaign
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => navigate('/subscription')}
          >
            <CardHeader>
              <CreditCard className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-white">Subscription</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your plan & billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="videos">Video Library</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Your Campaigns</h2>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate('/campaign/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>

            {campaigns.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="py-12 text-center">
                  <FileVideo className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
                  <p className="text-gray-400 mb-6">Create your first marketing campaign to get started</p>
                  <Button onClick={() => navigate('/campaign/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card 
                    key={campaign.id} 
                    className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-white">
                              {campaign.service_type.replace('_', ' ').toUpperCase()}
                            </CardTitle>
                            <Badge className={STATUS_COLORS[campaign.status]}>
                              {campaign.status.replace('_', ' ')}
                            </Badge>
                            {campaign.payment_status === 'pending' && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                Payment Pending
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-gray-400">
                            Ad Type: {campaign.ad_type.replace('_', ' ')} | 
                            Duration: {campaign.duration_days} days | 
                            Budget: ${campaign.total_cost.toFixed(2)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {campaign.final_video_url && (
                            <Button size="sm" variant="outline" onClick={(e) => {
                              e.stopPropagation();
                              window.open(campaign.final_video_url!, '_blank');
                            }}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/campaign/${campaign.id}#messages`);
                          }}>
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Campaign Analytics</CardTitle>
                <CardDescription className="text-gray-400">Performance metrics for your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                    <BarChart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    View Comprehensive Analytics
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Track your campaign performance, ROI, platform analytics, user journey funnel, and location-based insights.
                  </p>
                  <Button
                    onClick={() => navigate('/analytics')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg"
                  >
                    <BarChart className="mr-2 h-5 w-5" />
                    Open Analytics Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Video Library</CardTitle>
                <CardDescription className="text-gray-400">All your marketing videos in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaigns.filter(c => c.final_video_url).map((campaign) => (
                    <div key={campaign.id} className="relative group">
                      <video 
                        src={campaign.final_video_url!} 
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button onClick={() => window.open(campaign.final_video_url!, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
