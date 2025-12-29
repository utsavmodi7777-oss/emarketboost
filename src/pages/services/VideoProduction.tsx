import { motion } from "framer-motion";
import { Video, ArrowLeft, Film, Sparkles, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VideoProduction = () => {
  const features = [
    {
      icon: Film,
      title: "Professional Quality",
      description: "Expert team creates stunning video ads from concept to final delivery"
    },
    {
      icon: Sparkles,
      title: "AI Enhancement",
      description: "Leverage AI tools for editing, effects, and optimization"
    },
    {
      icon: Users,
      title: "Professional Actors",
      description: "Choose from our network of talented actors and influencers"
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Get your video ads delivered within 5-7 business days"
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-4 mx-auto mb-6">
            <Video className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Video Production
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional video ads created by our expert team, from concept to final delivery
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 p-2.5 mb-3">
                  <feature.icon className="w-full h-full text-orange-500" />
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
          <Card className="border-primary/50 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Start Your Video Project</CardTitle>
              <CardDescription className="text-base">
                Book a consultation with our video production team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/ads/create">
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

export default VideoProduction;
