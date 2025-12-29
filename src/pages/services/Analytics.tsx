import { motion } from "framer-motion";
import { BarChart3, ArrowLeft, LineChart, PieChart, Activity, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Analytics = () => {
  const features = [
    {
      icon: LineChart,
      title: "Performance Tracking",
      description: "Monitor campaign metrics in real-time with live dashboards"
    },
    {
      icon: PieChart,
      title: "ROI Analysis",
      description: "Track return on investment and cost per acquisition"
    },
    {
      icon: Activity,
      title: "Engagement Metrics",
      description: "Analyze clicks, impressions, conversions, and user interactions"
    },
    {
      icon: TrendingUp,
      title: "Trend Insights",
      description: "Identify patterns and optimize based on historical data"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 mx-auto mb-6">
            <BarChart3 className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time insights and detailed reports to track campaign performance and ROI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-2.5 mb-3">
                  <feature.icon className="w-full h-full text-amber-500" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Card className="border-primary/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">View Your Analytics</CardTitle>
              <CardDescription className="text-base">
                Access comprehensive reports and real-time performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/user/dashboard">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
