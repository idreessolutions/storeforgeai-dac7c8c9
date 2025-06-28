
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Palette, 
  Package, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  Clock
} from "lucide-react";

interface HomePageProps {
  onGetStarted: () => void;
  onViewAutomation: () => void;
}

const HomePage = ({ onGetStarted, onViewAutomation }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Shopify Partnership Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-semibold border border-green-200">
              <div className="flex items-center gap-2">
                <img 
                  src="https://cdn.shopify.com/shopifycloud/brochure/assets/logo/shopify-logomark-color-f4f7f4d4e7a1a1a1.svg" 
                  alt="Shopify" 
                  className="w-5 h-5"
                />
                Powered by Shopify
              </div>
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Build Your Dream Shopify Store
              <span className="block text-4xl lg:text-6xl mt-2">in Minutes ⚡</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Launch a fully optimized, AI-enhanced store with real products, unique branding, 
              and Shopify integration – in minutes.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2">
                <Store className="w-4 h-4 mr-2" />
                AI-Powered Store Builder
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2">
                <Package className="w-4 h-4 mr-2" />
                10 Premium Products
              </Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Ready in Minutes
              </Badge>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Store className="mr-2 h-5 w-5" />
              Create My Store Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              onClick={onViewAutomation}
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200"
            >
              <Users className="mr-2 h-5 w-5" />
              View Automation Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white"></div>
                ))}
              </div>
              <span className="text-sm font-medium">2,000+ stores created</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-sm font-medium ml-1">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Average setup: 8 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform handles every aspect of store creation, 
              from product sourcing to theme customization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Product Generation */}
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Product Generation</h3>
                <p className="text-gray-600 mb-4">
                  Generate 10 winning products with real images, compelling descriptions, and optimized pricing for your niche.
                </p>
                <div className="flex justify-center">
                  <Badge className="bg-blue-100 text-blue-700">60+ Real Images</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Theme Customization */}
            <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Custom Branding</h3>
                <p className="text-gray-600 mb-4">
                  Professional theme installation with your chosen colors, fonts, and branding that matches your style.
                </p>
                <div className="flex justify-center">
                  <Badge className="bg-purple-100 text-purple-700">6 Style Options</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Shopify Integration */}
            <Card className="border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Setup</h3>
                <p className="text-gray-600 mb-4">
                  Seamless Shopify integration that connects directly to your store and uploads everything automatically.
                </p>
                <div className="flex justify-center">
                  <Badge className="bg-green-100 text-green-700">Fully Automated</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From idea to launch in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Tell Us About Your Vision",
                description: "Choose your niche, target audience, and store style preferences",
                icon: Store
              },
              {
                step: "2", 
                title: "Connect Your Shopify",
                description: "Link your Shopify store with our secure API integration",
                icon: Zap
              },
              {
                step: "3",
                title: "AI Generates Everything",
                description: "Watch as AI creates products, descriptions, and customizes your theme",
                icon: Package
              },
              {
                step: "4",
                title: "Launch & Sell",
                description: "Your professional store is ready to start making sales immediately",
                icon: CheckCircle
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Build Your Empire?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful entrepreneurs who've launched their stores with our AI platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Store className="mr-2 h-5 w-5" />
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-sm mt-6 opacity-75">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
