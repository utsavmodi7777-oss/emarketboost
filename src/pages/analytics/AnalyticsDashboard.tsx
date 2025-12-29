import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile) {
      loadAnalytics();
    }
  }, [profile, authLoading]);

  async function loadAnalytics() {
    if (!profile) return;

    try {
      // Load user analytics
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  // Dummy data for charts
  const dailyData = [
    { date: '12/01', impressions: 5000, clicks: 250, conversions: 25 },
    { date: '12/02', impressions: 6200, clicks: 310, conversions: 31 },
    { date: '12/03', impressions: 5800, clicks: 290, conversions: 29 },
    { date: '12/04', impressions: 7100, clicks: 355, conversions: 36 },
    { date: '12/05', impressions: 6500, clicks: 325, conversions: 33 },
    { date: '12/06', impressions: 7800, clicks: 390, conversions: 39 },
    { date: '12/07', impressions: 8200, clicks: 410, conversions: 41 },
  ];

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
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{analytics?.total_campaigns || 0}</p>
              <p className="text-sm text-green-500">{analytics?.active_campaigns || 0} active</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{analytics?.total_impressions?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-400">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{analytics?.total_clicks?.toLocaleString() || 0}</p>
              <p className="text-sm text-primary">{analytics?.average_ctr?.toFixed(2) || 0}% CTR</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">₹{analytics?.total_spend?.toLocaleString() || 0}</p>
              <p className="text-sm text-green-500">{analytics?.average_roas?.toFixed(2) || 0}x ROAS</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Daily Performance</CardTitle>
              <CardDescription className="text-gray-400">Impressions, Clicks, and Conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" stroke="#8B5CF6" />
                  <Line type="monotone" dataKey="clicks" stroke="#10B981" />
                  <Line type="monotone" dataKey="conversions" stroke="#F59E0B" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Campaign Comparison</CardTitle>
              <CardDescription className="text-gray-400">Performance by Campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="clicks" fill="#8B5CF6" />
                  <Bar dataKey="conversions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
