import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CampaignRequest, CampaignStatus } from "@/types/database";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  MessageSquare,
  LogOut,
  User,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Award,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ServiceEmployee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pan_number: string;
  aadhar_number: string;
  status: string;
  joined_date: string;
}

export default function ServiceDashboardNew() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [campaigns, setCampaigns] = useState<CampaignRequest[]>([]);
  const [employeeData, setEmployeeData] = useState<ServiceEmployee | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateNote, setUpdateNote] = useState("");
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/service/login");
      return;
    }

    if (profile && profile.role !== "service") {
      toast({
        title: "Access Denied",
        description: "Service panel access required",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (profile) {
      loadEmployeeData();
      loadAssignedCampaigns();
    }
  }, [profile, authLoading]);

  async function loadEmployeeData() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("service_employees")
        .select("*")
        .eq("user_id", profile.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading employee data:", error);
      } else if (data) {
        setEmployeeData(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function loadAssignedCampaigns() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("campaign_requests")
        .select(`
          *,
          user:profiles!campaign_requests_user_id_fkey(*)
        `)
        .eq("assigned_to", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setCampaigns(data || []);

      // Calculate stats
      const assigned = data?.length || 0;
      const inProgress = data?.filter((c) => c.status === "in_progress").length || 0;
      const completed = data?.filter((c) => c.status === "completed").length || 0;
      const totalEarnings = data?.reduce((sum, c) => 
        c.status === "completed" ? sum + (c.total_cost * 0.1) : sum, 0
      ) || 0; // 10% commission

      setStats({ assigned, inProgress, completed, totalEarnings });
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateCampaignStatus(campaignId: string, newStatus: CampaignStatus) {
    try {
      const { error } = await supabase
        .from("campaign_requests")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Campaign status changed to ${newStatus}`,
      });

      loadAssignedCampaigns();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function addCampaignUpdate(campaignId: string) {
    if (!updateNote.trim()) {
      toast({
        title: "Note Required",
        description: "Please enter an update note",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("campaign_updates")
        .insert({
          campaign_id: campaignId,
          update_type: "progress",
          message: updateNote,
          created_by: profile?.id,
        });

      if (error) throw error;

      toast({
        title: "Update Added",
        description: "Campaign update posted successfully",
      });

      setUpdateNote("");
      loadAssignedCampaigns();
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate("/service/login");
      toast({
        title: "Logged Out",
        description: "See you soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_review: "bg-yellow-500",
      approved: "bg-blue-500",
      in_progress: "bg-purple-500",
      delivered: "bg-green-500",
      completed: "bg-emerald-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      in_review: <Clock className="w-4 h-4" />,
      in_progress: <TrendingUp className="w-4 h-4" />,
      completed: <CheckCircle2 className="w-4 h-4" />,
      delivered: <Upload className="w-4 h-4" />,
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Service Panel
            </h1>
            <p className="text-gray-400">
              Welcome back, {employeeData?.full_name || profile?.full_name || "Team Member"}
              {employeeData && <span className="ml-2 text-orange-400">({employeeData.employee_id})</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-orange-500">SERVICE ACCESS</Badge>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Assigned</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.assigned}</div>
              <p className="text-xs text-gray-400">Total campaigns</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
              <p className="text-xs text-gray-400">Active work</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completed}</div>
              <p className="text-xs text-gray-400">Delivered projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-gray-400">Commission earned</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Assigned Campaigns</h2>
            </div>

            {campaigns.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No campaigns assigned yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-white text-lg">
                              {campaign.service_type.replace("_", " ").toUpperCase()}
                            </CardTitle>
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusIcon(campaign.status)}
                              <span className="ml-1">{campaign.status}</span>
                            </Badge>
                            {campaign.payment_status === "paid" && (
                              <Badge variant="outline" className="border-green-500 text-green-400">
                                Paid
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-gray-400">
                            Client: {(campaign as any).user?.email} |
                            Budget: ${campaign.total_cost.toFixed(2)} |
                            Created: {new Date(campaign.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Select
                          value={campaign.status}
                          onValueChange={(value) =>
                            updateCampaignStatus(campaign.id, value as CampaignStatus)
                          }
                        >
                          <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Campaign Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Service Type:</span>
                          <p className="text-white">{campaign.service_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Cost:</span>
                          <p className="text-white">${campaign.total_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Created:</span>
                          <p className="text-white">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Add Update */}
                      <div className="border-t border-gray-700 pt-4 space-y-3">
                        <Label className="text-gray-300">Add Progress Update</Label>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Enter progress update for client..."
                            value={selectedCampaign?.id === campaign.id ? updateNote : ""}
                            onChange={(e) => {
                              setUpdateNote(e.target.value);
                              setSelectedCampaign(campaign);
                            }}
                            className="bg-gray-700/50 border-gray-600 text-white"
                            rows={2}
                          />
                        </div>
                        <Button
                          onClick={() => addCampaignUpdate(campaign.id)}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={selectedCampaign?.id !== campaign.id || !updateNote.trim()}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Post Update
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Employee Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Your personal and employment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {employeeData ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-20 h-20 border-2 border-orange-500">
                        <AvatarFallback className="bg-orange-500/20 text-orange-400 text-2xl">
                          {employeeData.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{employeeData.full_name}</h3>
                        <p className="text-orange-400">Employee ID: {employeeData.employee_id}</p>
                        <Badge className="mt-1 bg-green-500">{employeeData.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-400 flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Email
                        </Label>
                        <p className="text-white">{employeeData.email}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-400 flex items-center gap-2">
                          <Phone className="w-4 h-4" /> Phone
                        </Label>
                        <p className="text-white">{employeeData.phone}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-400 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> City
                        </Label>
                        <p className="text-white">{employeeData.city}, {employeeData.state}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Joined
                        </Label>
                        <p className="text-white">
                          {new Date(employeeData.joined_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-400 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" /> PAN Number
                        </Label>
                        <p className="text-white">{employeeData.pan_number}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-400 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" /> Aadhar Number
                        </Label>
                        <p className="text-white">
                          {employeeData.aadhar_number.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-400">Address</Label>
                      <p className="text-white">{employeeData.address}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No employee profile found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Contact admin if you're a registered employee
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Track your work performance and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <div className="text-4xl font-bold text-green-400">{stats.completed}</div>
                    <p className="text-gray-400 mt-2">Completed Projects</p>
                  </div>

                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <div className="text-4xl font-bold text-purple-400">{stats.inProgress}</div>
                    <p className="text-gray-400 mt-2">Active Projects</p>
                  </div>

                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <div className="text-4xl font-bold text-yellow-400">
                      {stats.completed > 0 ? ((stats.completed / stats.assigned) * 100).toFixed(0) : 0}%
                    </div>
                    <p className="text-gray-400 mt-2">Success Rate</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Earnings Breakdown</h3>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Total Commission (10%)</span>
                      <span className="text-2xl font-bold text-green-400">
                        ${stats.totalEarnings.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Based on {stats.completed} completed campaign{stats.completed !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
