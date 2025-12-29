import React from 'react';
import { TrendingUp, TrendingDown, Eye, MousePointerClick, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const OverviewCards = ({ data }) => {
  const cards = [
    {
      title: 'Total Ad Views',
      value: data.totalViews?.toLocaleString() || '0',
      growth: data.viewsGrowth || 0,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Clicks',
      value: data.totalClicks?.toLocaleString() || '0',
      growth: data.clicksGrowth || 0,
      icon: MousePointerClick,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Website Visits',
      value: data.totalVisits?.toLocaleString() || '0',
      growth: data.visitsGrowth || 0,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Conversions',
      value: data.totalConversions?.toLocaleString() || '0',
      growth: data.conversionsGrowth || 0,
      icon: ShoppingCart,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Total Profit',
      value: `$${data.totalProfit?.toLocaleString() || '0'}`,
      growth: data.profitGrowth || 0,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        const GrowthIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card 
            key={index} 
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 backdrop-blur-xl hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {card.value}
              </div>
              <div className="flex items-center space-x-1">
                <GrowthIcon 
                  className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(card.growth).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewCards;
