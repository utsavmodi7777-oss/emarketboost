// Mock Analytics Data for EMarketBoost Platform

export const sampleOverviewData = {
  totalViews: 125430,
  totalClicks: 8762,
  totalVisits: 6234,
  totalConversions: 456,
  totalProfit: 45600,
  viewsGrowth: 12.5,
  clicksGrowth: 8.3,
  visitsGrowth: 15.2,
  conversionsGrowth: 22.1,
  profitGrowth: 28.4
};

export const platformData = [
  {
    platform: 'Google Ads',
    icon: '🔍',
    views: 45230,
    clicks: 3120,
    visits: 2340,
    conversions: 187,
    cost: 2500,
    roi: 16200,
    color: '#4285F4'
  },
  {
    platform: 'Instagram Ads',
    icon: '📸',
    views: 38650,
    clicks: 2890,
    visits: 1980,
    conversions: 142,
    cost: 1800,
    roi: 12400,
    color: '#E4405F'
  },
  {
    platform: 'Facebook Ads',
    icon: '👥',
    views: 28420,
    clicks: 1852,
    visits: 1234,
    conversions: 89,
    cost: 1500,
    roi: 7400,
    color: '#1877F2'
  },
  {
    platform: 'YouTube Ads',
    icon: '▶️',
    views: 13130,
    clicks: 900,
    visits: 680,
    conversions: 38,
    cost: 1200,
    roi: 2600,
    color: '#FF0000'
  }
];

export const funnelData = [
  { stage: 'Ad Views', value: 125430, percentage: 100 },
  { stage: 'Clicks', value: 8762, percentage: 7.0 },
  { stage: 'Website Visits', value: 6234, percentage: 5.0 },
  { stage: 'Add to Cart', value: 1245, percentage: 1.0 },
  { stage: 'Purchase', value: 456, percentage: 0.36 }
];

export const locationData = [
  { region: 'Mumbai, Maharashtra', views: 28450, clicks: 2134, conversions: 124, percentage: 22.7 },
  { region: 'Delhi, NCR', views: 24320, clicks: 1876, conversions: 98, percentage: 19.4 },
  { region: 'Bangalore, Karnataka', views: 21560, clicks: 1654, conversions: 87, percentage: 17.2 },
  { region: 'Pune, Maharashtra', views: 15230, clicks: 1123, conversions: 56, percentage: 12.1 },
  { region: 'Chennai, Tamil Nadu', views: 12340, clicks: 934, conversions: 42, percentage: 9.8 },
  { region: 'Hyderabad, Telangana', views: 9870, clicks: 756, conversions: 28, percentage: 7.9 },
  { region: 'Kolkata, West Bengal', views: 6540, clicks: 498, conversions: 12, percentage: 5.2 },
  { region: 'Ahmedabad, Gujarat', views: 4230, clicks: 321, conversions: 6, percentage: 3.4 },
  { region: 'Jaipur, Rajasthan', views: 2100, clicks: 178, conversions: 2, percentage: 1.7 },
  { region: 'Lucknow, UP', views: 790, clicks: 88, conversions: 1, percentage: 0.6 }
];

export const monthlyRevenueData = [
  { month: 'Jan', revenue: 28400, cost: 8200, profit: 20200 },
  { month: 'Feb', revenue: 31200, cost: 8900, profit: 22300 },
  { month: 'Mar', revenue: 35600, cost: 9500, profit: 26100 },
  { month: 'Apr', revenue: 38900, cost: 10200, profit: 28700 },
  { month: 'May', revenue: 42300, cost: 11000, profit: 31300 },
  { month: 'Jun', revenue: 45600, cost: 11800, profit: 33800 },
  { month: 'Jul', revenue: 48200, cost: 12500, profit: 35700 },
  { month: 'Aug', revenue: 51800, cost: 13200, profit: 38600 },
  { month: 'Sep', revenue: 49500, cost: 12800, profit: 36700 },
  { month: 'Oct', revenue: 53200, cost: 13900, profit: 39300 },
  { month: 'Nov', revenue: 56700, cost: 14500, profit: 42200 },
  { month: 'Dec', revenue: 45600, cost: 12000, profit: 33600 }
];

export const dailyPerformanceData = [
  { day: 'Mon', views: 18200, clicks: 1234, conversions: 67 },
  { day: 'Tue', views: 19500, clicks: 1356, conversions: 72 },
  { day: 'Wed', views: 17800, clicks: 1189, conversions: 63 },
  { day: 'Thu', views: 21300, clicks: 1478, conversions: 81 },
  { day: 'Fri', views: 22100, clicks: 1523, conversions: 89 },
  { day: 'Sat', views: 15400, clicks: 1045, conversions: 52 },
  { day: 'Sun', views: 11130, clicks: 937, conversions: 32 }
];

export const campaignProducts = [
  {
    id: 1,
    name: 'Premium SEO Package',
    views: 45230,
    clicks: 3120,
    conversions: 187,
    profit: 18700,
    bestPlatform: 'Google Ads',
    bestRegion: 'Mumbai, Maharashtra',
    price: 100
  },
  {
    id: 2,
    name: 'Social Media Marketing',
    views: 52340,
    clicks: 3890,
    conversions: 198,
    profit: 19800,
    bestPlatform: 'Instagram Ads',
    bestRegion: 'Delhi, NCR',
    price: 100
  },
  {
    id: 3,
    name: 'Content Marketing Services',
    views: 27860,
    clicks: 1752,
    conversions: 71,
    profit: 7100,
    bestPlatform: 'Facebook Ads',
    bestRegion: 'Bangalore, Karnataka',
    price: 100
  }
];

export const roiTrendData = [
  { month: 'Jan', roi: 246 },
  { month: 'Feb', roi: 251 },
  { month: 'Mar', roi: 275 },
  { month: 'Apr', roi: 281 },
  { month: 'May', roi: 285 },
  { month: 'Jun', roi: 286 },
  { month: 'Jul', roi: 286 },
  { month: 'Aug', roi: 292 },
  { month: 'Sep', roi: 287 },
  { month: 'Oct', roi: 283 },
  { month: 'Nov', roi: 291 },
  { month: 'Dec', roi: 280 }
];
