import { motion } from "framer-motion";
import { Target, ArrowLeft, MapPin, Users2, Brain, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AudienceTargeting = () => {
  const features = [
    {
      icon: MapPin,
      title: "Geo-Targeting",
      description: "Target specific locations from countries down to postal codes"
    },
    {
      icon: Users2,
      title: "Demographic Filters",
      description: "Reach the right age groups, genders, and income levels"
    },
    {
      icon: Brain,
      title: "Interest-Based",
      description: "Target users based on their interests, behaviors, and online activity"
    },
    {
      icon: Filter,
      title: "Advanced Segmentation",
      description: "Create custom audience segments with multiple criteria"
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 mx-auto mb-6">
            <Target className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Audience Targeting
          </h1>
          <p className="text-xl text-muted-foreground">
            Reach your ideal customers with precision targeting based on demographics and behavior
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2.5 mb-3">
                  <feature.icon className="w-full h-full text-purple-500" />
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
          <Card className="border-primary/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Define Your Target Audience</CardTitle>
              <CardDescription className="text-base">
                Build precise audience segments for your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/user/campaign-wizard">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Create Audience
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AudienceTargeting;
