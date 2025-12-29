import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const caseStudies = [
  {
    id: 1,
    company: "TechStart Inc.",
    industry: "SaaS Technology",
    challenge: "Low conversion rates and high customer acquisition costs",
    solution: "Implemented AI-powered ad targeting and A/B testing strategies",
    results: {
      conversions: "+340%",
      cac: "-52%",
      roi: "+280%",
    },
    testimonial: "eMarket Boost completely transformed our marketing approach. The results exceeded all our expectations.",
    author: "Alex Thompson, CEO",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    logo: "🚀",
  },
  {
    id: 2,
    company: "StyleHub Fashion",
    industry: "E-commerce Fashion",
    challenge: "Struggling to reach target demographic and low brand awareness",
    solution: "Created compelling video ads and leveraged social media targeting",
    results: {
      engagement: "+425%",
      sales: "+156%",
      awareness: "+300%",
    },
    testimonial: "The video production quality was outstanding. Our brand visibility skyrocketed within weeks.",
    author: "Maria Garcia, Marketing Director",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
    logo: "👗",
  },
  {
    id: 3,
    company: "GrowthMetrics",
    industry: "Analytics Software",
    challenge: "Needed to scale marketing operations without increasing team size",
    solution: "Automated campaign management with AI optimization",
    results: {
      efficiency: "+500%",
      leads: "+220%",
      cost: "-45%",
    },
    testimonial: "The automation features saved us hundreds of hours while delivering better results than manual management.",
    author: "James Wilson, Founder",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    logo: "📊",
  },
  {
    id: 4,
    company: "FinanceHub",
    industry: "Financial Services",
    challenge: "Complex compliance requirements and need for precise targeting",
    solution: "Custom campaign setup with advanced audience segmentation",
    results: {
      qualified: "+180%",
      compliance: "100%",
      satisfaction: "98%",
    },
    testimonial: "They understood our unique compliance needs and delivered a solution that worked perfectly.",
    author: "Michael Brown, CMO",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    logo: "💰",
  },
];

const CaseStudies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-5xl md:text-7xl mb-6">
              Success <span className="text-gradient">Stories</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover how businesses like yours achieved remarkable results with eMarket Boost.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden">
                  <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                    {/* Image */}
                    <div className={`relative h-80 lg:h-auto ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                      <img
                        src={study.image}
                        alt={study.company}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <div className="absolute bottom-8 left-8">
                        <div className="text-6xl mb-4">{study.logo}</div>
                        <h3 className="font-display text-3xl text-foreground mb-2">
                          {study.company}
                        </h3>
                        <p className="text-primary font-semibold">{study.industry}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-8">
                        <h4 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">
                          The Challenge
                        </h4>
                        <p className="text-lg text-muted-foreground mb-6">
                          {study.challenge}
                        </p>

                        <h4 className="text-sm font-semibold text-secondary mb-2 uppercase tracking-wider">
                          The Solution
                        </h4>
                        <p className="text-lg text-muted-foreground">
                          {study.solution}
                        </p>
                      </div>

                      {/* Results */}
                      <div className="mb-8">
                        <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                          The Results
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(study.results).map(([key, value], i) => (
                            <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
                              <div className="font-display text-2xl md:text-3xl text-gradient mb-1">
                                {value}
                              </div>
                              <div className="text-xs text-muted-foreground uppercase">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Testimonial */}
                      <div className="border-l-4 border-primary pl-6 mb-6">
                        <p className="text-muted-foreground italic mb-3">
                          "{study.testimonial}"
                        </p>
                        <p className="font-semibold text-sm">
                          — {study.author}
                        </p>
                      </div>

                      <Link to="/auth">
                        <Button variant="hero" className="gap-2">
                          Start Your Success Story
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl mb-6">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of businesses achieving remarkable results with eMarket Boost.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CaseStudies;
