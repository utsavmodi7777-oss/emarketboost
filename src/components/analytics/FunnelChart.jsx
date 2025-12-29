import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowDown } from 'lucide-react';

const FunnelChart = ({ funnelData }) => {
  const maxValue = funnelData[0]?.value || 100;

  const getColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-emerald-500'
    ];
    return colors[index] || 'bg-gray-500';
  };

  const getGlowColor = (index) => {
    const colors = [
      'shadow-blue-500/50',
      'shadow-purple-500/50',
      'shadow-green-500/50',
      'shadow-orange-500/50',
      'shadow-emerald-500/50'
    ];
    return colors[index] || 'shadow-gray-500/50';
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          User Journey Funnel
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Track how users move through your marketing funnel
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 py-4">
          {funnelData.map((stage, index) => {
            const widthPercentage = (stage.value / maxValue) * 100;
            const isLast = index === funnelData.length - 1;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">
                      {stage.value.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs min-w-[60px] text-right">
                      ({stage.percentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-800/50 rounded-full h-12 overflow-hidden">
                    <div
                      className={`h-full ${getColor(index)} transition-all duration-1000 ease-out rounded-full flex items-center justify-end px-4 shadow-lg ${getGlowColor(index)}`}
                      style={{ width: `${widthPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full" />
                    </div>
                  </div>
                </div>

                {!isLast && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="text-gray-600 h-5 w-5 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Conversion Rate Summary */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Click Rate</div>
              <div className="text-lg font-bold text-blue-400">
                {((funnelData[1]?.value / funnelData[0]?.value) * 100).toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Visit Rate</div>
              <div className="text-lg font-bold text-purple-400">
                {((funnelData[2]?.value / funnelData[1]?.value) * 100).toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Cart Rate</div>
              <div className="text-lg font-bold text-green-400">
                {((funnelData[3]?.value / funnelData[2]?.value) * 100).toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Purchase Rate</div>
              <div className="text-lg font-bold text-emerald-400">
                {((funnelData[4]?.value / funnelData[3]?.value) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelChart;
