import { motion } from "framer-motion";
import { Users, ArrowLeft, UserPlus, Mail, PhoneCall, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LeadGeneration = () => {
  const features = [
    {
      icon: UserPlus,
      title: "Lead Capture",
      description: "Convert visitors into qualified leads with optimized landing pages"
    },
    {
      icon: Mail,
      title: "Email Campaigns",
      description: "Nurture leads with automated email sequences and follow-ups"
    },
    {
      icon: PhoneCall,
      title: "Contact Management",
      description: "Organize and track all your leads in one centralized system"
    },
    {
      icon: Database,
      title: "Lead Scoring",
      description: "Prioritize high-quality leads with AI-powered scoring"
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-4 mx-auto mb-6">
            <Users className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            Lead Generation
          </h1>
          <p className="text-xl text-muted-foreground">
            Convert visitors into qualified leads with optimized landing pages and funnels
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2.5 mb-3">
                  <feature.icon className="w-full h-full text-green-500" />
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
          <Card className="border-primary/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Start Generating Leads</CardTitle>
              <CardDescription className="text-base">
                Create your first lead generation campaign today
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

export default LeadGeneration;
