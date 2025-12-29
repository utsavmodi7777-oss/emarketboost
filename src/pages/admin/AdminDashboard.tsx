import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Profile, CampaignRequest, ServiceTeamMember, UserRole } from "@/types/database";
import { Users, Briefcase, DollarSign, Activity, Shield, Database, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRequest[]>([]);
  const [serviceTeam, setServiceTeam] = useState<ServiceTeamMember[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    totalRevenue: 0,
    activeService: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/admin/login");
      return;
    }

    if (profile && profile.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (profile) {
      loadAdminData();
    }
  }, [profile, authLoading]);

  async function loadAdminData() {
    try {
      // Load all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load all campaigns
      const { data: campaignsData } = await supabase
        .from('campaign_requests')
        .select(`
          *,
          user:profiles!campaign_requests_user_id_fkey(*),
          assigned_service:profiles!campaign_requests_assigned_to_fkey(*)
        `)
        .order('created_at', { ascending: false });

      // Load service team
      const { data: serviceData } = await supabase
        .from('service_team')
        .select('*');

      setUsers(usersData || []);
      setCampaigns(campaignsData || []);
      setServiceTeam(serviceData || []);

      // Calculate stats
      const totalRevenue = campaignsData?.reduce((sum, c) => 
        c.payment_status === 'paid' ? sum + c.total_cost : sum, 0
      ) || 0;

      setStats({
        totalUsers: usersData?.filter(u => u.role === 'user').length || 0,
        totalCampaigns: campaignsData?.length || 0,
        totalRevenue,
        activeService: usersData?.filter(u => u.role === 'service').length || 0,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function changeUserRole(userId: string, newRole: UserRole) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}`,
      });

      loadAdminData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  }

  async function assignCampaign(campaignId: string, serviceId: string) {
    try {
      const { error } = await supabase
        .from('campaign_requests')
        .update({ assigned_to: serviceId || null })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: 'Campaign Assigned',
        description: 'Campaign successfully assigned to service team member',
      });

      loadAdminData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign campaign',
        variant: 'destructive',
      });
    }
  }

  async function exportData() {
    try {
      const csvData = campaigns.map(c => ({
        ID: c.id,
        User: (c as any).user?.email,
        Service: c.service_type,
        Status: c.status,
        Payment: c.payment_status,
        Budget: c.total_cost,
        Created: c.created_at,
      }));

      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaigns-export-${Date.now()}.csv`;
      a.click();

      toast({
        title: 'Export Complete',
        description: 'Campaign data exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export data',
        variant: 'destructive',
      });
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
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
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Platform overview and management</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500">ADMIN ACCESS</Badge>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Campaigns</CardTitle>
              <Briefcase className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Service Team</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeService}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="service">Service Team</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">All Campaigns</h2>
              <Button onClick={exportData} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-white text-lg">
                            {campaign.service_type.replace('_', ' ').toUpperCase()}
                          </CardTitle>
                          <Badge>{campaign.status}</Badge>
                          <Badge variant="outline">{campaign.payment_status}</Badge>
                        </div>
                        <CardDescription className="text-gray-400">
                          User: {(campaign as any).user?.email} | 
                          Budget: ${campaign.total_cost.toFixed(2)} | 
                          Created: {new Date(campaign.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={campaign.assigned_to || 'unassigned'}
                          onValueChange={(value) => assignCampaign(campaign.id, value === 'unassigned' ? '' : value)}
                        >
                          <SelectTrigger className="w-[200px] bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {users.filter(u => u.role === 'service').map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name || user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">{user.full_name || user.email}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {user.email} | Joined: {new Date(user.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Select
                          value={user.role}
                          onValueChange={(value) => changeUserRole(user.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-[150px] bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge className={
                          user.role === 'admin' ? 'bg-red-500' :
                          user.role === 'service' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }>
                          {user.role.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Service Team Tab */}
          <TabsContent value="service" className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Service Team Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.filter(u => u.role === 'service').map((member) => {
                const memberCampaigns = campaigns.filter(c => c.assigned_to === member.id);
                return (
                  <Card key={member.id} className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">{member.full_name || member.email}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Assigned Campaigns: {memberCampaigns.length}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">In Progress:</span>
                          <span className="text-white">{memberCampaigns.filter(c => c.status === 'in_progress').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Completed:</span>
                          <span className="text-white">{memberCampaigns.filter(c => c.status === 'completed').length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Settings</CardTitle>
                <CardDescription className="text-gray-400">Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
