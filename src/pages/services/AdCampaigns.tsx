import { motion } from "framer-motion";
import { Megaphone, ArrowLeft, Target, TrendingUp, Globe, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdCampaigns = () => {
  const features = [
    {
      icon: Target,
      title: "Multi-Platform Campaigns",
      description: "Launch ads across Facebook, Instagram, Google, and YouTube simultaneously"
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Optimization",
      description: "Automatically optimize your ad spend for maximum ROI"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Target audiences worldwide with precision geo-targeting"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track campaign performance with live dashboards and insights"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 mx-auto mb-6">
            <Megaphone className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Ad Campaigns
          </h1>
          <p className="text-xl text-muted-foreground">
            Launch targeted advertising campaigns across multiple platforms with AI-optimized placements
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2.5 mb-3">
                  <feature.icon className="w-full h-full text-blue-500" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Card className="border-primary/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Start Your Campaign?</CardTitle>
              <CardDescription className="text-base">
                Create your first ad campaign in minutes with our guided wizard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/user/campaign-wizard">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Create Campaign
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdCampaigns;
