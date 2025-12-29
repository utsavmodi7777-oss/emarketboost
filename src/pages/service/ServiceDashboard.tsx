import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useRealtimeSubscription } from "@/lib/realtime";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CampaignRequest, CampaignStatus } from "@/types/database";
import { Briefcase, Clock, CheckCircle2, AlertCircle, Upload, MessageSquare } from "lucide-react";

const STATUS_OPTIONS: CampaignStatus[] = [
  'in_review',
  'approved',
  'in_progress',
  'delivered',
  'completed',
];

export default function ServiceDashboard() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<CampaignRequest[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDraft, setUploadingDraft] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile && profile.role !== 'service') {
      navigate("/dashboard");
      return;
    }

    if (profile) {
      loadAssignedCampaigns();
    }
  }, [profile, authLoading]);

  // Real-time updates for assigned campaigns
  useRealtimeSubscription(
    'campaign_requests',
    (payload: CampaignRequest) => {
      setCampaigns((prev) => {
        const exists = prev.find((c) => c.id === payload.id);
        if (exists) {
          return prev.map((c) => (c.id === payload.id ? payload : c));
        }
        // New campaign assigned to me
        if (payload.assigned_to === profile?.id) {
          return [...prev, payload];
        }
        return prev;
      });
    }
  );

  async function loadAssignedCampaigns() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('campaign_requests')
        .select(`
          *,
          user:profiles!campaign_requests_user_id_fkey(*)
        `)
        .or(`assigned_to.eq.${profile.id},status.eq.paid`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateCampaignStatus(campaignId: string, newStatus: CampaignStatus) {
    try {
      const { error } = await supabase
        .from('campaign_requests')
        .update({ status: newStatus })
        .eq('id', campaignId);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: profile?.id,
        campaign_id: campaignId,
        action: 'status_updated',
        details: { new_status: newStatus },
      });

      // Create notification for user
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        await supabase.from('notifications').insert({
          user_id: campaign.user_id,
          title: 'Campaign Status Updated',
          message: `Your campaign status has been updated to: ${newStatus.replace('_', ' ')}`,
          type: 'info',
          link: `/campaign/${campaignId}`,
        });
      }

      toast({
        title: 'Status Updated',
        description: `Campaign status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  async function uploadDraftVideo(campaignId: string, file: File) {
    if (!profile) return;

    setUploadingDraft(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `drafts/${campaignId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-videos')
        .getPublicUrl(fileName);

      // Get current draft URLs
      const campaign = campaigns.find(c => c.id === campaignId);
      const currentDrafts = campaign?.draft_video_urls || [];

      // Update campaign with new draft
      const { error: updateError } = await supabase
        .from('campaign_requests')
        .update({ 
          draft_video_urls: [...currentDrafts, publicUrl],
          status: 'in_review'
        })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      // Notify user
      await supabase.from('notifications').insert({
        user_id: campaign?.user_id,
        title: 'New Draft Available',
        message: 'A draft version of your campaign video is ready for review',
        type: 'success',
        link: `/campaign/${campaignId}`,
      });

      toast({
        title: 'Draft Uploaded',
        description: 'Draft video uploaded successfully. User has been notified.',
      });

      loadAssignedCampaigns();
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload draft video',
        variant: 'destructive',
      });
    } finally {
      setUploadingDraft(false);
    }
  }

  async function saveInternalNotes(campaignId: string) {
    try {
      const { error } = await supabase
        .from('campaign_requests')
        .update({ internal_notes: internalNotes })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: 'Notes Saved',
        description: 'Internal notes updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save notes',
        variant: 'destructive',
      });
    }
  }

  async function claimCampaign(campaignId: string) {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('campaign_requests')
        .update({ assigned_to: profile.id })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: 'Campaign Claimed',
        description: 'You are now assigned to this campaign',
      });

      loadAssignedCampaigns();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim campaign',
        variant: 'destructive',
      });
    }
  }

  const assignedCampaigns = campaigns.filter(c => c.assigned_to === profile?.id);
  const availableCampaigns = campaigns.filter(c => !c.assigned_to && c.payment_status === 'paid');

  if (authLoading || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Service Team Dashboard
          </h1>
          <p className="text-gray-400">Manage and deliver client campaigns</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Assigned</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{assignedCampaigns.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {assignedCampaigns.filter(c => c.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {assignedCampaigns.filter(c => c.status === 'completed').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Available</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{availableCampaigns.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assigned" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="assigned">My Campaigns ({assignedCampaigns.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({availableCampaigns.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-4">
            {assignedCampaigns.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">No assigned campaigns</h3>
                  <p className="text-gray-400">Check the Available tab to claim new campaigns</p>
                </CardContent>
              </Card>
            ) : (
              assignedCampaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white mb-2">
                          {campaign.service_type.replace('_', ' ').toUpperCase()} - {campaign.ad_type.replace('_', ' ')}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Client: {(campaign as any).user?.email} | Budget: ${campaign.total_cost.toFixed(2)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Select
                          value={campaign.status}
                          onValueChange={(value) => updateCampaignStatus(campaign.id, value as CampaignStatus)}
                        >
                          <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/service/campaign/${campaign.id}`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Requirements */}
                    {campaign.user_requirements && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">Client Requirements:</h4>
                        <p className="text-gray-400 text-sm">{campaign.user_requirements}</p>
                      </div>
                    )}

                    {/* Internal Notes */}
                    <div>
                      <h4 className="text-white font-semibold mb-2">Internal Notes:</h4>
                      <Textarea
                        value={campaign.internal_notes || internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Add notes for your team..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => saveInternalNotes(campaign.id)}
                      >
                        Save Notes
                      </Button>
                    </div>

                    {/* Upload Draft */}
                    <div>
                      <h4 className="text-white font-semibold mb-2">Upload Draft:</h4>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadDraftVideo(campaign.id, file);
                        }}
                        className="hidden"
                        id={`draft-upload-${campaign.id}`}
                      />
                      <Button
                        onClick={() => document.getElementById(`draft-upload-${campaign.id}`)?.click()}
                        disabled={uploadingDraft}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingDraft ? 'Uploading...' : 'Upload Draft Video'}
                      </Button>
                    </div>

                    {/* Existing drafts */}
                    {campaign.draft_video_urls && campaign.draft_video_urls.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">Uploaded Drafts:</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {campaign.draft_video_urls.map((url, idx) => (
                            <video key={idx} src={url} controls className="w-full rounded" />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {availableCampaigns.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">No available campaigns</h3>
                  <p className="text-gray-400">All campaigns are currently assigned</p>
                </CardContent>
              </Card>
            ) : (
              availableCampaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white mb-2">
                          {campaign.service_type.replace('_', ' ').toUpperCase()}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Budget: ${campaign.total_cost.toFixed(2)} | Duration: {campaign.duration_days} days
                        </CardDescription>
                      </div>
                      <Button onClick={() => claimCampaign(campaign.id)}>
                        Claim Campaign
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
