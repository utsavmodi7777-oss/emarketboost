import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateCampaignCost, formatCostBreakdown, validateBudgetInputs } from '@/lib/costCalculator';
import { ServiceType, AdType, Actor, CostCalculationInput } from '@/types/database';
import { ArrowLeft, ArrowRight, Video, Brain, Upload, MapPin, DollarSign, Check } from 'lucide-react';

const STEPS = [
  'Service Type',
  'Ad Creation',
  'Target Locations',
  'Budget & Duration',
  'Review & Payment',
];

export default function CampaignWizard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form data
  const [serviceType, setServiceType] = useState<ServiceType>('brand_marketing');
  const [adType, setAdType] = useState<AdType>('ai_generated');
  const [selectedActor, setSelectedActor] = useState<string>('');
  const [actors, setActors] = useState<Actor[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Targeting
  const [isWorldwide, setIsWorldwide] = useState(false);
  const [targetLocations, setTargetLocations] = useState<any[]>([{
    country: '',
    state: '',
    city: '',
    area: '',
  }]);

  // Budget
  const [durationDays, setDurationDays] = useState(30);
  const [budgetGoogle, setBudgetGoogle] = useState(0);
  const [budgetInstagram, setBudgetInstagram] = useState(0);
  const [budgetFacebook, setBudgetFacebook] = useState(0);
  const [budgetYoutube, setBudgetYoutube] = useState(0);
  const [userRequirements, setUserRequirements] = useState('');

  // Cost calculation
  const [costBreakdown, setCostBreakdown] = useState<any>(null);

  // Fetch actors when ad type changes
  useEffect(() => {
    if (adType === 'actor_ad') {
      fetchActors();
    }
  }, [adType]);

  async function fetchActors() {
    const { data, error } = await supabase
      .from('actors')
      .select('*')
      .eq('is_available', true)
      .order('rating', { ascending: false });

    if (!error && data) {
      setActors(data);
    }
  }

  // Calculate cost whenever inputs change
  useEffect(() => {
    calculateCost();
  }, [adType, selectedActor, durationDays, budgetGoogle, budgetInstagram, budgetFacebook, budgetYoutube]);

  async function calculateCost() {
    if (currentStep < 3) return;

    const input: CostCalculationInput = {
      adType,
      actorId: selectedActor || undefined,
      durationDays,
      budgetGoogleAds: budgetGoogle,
      budgetInstagramAds: budgetInstagram,
      budgetFacebookAds: budgetFacebook,
      budgetYoutubeAds: budgetYoutube,
      subscriptionDiscount: 0, // TODO: Get from user's subscription
    };

    const errors = validateBudgetInputs(input);
    if (errors.length > 0) {
      setCostBreakdown(null);
      return;
    }

    const result = await calculateCampaignCost(input);
    const formatted = formatCostBreakdown(result);
    setCostBreakdown(formatted);
  }

  function handleNext() {
    // Validation for each step
    if (currentStep === 1 && adType === 'actor_ad' && !selectedActor) {
      toast({
        title: 'Actor Required',
        description: 'Please select an actor for your ad',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep === 2 && !isWorldwide && targetLocations[0].country === '') {
      toast({
        title: 'Location Required',
        description: 'Please select at least one target location',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleSubmit() {
    if (!profile) return;

    setLoading(true);

    try {
      // Upload video if user provided one
      let uploadedVideoUrl = null;
      if (videoFile && adType === 'upload_premade') {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('campaign-videos')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('campaign-videos')
          .getPublicUrl(fileName);
        
        uploadedVideoUrl = publicUrl;
      }

      // Create campaign request
      const { data, error } = await supabase
        .from('campaign_requests')
        .insert({
          user_id: profile.id,
          service_type: serviceType,
          ad_type: adType,
          actor_id: selectedActor || null,
          target_locations: isWorldwide ? [] : targetLocations,
          is_worldwide: isWorldwide,
          budget_google_ads: budgetGoogle,
          budget_instagram_ads: budgetInstagram,
          budget_facebook_ads: budgetFacebook,
          budget_youtube_ads: budgetYoutube,
          duration_days: durationDays,
          production_cost: costBreakdown?.lineItems[0]?.amount || 0,
          platform_cost: costBreakdown?.lineItems.slice(1, 5).reduce((sum: number, item: any) => sum + item.amount, 0) || 0,
          service_fee: costBreakdown?.lineItems[5]?.amount || 0,
          discount_amount: costBreakdown?.discount || 0,
          total_cost: costBreakdown?.total || 0,
          uploaded_video_url: uploadedVideoUrl,
          user_requirements: userRequirements,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: profile.id,
        campaign_id: data.id,
        action: 'campaign_created',
        details: { service_type: serviceType, ad_type: adType },
      });

      toast({
        title: 'Campaign Created!',
        description: 'Redirecting to integrations...',
      });

      // Redirect to integrations page
      navigate('/integrations');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  idx <= currentStep ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-xs mt-1 text-gray-400">{step}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">{STEPS[currentStep]}</CardTitle>
              <CardDescription className="text-gray-400">
                {currentStep === 0 && 'Choose the type of marketing service you need'}
                {currentStep === 1 && 'Select how your ad will be created'}
                {currentStep === 2 && 'Define your target audience locations'}
                {currentStep === 3 && 'Set your budget and campaign duration'}
                {currentStep === 4 && 'Review your campaign and complete payment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 0: Service Type */}
              {currentStep === 0 && (
                <RadioGroup value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 border border-gray-700 rounded-lg hover:border-primary cursor-pointer">
                      <RadioGroupItem value="brand_marketing" id="brand" />
                      <Label htmlFor="brand" className="flex-1 cursor-pointer">
                        <div className="font-semibold text-white">Brand Marketing</div>
                                                <div className="text-sm text-gray-400">Complete brand strategy and awareness campaigns</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-gray-700 rounded-lg hover:border-primary cursor-pointer">
                      <RadioGroupItem value="ad_creation" id="ad" />
                      <Label htmlFor="ad" className="flex-1 cursor-pointer">
                        <div className="font-semibold text-white">Ad Creation Only</div>
                        <div className="text-sm text-gray-400">Professional ad creation and optimization</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-gray-700 rounded-lg hover:border-primary cursor-pointer">
                      <RadioGroupItem value="full_marketing" id="full" />
                      <Label htmlFor="full" className="flex-1 cursor-pointer">
                        <div className="font-semibold text-white">Full Marketing Package</div>
                        <div className="text-sm text-gray-400">End-to-end marketing solution with all platforms</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {/* Step 1: Ad Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <RadioGroup value={adType} onValueChange={(v) => setAdType(v as AdType)}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-6 border rounded-lg cursor-pointer ${adType === 'actor_ad' ? 'border-primary bg-primary/10' : 'border-gray-700'}`}
                        onClick={() => setAdType('actor_ad')}>
                        <RadioGroupItem value="actor_ad" id="actor" className="mb-4" />
                        <Video className="w-12 h-12 mb-3 text-primary" />
                        <div className="font-semibold text-white mb-2">Actor Ad</div>
                        <div className="text-sm text-gray-400">Professional actors for your campaign</div>
                      </div>
                      <div className={`p-6 border rounded-lg cursor-pointer ${adType === 'ai_generated' ? 'border-primary bg-primary/10' : 'border-gray-700'}`}
                        onClick={() => setAdType('ai_generated')}>
                        <RadioGroupItem value="ai_generated" id="ai" className="mb-4" />
                        <Brain className="w-12 h-12 mb-3 text-primary" />
                        <div className="font-semibold text-white mb-2">AI Generated</div>
                        <div className="text-sm text-gray-400">AI-powered ad creation</div>
                      </div>
                      <div className={`p-6 border rounded-lg cursor-pointer ${adType === 'upload_premade' ? 'border-primary bg-primary/10' : 'border-gray-700'}`}
                        onClick={() => setAdType('upload_premade')}>
                        <RadioGroupItem value="upload_premade" id="upload" className="mb-4" />
                        <Upload className="w-12 h-12 mb-3 text-primary" />
                        <div className="font-semibold text-white mb-2">Upload Video</div>
                        <div className="text-sm text-gray-400">Use your own video content</div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Actor Selection */}
                  {adType === 'actor_ad' && (
                    <div>
                      <Label className="text-white mb-4 block">Select Actor</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {actors.map((actor) => (
                          <div
                            key={actor.id}
                            onClick={() => setSelectedActor(actor.id)}
                            className={`p-4 border rounded-lg cursor-pointer flex items-center space-x-4 ${
                              selectedActor === actor.id ? 'border-primary bg-primary/10' : 'border-gray-700'
                            }`}
                          >
                            <img src={actor.profile_image_url || '/placeholder.svg'} alt={actor.name} className="w-16 h-16 rounded-full object-cover" />
                            <div className="flex-1">
                              <div className="font-semibold text-white">{actor.name}</div>
                              <div className="text-sm text-gray-400">{actor.specialization?.join(', ')}</div>
                              <div className="text-primary font-semibold">₹{actor.cost_per_ad.toLocaleString()}</div>
                            </div>
                            {selectedActor === actor.id && <Check className="w-5 h-5 text-primary" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Upload */}
                  {adType === 'upload_premade' && (
                    <div>
                      <Label htmlFor="video" className="text-white mb-2 block">Upload Your Video</Label>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      {videoFile && (
                        <p className="text-sm text-gray-400 mt-2">Selected: {videoFile.name}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Target Locations */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-4 bg-gray-700/50 rounded-lg">
                    <Checkbox
                      id="worldwide"
                      checked={isWorldwide}
                      onCheckedChange={(checked) => setIsWorldwide(checked as boolean)}
                    />
                    <Label htmlFor="worldwide" className="text-white cursor-pointer">
                      Target Worldwide (All Countries)
                    </Label>
                  </div>

                  {!isWorldwide && (
                    <div className="space-y-4">
                      {targetLocations.map((location, idx) => (
                        <Card key={idx} className="bg-gray-700/50 border-gray-600">
                          <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-white mb-2 block">Country</Label>
                                <Input
                                  value={location.country}
                                  onChange={(e) => {
                                    const newLocations = [...targetLocations];
                                    newLocations[idx].country = e.target.value;
                                    setTargetLocations(newLocations);
                                  }}
                                  placeholder="e.g., United States"
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-white mb-2 block">State/Province</Label>
                                <Input
                                  value={location.state}
                                  onChange={(e) => {
                                    const newLocations = [...targetLocations];
                                    newLocations[idx].state = e.target.value;
                                    setTargetLocations(newLocations);
                                  }}
                                  placeholder="e.g., California"
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-white mb-2 block">City</Label>
                                <Input
                                  value={location.city}
                                  onChange={(e) => {
                                    const newLocations = [...targetLocations];
                                    newLocations[idx].city = e.target.value;
                                    setTargetLocations(newLocations);
                                  }}
                                  placeholder="e.g., Los Angeles"
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-white mb-2 block">Area/Neighborhood</Label>
                                <Input
                                  value={location.area}
                                  onChange={(e) => {
                                    const newLocations = [...targetLocations];
                                    newLocations[idx].area = e.target.value;
                                    setTargetLocations(newLocations);
                                  }}
                                  placeholder="e.g., Downtown"
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setTargetLocations([...targetLocations, { country: '', state: '', city: '', area: '' }])}
                        className="w-full"
                      >
                        Add Another Location
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Budget & Duration */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white mb-2 block">Campaign Duration (Days)</Label>
                    <Input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                      min={1}
                      max={365}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Google Ads Budget</Label>
                      <Input
                        type="number"
                        value={budgetGoogle}
                        onChange={(e) => setBudgetGoogle(parseFloat(e.target.value) || 0)}
                        min={0}
                        step={10}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Instagram Ads Budget</Label>
                      <Input
                        type="number"
                        value={budgetInstagram}
                        onChange={(e) => setBudgetInstagram(parseFloat(e.target.value) || 0)}
                        min={0}
                        step={10}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Facebook Ads Budget</Label>
                      <Input
                        type="number"
                        value={budgetFacebook}
                        onChange={(e) => setBudgetFacebook(parseFloat(e.target.value) || 0)}
                        min={0}
                        step={10}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">YouTube Ads Budget</Label>
                      <Input
                        type="number"
                        value={budgetYoutube}
                        onChange={(e) => setBudgetYoutube(parseFloat(e.target.value) || 0)}
                        min={0}
                        step={10}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="$0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Additional Requirements (Optional)</Label>
                    <Textarea
                      value={userRequirements}
                      onChange={(e) => setUserRequirements(e.target.value)}
                      placeholder="Any specific requirements or preferences for your campaign..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review & Payment */}
              {currentStep === 4 && costBreakdown && (
                <div className="space-y-6">
                  <div className="bg-gray-700/50 p-6 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h3>
                    {costBreakdown.lineItems.map((item: any, idx: number) => (
                      item.amount > 0 && (
                        <div key={idx} className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-medium">{item.label}</div>
                            <div className="text-sm text-gray-400">{item.description}</div>
                          </div>
                          <div className="text-white font-semibold">${item.amount.toFixed(2)}</div>
                        </div>
                      )
                    ))}
                    
                    {costBreakdown.discount > 0 && (
                      <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                        <div className="text-green-400 font-medium">Subscription Discount</div>
                        <div className="text-green-400 font-semibold">-${costBreakdown.discount.toFixed(2)}</div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                      <div className="text-xl font-bold text-white">Total Amount</div>
                      <div className="text-2xl font-bold text-primary">${costBreakdown.total.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary p-4 rounded-lg">
                    <p className="text-white text-sm">
                      By clicking "Create Campaign & Pay", you agree to our terms of service. Your campaign will be assigned to our service team once payment is confirmed.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !costBreakdown}>
              {loading ? 'Creating...' : 'Create Campaign & Pay'}
              <DollarSign className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
