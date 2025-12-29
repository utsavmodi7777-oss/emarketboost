import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  gradient?: string;
}

const ServiceCard = ({ title, description, icon: Icon, link, gradient = "from-blue-500 to-purple-500" }: ServiceCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Not logged in - redirect to auth page
      toast({
        title: "Authentication Required",
        description: `Please login or sign up to access ${title}`,
        variant: "default",
      });
      
      navigate("/auth", {
        state: { 
          message: `Please login to access ${title}`,
          returnTo: link
        }
      });
    } else {
      // Logged in - navigate to service
      navigate(link);
    }
  };

  return (
    <div onClick={handleClick} className="block h-full">
      <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-full"
      >
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
          <CardHeader className="space-y-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} p-3 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow duration-300`}>
              <Icon className="w-full h-full text-white" />
            </div>
            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-muted-foreground leading-relaxed">
              {description}
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ServiceCard;
