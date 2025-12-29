import { Megaphone, Video, Target, BarChart3, Users, Zap } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

const Services = () => {
  const services = [
    {
      title: "Ad Campaigns",
      description: "Launch targeted advertising campaigns across multiple platforms with AI-optimized placements.",
      icon: Megaphone,
      link: "/services/ad-campaigns",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Video Production",
      description: "Professional video ads created by our expert team, from concept to final delivery.",
      icon: Video,
      link: "/services/video-production",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Audience Targeting",
      description: "Reach your ideal customers with precision targeting based on demographics and behavior.",
      icon: Target,
      link: "/services/audience-targeting",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Analytics Dashboard",
      description: "Real-time insights and detailed reports to track campaign performance and ROI.",
      icon: BarChart3,
      link: "/services/analytics",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Lead Generation",
      description: "Convert visitors into qualified leads with optimized landing pages and funnels.",
      icon: Users,
      link: "/services/lead-generation",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "AI Optimization",
      description: "Machine learning algorithms continuously optimize your campaigns for better results.",
      icon: Zap,
      link: "/services/ai-optimization",
      gradient: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive marketing solutions to grow your business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
              link={service.link}
              gradient={service.gradient}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
