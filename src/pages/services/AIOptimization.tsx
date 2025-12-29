import { motion } from "framer-motion";
import { Zap, ArrowLeft, Brain, Sparkles, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AIOptimization = () => {
  const features = [
    {
      icon: Brain,
      title: "Smart Algorithms",
      description: "Machine learning continuously optimizes your campaigns for better results"
    },
    {
      icon: Sparkles,
      title: "Auto-Bidding",
      description: "AI adjusts bids in real-time to maximize ROI and minimize costs"
    },
    {
      icon: Target,
      title: "Audience Optimization",
      description: "Automatically find and target your most valuable customer segments"
    },
    {
      icon: TrendingUp,
      title: "Performance Prediction",
      description: "Forecast campaign outcomes before spending your budget"
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 p-4 mx-auto mb-6">
            <Zap className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
            AI Optimization
          </h1>
          <p className="text-xl text-muted-foreground">
            Machine learning algorithms continuously optimize your campaigns for better results
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-2.5 mb-3">
                  <feature.icon className="w-full h-full text-violet-500" />
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
          <Card className="border-primary/50 bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Enable AI Optimization</CardTitle>
              <CardDescription className="text-base">
                Let AI take your campaigns to the next level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/user/campaign-wizard">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AIOptimization;
