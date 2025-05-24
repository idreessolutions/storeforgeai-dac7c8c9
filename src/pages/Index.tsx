
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Store, Palette, Bot, Users, Crown, ArrowRight, Check, Star, Rocket, ShoppingCart, TrendingUp } from "lucide-react";
import StoreBuilder from "@/components/StoreBuilder";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  if (showBuilder) {
    return <StoreBuilder onBack={() => setShowBuilder(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              StoreForge AI
            </span>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Rocket className="h-3 w-3 mr-1" />
              AI-Powered Store Generation
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Build Your Dream{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Shopify Store
              </span>{" "}
              in Minutes
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Let AI create your complete store setup - from branding and products to descriptions and launch. 
              No technical skills required, just your vision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6"
                onClick={() => setShowBuilder(true)}
              >
                Start Building Your Store Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="flex -space-x-1 mr-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                4.9/5 from 2,000+ users
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <span>500+ stores launched</span>
              <div className="h-4 w-px bg-gray-300" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Launch Successfully
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI handles every aspect of store creation, so you can focus on growing your business and making profits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI Store Generation",
                description: "Complete store setup with AI-generated names, branding, and winning product catalogs tailored to your niche."
              },
              {
                icon: Palette,
                title: "Professional Branding",
                description: "Custom logos, color schemes, and brand identity created by AI to match your business vision perfectly."
              },
              {
                icon: ShoppingCart,
                title: "Winning Products",
                description: "20 hand-picked winning products with complete descriptions, images, and pricing strategies."
              },
              {
                icon: Zap,
                title: "Lightning Fast Setup",
                description: "Generate complete stores in minutes, not weeks. Launch faster than your competition."
              },
              {
                icon: TrendingUp,
                title: "Profit Optimization",
                description: "Built-in strategies for maximum conversions and revenue generation from day one."
              },
              {
                icon: Users,
                title: "1-on-1 Mentorship",
                description: "Get personal guidance from successful entrepreneurs. Scale your business with expert support."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to your profitable Shopify store
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe Your Vision",
                description: "Tell us your niche, target audience, and business goals. Our AI will understand exactly what you need to succeed."
              },
              {
                step: "02",
                title: "AI Generates Everything",
                description: "Watch as AI creates your store, winning products, descriptions, and complete setup with profit-focused strategies."
              },
              {
                step: "03",
                title: "Launch & Scale",
                description: "Export directly to Shopify with one click. Your store is ready to accept customers and generate revenue immediately."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Your Profitable Store?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of entrepreneurs who've launched successful stores and achieved financial freedom with StoreForge AI
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            onClick={() => setShowBuilder(true)}
          >
            Start Your Free Store Build
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Index;
