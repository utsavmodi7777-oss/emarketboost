import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Video, Upload, Sparkles, User } from "lucide-react";

export default function CreateAd() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState<'real_actor' | 'ai_generated' | 'upload'>('real_actor');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [actors, setActors] = useState<any[]>([]);
  const [avatars, setAvatars] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    product_id: "",
    script_text: "",
    duration_seconds: 30,
    actor_id: "",
    avatar_id: "",
    video_file: null as File | null,
    image_file: null as File | null,
  });

  useEffect(() => {
    loadProducts();
    loadActors();
    loadAvatars();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', profile?.id);
    setProducts(data || []);
  }

  async function loadActors() {
    const { data } = await supabase
      .from('actors')
      .select('*')
      .eq('is_available', true);
    setActors(data || []);
  }

  async function loadAvatars() {
    const { data } = await supabase
      .from('ai_avatars')
      .select('*');
    setAvatars(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const adData: any = {
        user_id: profile.id,
        product_id: formData.product_id || null,
        creation_method: method,
        script_text: formData.script_text,
        duration_seconds: formData.duration_seconds,
        status: 'draft',
      };

      if (method === 'real_actor') {
        adData.actor_id = formData.actor_id;
        adData.cost = 5000; // Base cost for real actor
      } else if (method === 'ai_generated') {
        adData.ai_avatar_id = formData.avatar_id;
        adData.cost = 1000; // Lower cost for AI
      } else if (method === 'upload') {
        // Handle file upload
        if (formData.video_file || formData.image_file) {
          const file = formData.video_file || formData.image_file;
          const fileExt = file!.name.split('.').pop();
          const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('advertisements')
            .upload(fileName, file!);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('advertisements')
            .getPublicUrl(fileName);

          if (formData.video_file) {
            adData.video_url = urlData.publicUrl;
          } else {
            adData.image_url = urlData.publicUrl;
          }
        }
        adData.cost = 0; // Free for upload
      }

      const { error } = await supabase.from('advertisements').insert([adData]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Advertisement created successfully",
      });
      navigate('/ads');
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
          Create Advertisement
        </h1>

        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Choose Creation Method</CardTitle>
            <CardDescription className="text-gray-400">
              Select how you want to create your advertisement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={method} onValueChange={(v) => setMethod(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                <TabsTrigger value="real_actor" className="data-[state=active]:bg-primary">
                  <User className="w-4 h-4 mr-2" />
                  Real Actor
                </TabsTrigger>
                <TabsTrigger value="ai_generated" className="data-[state=active]:bg-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generated
                </TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Own
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="product" className="text-white">Select Product (Optional)</Label>
                    <Select value={formData.product_id} onValueChange={(value) => setFormData({...formData, product_id: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="script" className="text-white">Script/Message *</Label>
                    <Textarea
                      id="script"
                      value={formData.script_text}
                      onChange={(e) => setFormData({...formData, script_text: e.target.value})}
                      required
                      rows={4}
                      placeholder="Enter your ad script or message..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-white">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_seconds}
                      onChange={(e) => setFormData({...formData, duration_seconds: parseInt(e.target.value)})}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <TabsContent value="real_actor" className="mt-0">
                    <div className="space-y-4">
                      <Label className="text-white">Select Actor *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {actors.map((actor) => (
                          <Card
                            key={actor.id}
                            className={`cursor-pointer transition-all ${
                              formData.actor_id === actor.id
                                ? 'border-primary border-2'
                                : 'border-gray-600'
                            }`}
                            onClick={() => setFormData({...formData, actor_id: actor.id})}
                          >
                            <CardContent className="p-4">
                              {actor.photo_url && (
                                <img src={actor.photo_url} alt={actor.name} className="w-full h-32 object-cover rounded mb-2" />
                              )}
                              <p className="text-white font-semibold">{actor.name}</p>
                              <p className="text-gray-400 text-sm">{actor.specialty}</p>
                              <p className="text-primary font-bold mt-2">₹{actor.rate_per_video}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai_generated" className="mt-0">
                    <div className="space-y-4">
                      <Label className="text-white">Select AI Avatar *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {avatars.map((avatar) => (
                          <Card
                            key={avatar.id}
                            className={`cursor-pointer transition-all ${
                              formData.avatar_id === avatar.id
                                ? 'border-primary border-2'
                                : 'border-gray-600'
                            }`}
                            onClick={() => setFormData({...formData, avatar_id: avatar.id})}
                          >
                            <CardContent className="p-4">
                              {avatar.preview_image_url && (
                                <img src={avatar.preview_image_url} alt={avatar.name} className="w-full h-32 object-cover rounded mb-2" />
                              )}
                              <p className="text-white font-semibold">{avatar.name}</p>
                              <p className="text-gray-400 text-sm capitalize">{avatar.gender}, {avatar.age_range}</p>
                              <p className="text-primary font-bold mt-2">₹{avatar.cost_per_generation}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="video" className="text-white">Upload Video</Label>
                        <Input
                          id="video"
                          type="file"
                          accept="video/*"
                          onChange={(e) => setFormData({...formData, video_file: e.target.files?.[0] || null})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="text-center text-gray-400">OR</div>
                      <div className="space-y-2">
                        <Label htmlFor="image" className="text-white">Upload Image</Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({...formData, image_file: e.target.files?.[0] || null})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? "Creating..." : "Create Advertisement"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/ads')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
