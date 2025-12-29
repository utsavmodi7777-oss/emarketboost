import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogArticles: Record<string, any> = {
  "1": {
    title: "10 Proven Strategies to Boost Your Ad Campaign Performance",
    category: "Marketing Tips",
    author: "Sarah Johnson",
    date: "Dec 8, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    content: `
      <p>In today's competitive digital landscape, optimizing your ad campaigns is crucial for success. Here are ten proven strategies that can significantly improve your campaign performance.</p>

      <h2>1. Define Clear Objectives</h2>
      <p>Before launching any campaign, establish specific, measurable goals. Whether it's brand awareness, lead generation, or conversions, having clear objectives helps you measure success and optimize effectively.</p>

      <h2>2. Know Your Audience Inside Out</h2>
      <p>Deep audience understanding is the foundation of successful advertising. Use analytics tools to create detailed buyer personas, including demographics, interests, pain points, and online behavior patterns.</p>

      <h2>3. Leverage A/B Testing</h2>
      <p>Never assume you know what works best. Continuously test different ad variations including headlines, images, copy, and calls-to-action. Even small changes can lead to significant performance improvements.</p>

      <h2>4. Optimize for Mobile</h2>
      <p>With over 60% of ad impressions coming from mobile devices, ensuring your ads and landing pages are mobile-optimized is non-negotiable. Test your campaigns on various devices and screen sizes.</p>

      <h2>5. Use Retargeting Strategically</h2>
      <p>Don't let potential customers slip away. Implement smart retargeting campaigns to re-engage users who've shown interest but haven't converted yet. Segment your retargeting audiences for better results.</p>

      <h2>6. Focus on Quality Score</h2>
      <p>In platforms like Google Ads, quality score directly impacts your ad costs and positions. Improve your quality score by ensuring ad relevance, optimizing landing pages, and maintaining good click-through rates.</p>

      <h2>7. Implement Conversion Tracking</h2>
      <p>You can't improve what you don't measure. Set up comprehensive conversion tracking to understand which campaigns, keywords, and ads are driving actual results for your business.</p>

      <h2>8. Utilize Negative Keywords</h2>
      <p>Save your budget by excluding irrelevant searches. Regularly review search terms reports and add negative keywords to prevent your ads from showing for queries that won't convert.</p>

      <h2>9. Create Compelling Ad Copy</h2>
      <p>Your ad copy should be clear, benefit-focused, and include a strong call-to-action. Use power words, address pain points, and highlight what makes your offer unique.</p>

      <h2>10. Monitor and Adjust Regularly</h2>
      <p>Set up a regular schedule to review campaign performance. Look for trends, identify underperforming elements, and make data-driven adjustments to continuously improve results.</p>

      <h2>Conclusion</h2>
      <p>Improving ad campaign performance is an ongoing process that requires testing, analysis, and optimization. By implementing these strategies consistently, you'll see measurable improvements in your ROI and overall campaign effectiveness.</p>
    `,
  },
};

const BlogArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = blogArticles[id || "1"];

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/blog")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <span className="text-primary font-semibold text-sm mb-4 block">
                {article.category}
              </span>
              <h1 className="font-display text-4xl md:text-6xl mb-6">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{article.readTime}</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Share:</span>
                <Button variant="outline" size="sm" className="gap-2">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12 rounded-2xl overflow-hidden"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto"
              />
            </motion.div>

            {/* Article Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                color: "hsl(var(--foreground))",
              }}
            />

            {/* Author Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16"
            >
              <Card className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground flex-shrink-0">
                    {article.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-2">
                      {article.author}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Marketing Specialist at eMarket Boost. Passionate about helping businesses grow through effective digital marketing strategies.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Linkedin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogArticle;
