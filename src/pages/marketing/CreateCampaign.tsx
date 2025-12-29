import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    campaign_name: "",
    objective: "reach",
    product_id: "",
    advertisement_id: "",
    selected_platforms: [] as string[],
    total_budget: "",
    duration_months: 1,
    target_countries: [] as string[],
    target_cities: [] as string[],
  });

  useEffect(() => {
    loadProducts();
    loadAds();
    loadPlatforms();
    loadLocations();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', profile?.id);
    setProducts(data || []);
  }

  async function loadAds() {
    const { data } = await supabase
      .from('advertisements')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('status', 'approved');
    setAds(data || []);
  }

  async function loadPlatforms() {
    const { data } = await supabase
      .from('marketing_platforms')
      .select('*')
      .eq('is_active', true);
    setPlatforms(data || []);
  }

  async function loadLocations() {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .eq('level', 'country');
    setLocations(data || []);
  }

  const togglePlatform = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_platforms: prev.selected_platforms.includes(platformId)
        ? prev.selected_platforms.filter(id => id !== platformId)
        : [...prev.selected_platforms, platformId]
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    if (formData.selected_platforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const platformsData = formData.selected_platforms.map(id => ({
        platform_id: id,
        budget_allocated: parseFloat(formData.total_budget) / formData.selected_platforms.length,
        status: 'active'
      }));

      const { error } = await supabase.from('marketing_campaigns').insert([
        {
          user_id: profile.id,
          product_id: formData.product_id || null,
          advertisement_id: formData.advertisement_id || null,
          campaign_name: formData.campaign_name,
          objective: formData.objective,
          platforms: platformsData,
          total_budget: parseFloat(formData.total_budget),
          duration_months: formData.duration_months,
          target_countries: formData.target_countries,
          target_cities: formData.target_cities,
          status: 'draft',
          payment_status: 'unpaid',
        }
      ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Campaign created successfully",
      });
      navigate('/campaigns');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Create Marketing Campaign
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Campaign Details</CardTitle>
              <CardDescription className="text-gray-400">
                Basic information about your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product" className="text-white">Product</Label>
                  <Select value={formData.product_id} onValueChange={(value) => setFormData({...formData, product_id: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad" className="text-white">Advertisement</Label>
                  <Select value={formData.advertisement_id} onValueChange={(value) => setFormData({...formData, advertisement_id: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select ad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ads.map(ad => (
                        <SelectItem key={ad.id} value={ad.id}>
                          {ad.creation_method} - {ad.script_text.substring(0, 30)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective" className="text-white">Campaign Objective *</Label>
                <Select value={formData.objective} onValueChange={(value) => setFormData({...formData, objective: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reach">Reach</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="conversions">Conversions</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Platform Selection</CardTitle>
              <CardDescription className="text-gray-400">
                Choose where to run your campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.selected_platforms.includes(platform.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-600'
                    }`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.selected_platforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                      <div>
                        <p className="text-white font-semibold">{platform.display_name}</p>
                        <p className="text-gray-400 text-sm">Min: ₹{platform.min_budget}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Budget & Duration</CardTitle>
              <CardDescription className="text-gray-400">
                Set your campaign budget and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white">Total Budget (₹) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.total_budget}
                    onChange={(e) => setFormData({...formData, total_budget: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Duration (Months) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value)})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {formData.total_budget && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">Estimated Results:</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Daily Budget</p>
                      <p className="text-white font-bold">₹{(parseFloat(formData.total_budget) / (formData.duration_months * 30)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Est. Reach</p>
                      <p className="text-white font-bold">{(parseFloat(formData.total_budget) * 10).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Est. Clicks</p>
                      <p className="text-white font-bold">{(parseFloat(formData.total_budget) * 0.5).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/campaigns')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
