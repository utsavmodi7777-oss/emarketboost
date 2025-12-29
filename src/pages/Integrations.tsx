import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const integrations = [
  {
    name: "Google Ads",
    category: "Advertising",
    description: "Sync your Google Ads campaigns and track performance in real-time",
    logo: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
    popular: true,
    features: ["Auto-sync campaigns", "Real-time analytics", "Budget management"],
  },
  {
    name: "Facebook Ads",
    category: "Social Media",
    description: "Connect your Facebook ad account for comprehensive social media advertising",
    logo: "🔵",
    popular: true,
    features: ["Campaign automation", "Audience insights", "A/B testing"],
  },
  {
    name: "Instagram",
    category: "Social Media",
    description: "Manage Instagram ad campaigns and track engagement metrics",
    logo: "📷",
    popular: true,
    features: ["Story ads", "Feed posts", "Engagement tracking"],
  },
  {
    name: "LinkedIn Ads",
    category: "B2B Marketing",
    description: "Target professionals with LinkedIn's powerful advertising platform",
    logo: "💼",
    popular: false,
    features: ["Professional targeting", "Lead generation", "Sponsored content"],
  },
  {
    name: "TikTok Ads",
    category: "Social Media",
    description: "Reach younger audiences with engaging TikTok video advertisements",
    logo: "🎵",
    popular: true,
    features: ["Video ads", "Viral potential", "Trend insights"],
  },
  {
    name: "Shopify",
    category: "E-commerce",
    description: "Integrate your Shopify store for seamless product advertising",
    logo: "🛍️",
    popular: true,
    features: ["Product sync", "Dynamic ads", "Sales tracking"],
  },
  {
    name: "WordPress",
    category: "CMS",
    description: "Connect your WordPress site for easy content marketing",
    logo: "📝",
    popular: false,
    features: ["Content sync", "SEO optimization", "Traffic analytics"],
  },
  {
    name: "Mailchimp",
    category: "Email Marketing",
    description: "Sync email campaigns with your advertising efforts",
    logo: "📧",
    popular: false,
    features: ["Email automation", "List management", "Campaign tracking"],
  },
  {
    name: "Zapier",
    category: "Automation",
    description: "Connect 5000+ apps with automated workflows",
    logo: "⚡",
    popular: true,
    features: ["Custom workflows", "Multi-app sync", "Automation"],
  },
  {
    name: "Salesforce",
    category: "CRM",
    description: "Integrate your CRM data for better lead management",
    logo: "☁️",
    popular: false,
    features: ["Lead tracking", "Sales pipeline", "Customer data"],
  },
  {
    name: "HubSpot",
    category: "Marketing",
    description: "All-in-one marketing platform integration",
    logo: "🎯",
    popular: false,
    features: ["Marketing automation", "CRM sync", "Analytics"],
  },
  {
    name: "Stripe",
    category: "Payment",
    description: "Process payments and track revenue from your campaigns",
    logo: "💳",
    popular: true,
    features: ["Payment processing", "Revenue tracking", "Subscription management"],
  },
];

const categories = ["All", "Advertising", "Social Media", "E-commerce", "Marketing", "Automation"];

const Integrations = () => {
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
            <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="font-display text-5xl md:text-7xl mb-6">
              Powerful <span className="text-gradient">Integrations</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect your favorite tools and platforms. Work seamlessly across your entire marketing stack.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex items-center justify-center gap-3 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {categories.map((category, i) => (
              <Button
                key={category}
                variant={i === 0 ? "hero" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className="p-6 h-full flex flex-col hover:border-primary/50 transition-colors group">
                  {integration.popular && (
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4 self-start">
                      ⭐ Popular
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{integration.logo}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-1 group-hover:text-primary transition-colors">
                        {integration.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">{integration.category}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 flex-1">
                    {integration.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {integration.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary">
                    Connect
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-4">
                    Need a Custom Integration?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Use our powerful API to build custom integrations tailored to your specific needs. 
                    Comprehensive documentation and developer support included.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      "RESTful API",
                      "WebHooks support",
                      "Rate limiting",
                      "OAuth 2.0",
                      "Comprehensive docs",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="hero" size="lg">
                    View API Documentation
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm">
                  <div className="text-primary mb-2">// Sample API Request</div>
                  <div className="text-muted-foreground">
                    <div>curl -X POST \</div>
                    <div className="ml-4">https://api.emarketboost.com/v1/campaigns \</div>
                    <div className="ml-4">-H "Authorization: Bearer YOUR_TOKEN" \</div>
                    <div className="ml-4">-H "Content-Type: application/json" \</div>
                    <div className="ml-4">-d '&#123;"name": "Campaign", "budget": 5000&#125;'</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl mb-6">
              Start Connecting Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              All integrations are available on Professional and Enterprise plans
            </p>
            <Button variant="hero" size="xl">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Integrations;
