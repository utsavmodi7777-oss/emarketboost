import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Package, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Badge } from '../ui/badge';

const CampaignSwitcher = ({ campaigns, selectedCampaign, onCampaignChange }) => {
  const current = campaigns.find(c => c.id === selectedCampaign) || campaigns[0];

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="h-6 w-6 text-purple-500" />
          Campaign Performance
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Switch between different products to view specific analytics
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Campaign Selector */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Campaign/Product</label>
            <Select 
              value={selectedCampaign.toString()} 
              onValueChange={(value) => onCampaignChange(parseInt(value))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-xs text-gray-400">Views</span>
              </div>
              <div className="text-xl font-bold text-white">
                {current.views.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-xs text-gray-400">Clicks</span>
              </div>
              <div className="text-xl font-bold text-white">
                {current.clicks.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Package className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-xs text-gray-400">Conversions</span>
              </div>
              <div className="text-xl font-bold text-white">
                {current.conversions.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-xs text-gray-400">Profit</span>
              </div>
              <div className="text-xl font-bold text-white">
                ${current.profit.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Best Platform</span>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30">
                {current.bestPlatform}
              </Badge>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Best Region</span>
              </div>
              <div className="text-sm font-semibold text-white truncate">
                {current.bestRegion.split(',')[0]}
              </div>
            </div>
          </div>

          {/* Campaign Performance Summary */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Performance Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Click-Through Rate</span>
                <span className="text-sm font-bold text-blue-400">
                  {((current.clicks / current.views) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Conversion Rate</span>
                <span className="text-sm font-bold text-green-400">
                  {((current.conversions / current.clicks) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Average Revenue per Conversion</span>
                <span className="text-sm font-bold text-emerald-400">
                  ${(current.profit / current.conversions).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignSwitcher;
