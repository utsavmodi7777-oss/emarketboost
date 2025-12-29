import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye,
  BarChart3,
  Video,
  Target,
  Zap,
  Plus,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";

interface StatCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: typeof TrendingUp;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const stats: StatCard[] = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+20.1%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "Active Campaigns",
      value: "12",
      change: "+3",
      isPositive: true,
      icon: Target,
    },
    {
      title: "Total Impressions",
      value: "2.4M",
      change: "+12.5%",
      isPositive: true,
      icon: Eye,
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "-0.4%",
      isPositive: false,
      icon: TrendingUp,
    },
  ];

  const recentCampaigns = [
    { id: 1, name: "Summer Sale 2024", status: "Active", budget: "$5,000", spent: "$3,245", impressions: "245K", ctr: "2.8%" },
    { id: 2, name: "Product Launch", status: "Active", budget: "$8,000", spent: "$7,120", impressions: "580K", ctr: "3.4%" },
    { id: 3, name: "Brand Awareness", status: "Paused", budget: "$3,500", spent: "$2,890", impressions: "180K", ctr: "2.1%" },
    { id: 4, name: "Holiday Special", status: "Scheduled", budget: "$10,000", spent: "$0", impressions: "0", ctr: "0%" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl mb-2">
            Welcome back, <span className="text-gradient">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your campaigns today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className={`flex items-center text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </div>

            <TabsContent value="campaigns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{campaign.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              campaign.status === 'Active' ? 'bg-green-500/20 text-green-500' :
                              campaign.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-blue-500/20 text-blue-500'
                            }`}>
                              {campaign.status}
                            </span>
                            <span>Budget: {campaign.budget}</span>
                            <span>Spent: {campaign.spent}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-center">
                          <div>
                            <div className="text-sm text-muted-foreground">Impressions</div>
                            <div className="font-semibold">{campaign.impressions}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">CTR</div>
                            <div className="font-semibold">{campaign.ctr}</div>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="w-16 h-16 mb-4" />
                    </div>
                    <p className="text-center text-muted-foreground">
                      Detailed analytics charts coming soon
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audience Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Age 18-24</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-primary"></div>
                          </div>
                          <span className="text-sm font-semibold">75%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Age 25-34</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="w-1/2 h-full bg-secondary"></div>
                          </div>
                          <span className="text-sm font-semibold">50%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Age 35-44</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-primary"></div>
                          </div>
                          <span className="text-sm font-semibold">33%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Video Ads Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                          <Video className="w-12 h-12 text-muted-foreground" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="sm">Play</Button>
                          </div>
                        </div>
                        <h4 className="font-semibold mb-1">Video Ad {i}</h4>
                        <p className="text-sm text-muted-foreground">Duration: 0:30 • Views: {i * 50}K</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
