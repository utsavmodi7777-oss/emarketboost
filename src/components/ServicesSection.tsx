import { motion } from "framer-motion";
import { 
  Megaphone, 
  Video, 
  Target, 
  BarChart3, 
  Users, 
  Zap,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ServiceCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const services = [
  {
    icon: Megaphone,
    title: "Ad Campaigns",
    description: "Launch targeted advertising campaigns across multiple platforms with AI-optimized placements.",
    link: "/services/ad-campaigns",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Video,
    title: "Video Production",
    description: "Professional video ads created by our expert team, from concept to final delivery.",
    link: "/services/video-production",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Target,
    title: "Audience Targeting",
    description: "Reach your ideal customers with precision targeting based on demographics and behavior.",
    link: "/services/audience-targeting",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights and detailed reports to track campaign performance and ROI.",
    link: "/services/analytics",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Lead Generation",
    description: "Convert visitors into qualified leads with optimized landing pages and funnels.",
    link: "/services/lead-generation",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Zap,
    title: "AI Optimization",
    description: "Machine learning algorithms continuously optimize your campaigns for better results.",
    link: "/services/ai-optimization",
    gradient: "from-violet-500 to-purple-500",
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExploreServices = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please login or sign up to explore our services",
        variant: "default",
      });
      
      navigate("/auth", {
        state: { 
          message: "Please login to explore our services"
        }
      });
    } else {
      navigate("/services");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="services" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Our Services
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
            Everything You Need to{" "}
            <span className="text-gradient">Grow</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From ad creation to performance tracking, we provide end-to-end 
            marketing solutions tailored to your business goals.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
                icon={service.icon}
                link={service.link}
                gradient={service.gradient}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button variant="hero" size="lg" onClick={handleExploreServices}>
            Explore All Services
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
