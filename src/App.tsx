import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import CaseStudies from "./pages/CaseStudies";
import Profile from "./pages/Profile";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";

// Three-Panel System
import UserDashboard from "./pages/user/UserDashboard";
import CampaignWizard from "./pages/CampaignWizard";
import ServiceDashboard from "./pages/service/ServiceDashboard";
import ServiceDashboardNew from "./pages/service/ServiceDashboardNew";
import ServiceAuth from "./pages/service/ServiceAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAuth from "./pages/admin/AdminAuth";

// Service Pages
import Services from "./pages/Services";
import AdCampaigns from "./pages/services/AdCampaigns";
import VideoProduction from "./pages/services/VideoProduction";
import AudienceTargeting from "./pages/services/AudienceTargeting";
import Analytics from "./pages/services/Analytics";
import LeadGeneration from "./pages/services/LeadGeneration";
import AIOptimization from "./pages/services/AIOptimization";

// New Platform Pages
import ProductsList from "./pages/products/ProductsList";
import CreateProduct from "./pages/products/CreateProduct";
import CreateAd from "./pages/ads/CreateAd";
import AdsList from "./pages/ads/AdsList";
import CreateCampaign from "./pages/marketing/CreateCampaign";
import CampaignsList from "./pages/marketing/CampaignsList";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import SubscriptionPlans from "./pages/subscription/SubscriptionPlans";
import MySubscription from "./pages/subscription/MySubscription";
import RazorpayCheckout from "./pages/subscription/RazorpayCheckout";
import PaymentSuccess from "./pages/subscription/PaymentSuccess";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          
          {/* Old dashboard routes to user dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          
          {/* User Panel - Protected */}
          <Route path="/user" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/campaign-wizard" element={<ProtectedRoute requiredRole="user"><CampaignWizard /></ProtectedRoute>} />
          <Route path="/campaign/create" element={<ProtectedRoute><CampaignWizard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          {/* Service Panel - Protected */}
          <Route path="/service/login" element={<ServiceAuth />} />
          <Route path="/service" element={<ProtectedRoute requiredRole="service" redirectTo="/service/login"><ServiceDashboardNew /></ProtectedRoute>} />
          <Route path="/service/dashboard" element={<ProtectedRoute requiredRole="service" redirectTo="/service/login"><ServiceDashboardNew /></ProtectedRoute>} />
          
          {/* Admin Panel - Protected */}
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin" redirectTo="/admin/login"><AdminDashboard /></ProtectedRoute>} />
          
          {/* Marketing Pages - Public */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogArticle />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
          
          {/* Service Pages - Protected (Require Login) */}
          <Route path="/services" element={<Services />} />
          <Route path="/services/ad-campaigns" element={<ProtectedRoute><AdCampaigns /></ProtectedRoute>} />
          <Route path="/services/video-production" element={<ProtectedRoute><VideoProduction /></ProtectedRoute>} />
          <Route path="/services/audience-targeting" element={<ProtectedRoute><AudienceTargeting /></ProtectedRoute>} />
          <Route path="/services/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/services/lead-generation" element={<ProtectedRoute><LeadGeneration /></ProtectedRoute>} />
          <Route path="/services/ai-optimization" element={<ProtectedRoute><AIOptimization /></ProtectedRoute>} />
          
          {/* New Platform Routes - Protected */}
          <Route path="/products" element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
          <Route path="/products/create" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
          <Route path="/ads" element={<ProtectedRoute><AdsList /></ProtectedRoute>} />
          <Route path="/ads/create" element={<ProtectedRoute><CreateAd /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><CampaignsList /></ProtectedRoute>} />
          <Route path="/campaigns/create" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
          <Route path="/subscription" element={<SubscriptionPlans />} />
          <Route path="/subscription/checkout/:planId" element={<ProtectedRoute><RazorpayCheckout /></ProtectedRoute>} />
          <Route path="/subscription/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/subscription/manage" element={<ProtectedRoute><MySubscription /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
