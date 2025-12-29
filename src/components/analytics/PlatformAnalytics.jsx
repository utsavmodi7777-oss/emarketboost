import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

const PlatformAnalytics = ({ platformData }) => {
  // Transform data for the chart
  const chartData = platformData.map(platform => ({
    name: platform.platform.replace(' Ads', ''),
    Views: platform.views,
    Clicks: platform.clicks,
    Visits: platform.visits,
    Conversions: platform.conversions
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Platform Table */}
      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Platform Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-700/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800/50 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 font-semibold">Platform</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-right">Views</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-right">Clicks</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-right">Visits</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-right">Conversions</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-right">Cost</TableHead>
                  <TableHead className="text-gray-300 font-semibold text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformData.map((platform, index) => (
                  <TableRow 
                    key={index}
                    className="hover:bg-gray-800/30 transition-colors border-gray-700/30"
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{platform.icon}</span>
                        <span>{platform.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {platform.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {platform.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {platform.visits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {platform.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      ${platform.cost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`${
                          platform.roi > 10000 ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                          platform.roi > 5000 ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                          'bg-orange-500/20 text-orange-400 border-orange-500/50'
                        }`}
                      >
                        ${platform.roi.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Platform Chart */}
      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Platform Comparison Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="Views" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Clicks" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Visits" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Conversions" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAnalytics;
