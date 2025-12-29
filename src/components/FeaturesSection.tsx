import { motion } from "framer-motion";
import { 
  Shield, 
  Clock, 
  Headphones, 
  Globe,
  ChevronRight
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and security protocols to protect your data and campaigns.",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Round-the-clock campaign monitoring with instant alerts for any anomalies.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Expert account managers and support team ready to help you succeed.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Access to advertising networks spanning 190+ countries worldwide.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-secondary font-medium tracking-wider uppercase text-sm">
              Why Choose Us
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
              Built for{" "}
              <span className="text-gradient-reverse">Scale</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              Whether you're a startup or enterprise, our platform scales with your 
              business. Handle millions of ad impressions without breaking a sweat.
            </p>

            {/* Feature list */}
            <div className="space-y-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="flex gap-4 group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      {feature.title}
                      <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Dashboard mockup */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl" />
              
              {/* Card container */}
              <div className="relative glass-card p-6 rounded-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-semibold text-foreground">Campaign Performance</h4>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display text-gradient">+127%</div>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </div>

                {/* Chart placeholder */}
                <div className="h-48 relative mb-6">
                  <svg viewBox="0 0 400 150" className="w-full h-full">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 37.5}
                        x2="400"
                        y2={i * 37.5}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Area chart */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0,120 Q50,100 100,90 T200,60 T300,40 T400,20 L400,150 L0,150 Z"
                      fill="url(#chartGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    <motion.path
                      d="M0,120 Q50,100 100,90 T200,60 T300,40 T400,20"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Impressions", value: "2.4M" },
                    { label: "Clicks", value: "89.2K" },
                    { label: "Conversions", value: "3.2K" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-3 rounded-xl bg-muted/50">
                      <div className="font-display text-xl text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <motion.div
                className="absolute -right-4 top-1/2 -translate-y-1/2 glass-card p-4 rounded-xl shadow-xl"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">New Lead!</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
