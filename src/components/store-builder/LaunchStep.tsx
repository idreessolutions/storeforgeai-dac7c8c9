
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ExternalLink, CheckCircle } from "lucide-react";

interface LaunchStepProps {
  formData: {
    storeName?: string;
    niche?: string;
    themeColor?: string;
    shopifyUrl?: string;
    targetAudience?: string;
    businessType?: string;
    storeStyle?: string;
  };
}

const LaunchStep = ({ formData }: LaunchStepProps) => {
  const getColorName = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'Royal Blue',
      '#10B981': 'Emerald Green',
      '#8B5CF6': 'Purple',
      '#F59E0B': 'Amber',
      '#EF4444': 'Red',
      '#EC4899': 'Pink',
      '#6366F1': 'Indigo',
      '#F97316': 'Orange'
    };
    return colorMap[color] || 'Custom Color';
  };

  const openLiveStore = () => {
    if (formData.shopifyUrl) {
      const storeUrl = formData.shopifyUrl.startsWith('http') 
        ? formData.shopifyUrl 
        : `https://${formData.shopifyUrl}`;
      window.open(storeUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                🎉 Your Store is LIVE!
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Congratulations! Your professional dropshipping store is now ready to accept orders and start generating revenue.
              </p>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="text-xl font-semibold text-green-900">
                  Setup Complete!
                </h3>
              </div>
              <p className="text-green-800 text-base">
                Your store has been successfully created with premium products, professional theme, and optimized settings. Everything is configured and ready for customers.
              </p>
            </div>

            {/* Store Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-purple-600" />
                Your Store Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Store Name</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formData.storeName || 'Your Amazing Store'}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Niche</label>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {formData.niche?.replace(/-/g, ' ') || 'General'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Theme Color</label>
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-3 border-2 border-gray-300"
                        style={{ backgroundColor: formData.themeColor || '#3B82F6' }}
                      ></div>
                      <span className="text-lg font-semibold text-gray-900">
                        {getColorName(formData.themeColor || '#3B82F6')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-lg font-semibold text-green-600">Live & Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What We've Set Up */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ✅ What We've Set Up For You
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>10 winning {formData.niche?.replace(/-/g, ' ') || 'products'} with real images</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Professional Refresh theme installed</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>SEO-optimized product descriptions</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Smart pricing ($15-$80 range)</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Product variants and options (2-4 per product)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Store policies and pages</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Payment and shipping setup</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>{getColorName(formData.themeColor || '#3B82F6')} theme applied</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={openLiveStore}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-semibold rounded-xl"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View Your Live Store
              </Button>
              
              <p className="text-gray-600 text-sm mt-4">
                Your {formData.storeName || 'store'} is now live and ready to start accepting orders!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchStep;
