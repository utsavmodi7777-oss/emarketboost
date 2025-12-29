import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import OverviewCards from '../components/analytics/OverviewCards';
import PlatformAnalytics from '../components/analytics/PlatformAnalytics';
import FunnelChart from '../components/analytics/FunnelChart';
import RevenueCharts from '../components/analytics/RevenueCharts';
import LocationAnalytics from '../components/analytics/LocationAnalytics';
import CampaignSwitcher from '../components/analytics/CampaignSwitcher';
import ExportButtons from '../components/analytics/ExportButtons';
import {
  fetchUserAnalytics,
  fetchPlatformAnalytics,
  fetchRevenueData,
  fetchLocationAnalytics,
  fetchFunnelData,
  fetchCampaignProducts,
  startRealTimeUpdates
} from '../utils/api';

const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({});
  const [platformData, setPlatformData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [revenueData, setRevenueData] = useState({ monthly: [], daily: [], roiTrend: [] });
  const [campaignProducts, setCampaignProducts] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(1);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load all analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [overview, platforms, funnel, location, revenue, campaigns] = await Promise.all([
        fetchUserAnalytics('user-id'),
        fetchPlatformAnalytics('user-id'),
        fetchFunnelData('user-id'),
        fetchLocationAnalytics('user-id'),
        fetchRevenueData('user-id'),
        fetchCampaignProducts('user-id')
      ]);

      setOverviewData(overview);
      setPlatformData(platforms);
      setFunnelData(funnel);
      setLocationData(location);
      setRevenueData(revenue);
      setCampaignProducts(campaigns);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time updates simulation
  useEffect(() => {
    let cleanup;
    
    if (isRealTimeActive) {
      cleanup = startRealTimeUpdates((updates) => {
        setOverviewData(prev => ({
          ...prev,
          totalViews: (prev.totalViews || 0) + updates.views,
          totalClicks: (prev.totalClicks || 0) + updates.clicks,
          totalConversions: (prev.totalConversions || 0) + updates.conversions
        }));
        setLastUpdate(new Date());
      });
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [isRealTimeActive]);

  const handleRefresh = () => {
    loadAnalyticsData();
    setLastUpdate(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800/50 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-500" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Real-time insights into your marketing performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
                variant={isRealTimeActive ? "default" : "outline"}
                className={`${
                  isRealTimeActive 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className={`h-2 w-2 rounded-full mr-2 ${isRealTimeActive ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
                {isRealTimeActive ? 'Live' : 'Start Live Updates'}
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="hidden md:block">
                <Badge variant="outline" className="border-gray-700 text-gray-400">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <section>
            <OverviewCards data={overviewData} />
          </section>

          {/* Campaign Switcher & Export */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CampaignSwitcher
                campaigns={campaignProducts}
                selectedCampaign={selectedCampaign}
                onCampaignChange={setSelectedCampaign}
              />
            </div>
            <div>
              <ExportButtons analyticsData={overviewData} />
            </div>
          </section>

          {/* Funnel Chart */}
          <section>
            <FunnelChart funnelData={funnelData} />
          </section>

          {/* Platform Analytics */}
          <section>
            <PlatformAnalytics platformData={platformData} />
          </section>

          {/* Revenue Charts */}
          <section>
            <RevenueCharts revenueData={revenueData} />
          </section>

          {/* Location Analytics */}
          <section>
            <LocationAnalytics locationData={locationData} />
          </section>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm">
            📊 <strong className="text-white">Professional Analytics Dashboard</strong> • 
            Combining insights from Google Ads, Facebook Ads, Instagram, and YouTube • 
            Built for eMarketBoost Marketing Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
