
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              StoreForge AI
            </span>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 lg:px-6">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">
              <Rocket className="h-3 w-3 mr-1" />
              AI-Powered Store Generation
            </Badge>
            
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Build Your Dream{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Shopify Store
              </span>{" "}
              in Minutes
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Let AI create your complete store setup - from branding and products to descriptions and launch. 
              No technical skills required, just your vision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base px-6 py-3"
                onClick={() => setShowBuilder(true)}
              >
                Start Building Your Store Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="flex -space-x-1 mr-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-xs">4.9/5 from 2,000+ users</span>
              </div>
              <div className="h-3 w-px bg-gray-300 hidden sm:block" />
              <span className="text-xs">500+ stores launched</span>
              <div className="h-3 w-px bg-gray-300 hidden sm:block" />
              <span className="text-xs">24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Everything You Need to Launch Successfully
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Our AI handles every aspect of store creation, so you can focus on growing your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "AI Store Generation",
                description: "Complete store setup with AI-generated branding and winning product catalogs."
              },
              {
                icon: Palette,
                title: "Professional Branding",
                description: "Custom themes and brand identity created to match your business vision."
              },
              {
                icon: ShoppingCart,
                title: "Winning Products",
                description: "20 hand-picked products with descriptions and pricing strategies."
              },
              {
                icon: Zap,
                title: "Lightning Fast Setup",
                description: "Generate complete stores in minutes. Launch faster than competition."
              },
              {
                icon: TrendingUp,
                title: "Profit Optimization",
                description: "Built-in strategies for maximum conversions from day one."
              },
              {
                icon: Users,
                title: "1-on-1 Mentorship",
                description: "Get personal guidance from successful entrepreneurs."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md h-full">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to your profitable Shopify store
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Describe Your Vision",
                description: "Tell us your niche and business goals. Our AI understands what you need to succeed."
              },
              {
                step: "02",
                title: "AI Generates Everything",
                description: "Watch as AI creates your store, products, and complete setup with profit-focused strategies."
              },
              {
                step: "03",
                title: "Launch & Scale",
                description: "Your store is ready to accept customers and generate revenue immediately."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 lg:px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Ready to Start Your Profitable Store?
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Join thousands of entrepreneurs who've launched successful stores with StoreForge AI
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-base px-6 py-3"
            onClick={() => setShowBuilder(true)}
          >
            Start Your Free Store Build
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Index;
