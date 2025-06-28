
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Zap, ShoppingCart, Palette, Star, CheckCircle, ArrowRight, TrendingUp, Users, Crown } from "lucide-react";

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage = ({ onGetStarted }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <div className="text-center max-w-6xl mx-auto mb-16 sm:mb-20">
          {/* Enhanced Partnership Badge */}
          <div className="flex items-center justify-center mb-8 sm:mb-10">
            <div className="bg-white rounded-2xl px-6 sm:px-8 py-4 sm:py-5 shadow-xl border border-gray-100 flex items-center space-x-4 sm:space-x-5 hover:shadow-2xl transition-all duration-300">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 32 32" fill="none">
                <path d="M25.7 7.8c-.1-.3-.3-.4-.6-.4-.1 0-2.9-.1-2.9-.1s-1.9-1.9-2.1-2.1c-.2-.2-.5-.1-.6-.1l-.8.2c-.2-.6-.6-1.4-1.2-1.9C16.3 2.6 14.9 2.3 14 2.8c0 0 0 0-.1 0-.2.1-.4.2-.6.4-.7-1.2-1.8-1.7-2.4-1.2C9.7 2.6 9.4 4.1 9.6 6.1l-2.3.7c-.7.2-1.2.4-1.3 1.2-.1.6-2.6 20.3-2.6 20.3L24.5 30s4.7-24.7 4.7-25.1c.1-.1 0-.1 0-.1zM17 4.4c-.4.1-.8.3-1.3.4V4.4c0-.8-.1-1.5-.4-2 .6-.1 1.1.4 1.7 2zM14.5 2.9c.2.4.3 1 .3 1.7v.2c-.5.2-1.1.3-1.7.5.2-1.1.6-1.9 1.4-2.4zM12.6 3.6c.1 0 .1 0 .2.1-.6.4-.9 1.1-1.1 2.1l-1.4.4c.4-1.3 1.4-2.3 2.3-2.6z" fill="#95BF47"/>
                <path d="m24.5 30-3.4-26.2c-.1-.3-.3-.4-.6-.4-.1 0-2.9-.1-2.9-.1s-1.9-1.9-2.1-2.1c-.1-.1-.2-.1-.3-.1L14 30h10.5z" fill="#5E8E3E"/>
              </svg>
              <div className="text-left">
                <span className="text-gray-800 font-bold text-lg sm:text-xl">Powered by Shopify</span>
                <div className="text-gray-500 text-sm">Official Technology Partner</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            Build Your Dream{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Shopify Store
            </span>{" "}
            in Minutes
          </h1>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-5xl mx-auto font-light">
            AI creates your complete store setup - from branding and products to descriptions and launch. 
            Professional results, zero technical skills required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-10 sm:mb-12">
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center w-full sm:w-auto group"
            >
              <Store className="mr-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-12 transition-transform" />
              Start Building Your Store Now
              <ArrowRight className="ml-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex items-center text-gray-600 text-base sm:text-lg">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-3" />
              <span className="font-medium">No credit card • 100% Free setup</span>
            </div>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-gray-500 mb-16 sm:mb-20 text-base sm:text-lg">
            <div className="flex items-center hover:text-gray-700 transition-colors">
              <div className="flex -space-x-1 mr-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="font-semibold">4.9/5</span>
              <span className="ml-2">from 3,200+ users</span>
            </div>
            <div className="flex items-center hover:text-gray-700 transition-colors">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-3" />
              <span>1,500+ stores launched</span>
            </div>
            <div className="flex items-center hover:text-gray-700 transition-colors">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-3" />
              <span>Sub-5 minute setup</span>
            </div>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto mb-16 sm:mb-20">
          {[
            {
              icon: Zap,
              title: "AI Store Generation",
              description: "Complete store setup with AI-generated branding, winning product catalogs, and conversion-optimized design.",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              icon: Palette,
              title: "Professional Branding", 
              description: "Custom themes and brand identity created to match your business vision and target market perfectly.",
              gradient: "from-purple-500 to-purple-600"
            },
            {
              icon: ShoppingCart,
              title: "Winning Products",
              description: "10 hand-picked products with optimized descriptions, pricing strategies, and real supplier images.",
              gradient: "from-green-500 to-green-600"
            },
            {
              icon: TrendingUp,
              title: "Profit Optimization",
              description: "Built-in conversion strategies, SEO optimization, and profit-maximizing features from day one.",
              gradient: "from-orange-500 to-orange-600"
            },
            {
              icon: Crown,
              title: "Premium Setup",
              description: "Professional store configuration with advanced features typically costing $5,000+ in development.",
              gradient: "from-yellow-500 to-yellow-600"
            },
            {
              icon: Users,
              title: "Expert Mentorship",
              description: "Get personal guidance from successful entrepreneurs who've built million-dollar stores.",
              gradient: "from-indigo-500 to-indigo-600"
            }
          ].map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg h-full bg-white/90 backdrop-blur-sm hover:bg-white transform hover:scale-105">
              <CardContent className="p-8 sm:p-10 text-center h-full flex flex-col">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg flex-grow">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced How It Works */}
        <div className="text-center max-w-6xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">
            How It Works
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 sm:mb-16">
            Three simple steps to your profitable Shopify empire
          </p>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "01",
                title: "Define Your Vision",
                description: "Tell us your niche, target audience, and business goals. Our AI understands exactly what you need to succeed in your market."
              },
              {
                step: "02", 
                title: "AI Builds Everything",
                description: "Watch as advanced AI creates your store, products, branding, and complete setup with profit-focused strategies and winning formulas."
              },
              {
                step: "03",
                title: "Launch & Dominate",
                description: "Your professional store is ready to accept customers and generate revenue immediately. Start scaling from day one."
              }
            ].map((step, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl group-hover:shadow-2xl transition-shadow">
                  <span className="text-xl sm:text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{step.title}</h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-10 sm:p-16 text-white max-w-6xl mx-auto shadow-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
            Ready to Build Your Empire?
          </h2>
          <p className="text-xl sm:text-2xl mb-8 sm:mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
            Join thousands of successful entrepreneurs who've launched profitable stores with our AI platform. 
            Your dream store is just minutes away.
          </p>
          
          <Button 
            onClick={onGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-10 sm:px-16 py-5 sm:py-7 rounded-2xl text-xl sm:text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto group"
          >
            <Store className="mr-4 h-7 w-7 sm:h-8 sm:w-8 group-hover:rotate-12 transition-transform" />
            Start Your Free Store Build Now
            <ArrowRight className="ml-4 h-7 w-7 sm:h-8 sm:w-8 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-base sm:text-lg mt-6 sm:mt-8 opacity-80">
            No setup fees • No monthly charges • Professional results in 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
