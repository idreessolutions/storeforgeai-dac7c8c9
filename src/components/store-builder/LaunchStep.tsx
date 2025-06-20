
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Store, CheckCircle, Crown, Sparkles, Star } from "lucide-react";

interface LaunchStepProps {
  formData: {
    shopifyUrl: string;
  };
}

const LaunchStep = ({ formData }: LaunchStepProps) => {
  const handleViewStore = () => {
    if (formData.shopifyUrl) {
      // Extract store name from the domain and redirect to the actual store
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const storeUrl = `https://${storeName}.myshopify.com`;
      window.open(storeUrl, '_blank');
    } else {
      window.open('https://www.shopify.com/', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="border-0 shadow-2xl max-w-3xl mx-auto relative overflow-hidden">
        {/* Celebration Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-blue-400/10 to-purple-400/10"></div>
        <div className="absolute top-4 left-4">
          <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
        </div>
        <div className="absolute top-4 right-4">
          <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
        </div>
        <div className="absolute bottom-4 left-4">
          <Star className="h-6 w-6 text-purple-500 animate-spin" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Star className="h-6 w-6 text-blue-500 animate-ping" />
        </div>
        
        <CardContent className="py-12 px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
              <Store className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🎉 Congratulations! 🎉
            </h1>
            
            <p className="text-xl text-gray-700 font-medium mb-2">
              Your Professional E-Commerce Store is
            </p>
            
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              ✨ READY TO LAUNCH! ✨
            </h2>
            
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your store has been professionally configured with winning products, premium theme customization, 
              and optimized for maximum conversions. Everything is ready for you to start making money!
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-6 rounded-2xl mb-8 border border-green-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🏆 Professional Store Complete!
              </h3>
              
              <p className="text-gray-700 mb-6 font-medium">
                Your premium e-commerce store has been successfully created with enterprise-level features 
                and is fully optimized for sales and conversions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800 font-semibold">Store Created & Branded</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-blue-800 font-semibold">Premium Theme Installed</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <span className="text-purple-800 font-semibold">10 Winning Products Added</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <span className="text-yellow-800 font-semibold">Colors & Branding Applied</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-indigo-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span className="text-indigo-800 font-semibold">Payment Gateway Ready</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-pink-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-pink-600 flex-shrink-0" />
                <span className="text-pink-800 font-semibold">SEO & Mobile Optimized</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white py-4 text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={handleViewStore}
              >
                <Eye className="mr-3 h-5 w-5" />
                🚀 LAUNCH & VIEW YOUR LIVE STORE
              </Button>
              
              <p className="text-sm text-gray-600 font-medium">
                Click above to visit your live professional store and start selling immediately
              </p>
              
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl border border-yellow-300 mt-6">
                <p className="text-yellow-800 font-semibold text-sm">
                  🎯 <strong>Next Steps:</strong> Share your store, start marketing, and watch the sales roll in! 
                  Your professional e-commerce store is now live and ready for customers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaunchStep;
