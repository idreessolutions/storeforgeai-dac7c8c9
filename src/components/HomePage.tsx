
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Zap, ShoppingCart, Palette, Star, CheckCircle, ArrowRight } from "lucide-react";

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage = ({ onGetStarted }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 lg:py-20">
        <div className="text-center max-w-6xl mx-auto mb-12 sm:mb-16">
          {/* Shopify Partnership Badge */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-gray-200 flex items-center space-x-2 sm:space-x-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
                <path d="M25.7 7.8c-.1-.3-.3-.4-.6-.4-.1 0-2.9-.1-2.9-.1s-1.9-1.9-2.1-2.1c-.2-.2-.5-.1-.6-.1l-.8.2c-.2-.6-.6-1.4-1.2-1.9C16.3 2.6 14.9 2.3 14 2.8c0 0 0 0-.1 0-.2.1-.4.2-.6.4-.7-1.2-1.8-1.7-2.4-1.2C9.7 2.6 9.4 4.1 9.6 6.1l-2.3.7c-.7.2-1.2.4-1.3 1.2-.1.6-2.6 20.3-2.6 20.3L24.5 30s4.7-24.7 4.7-25.1c.1-.1 0-.1 0-.1zM17 4.4c-.4.1-.8.3-1.3.4V4.4c0-.8-.1-1.5-.4-2 .6-.1 1.1.4 1.7 2zM14.5 2.9c.2.4.3 1 .3 1.7v.2c-.5.2-1.1.3-1.7.5.2-1.1.6-1.9 1.4-2.4zM12.6 3.6c.1 0 .1 0 .2.1-.6.4-.9 1.1-1.1 2.1l-1.4.4c.4-1.3 1.4-2.3 2.3-2.6z" fill="#95BF47"/>
                <path d="m24.5 30-3.4-26.2c-.1-.3-.3-.4-.6-.4-.1 0-2.9-.1-2.9-.1s-1.9-1.9-2.1-2.1c-.1-.1-.2-.1-.3-.1L14 30h10.5z" fill="#5E8E3E"/>
              </svg>
              <span className="text-gray-700 font-semibold text-sm sm:text-base">Powered by Shopify</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Build Your Dream <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Shopify Store</span> in Minutes
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-4xl mx-auto">
            Launch a fully optimized, AI-enhanced store with real products, unique branding, and Shopify integration – in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center w-full sm:w-auto"
            >
              <Store className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Building Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-gray-500 mb-12 sm:mb-16 text-sm sm:text-base">
            <div className="flex items-center">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-1" />
              <span className="font-semibold">4.9/5</span>
              <span className="ml-1">rating</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" />
              <span>10,000+ stores created</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2" />
              <span>5-minute setup</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-12 sm:mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">AI-Powered Generation</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Our advanced AI creates unique product descriptions, titles, and content tailored to your niche and brand style.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Real Product Images</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Automatically sources high-quality product images from trusted suppliers with proper licensing and variants.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Custom Branding</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Personalize your store with custom colors, themes, and branding that matches your business vision perfectly.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center max-w-5xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl font-bold">1</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Choose Your Niche</h3>
              <p className="text-gray-600 text-sm sm:text-base">Select from popular niches like beauty, pets, tech, fitness, and more. Our AI understands each market.</p>
            </div>
            
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl font-bold">2</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Customize Your Brand</h3>
              <p className="text-gray-600 text-sm sm:text-base">Set your store name, target audience, business model, and design aesthetic for personalized results.</p>
            </div>
            
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl font-bold">3</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Launch Your Store</h3>
              <p className="text-gray-600 text-sm sm:text-base">Connect to Shopify and watch as 10 unique products are generated and uploaded to your new store.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-white max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Ready to Build Your Empire?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">Join thousands of successful entrepreneurs who've launched their dream stores with our platform.</p>
          
          <Button 
            onClick={onGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center mx-auto"
          >
            <Store className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Get Started Now - It's Free
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-75">No setup fees • No monthly charges • Launch in 5 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
