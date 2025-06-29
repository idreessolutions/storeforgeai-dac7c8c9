
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, CheckCircle, ExternalLink, Palette, Tag } from "lucide-react";

interface StoreSummaryStepProps {
  formData: {
    storeName: string;
    selectedNiche: string;
    themeColor: string;
    shopifyUrl: string;
  };
}

const StoreSummaryStep = ({ formData }: StoreSummaryStepProps) => {
  const getColorName = (colorValue: string): string => {
    const colorMap: Record<string, string> = {
      '#1E40AF': 'Ocean Blue',
      '#DC2626': 'Crimson Red',
      '#059669': 'Emerald Green',
      '#7C3AED': 'Royal Purple',
      '#EA580C': 'Sunset Orange',
      '#DB2777': 'Rose Pink',
      '#0891B2': 'Sky Blue',
      '#65A30D': 'Lime Green'
    };
    return colorMap[colorValue] || 'Custom Color';
  };

  const handleViewStore = () => {
    if (formData.shopifyUrl) {
      let storeUrl = formData.shopifyUrl;
      
      // Clean and format the store URL
      if (!storeUrl.startsWith('http')) {
        storeUrl = `https://${storeUrl}`;
      }
      
      // Remove /admin paths and ensure it's the public store URL
      storeUrl = storeUrl.replace('/admin', '').replace('.myshopify.com/admin', '.myshopify.com');
      
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">🎉 Your Store is Live!</h2>
              <p className="text-gray-600 text-lg sm:text-xl">
                Congratulations! Your AI-powered store is ready for customers
              </p>
            </div>

            {/* Store Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Store Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Name */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Store Name</p>
                    <p className="text-lg font-bold text-gray-900">{formData.storeName}</p>
                  </div>
                </div>

                {/* Niche */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Tag className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Niche</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{formData.selectedNiche}</p>
                  </div>
                </div>

                {/* Theme Color */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Palette className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Theme Color</p>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: formData.themeColor }}
                      ></div>
                      <p className="text-lg font-bold text-gray-900">{getColorName(formData.themeColor)}</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Products Added</p>
                    <p className="text-lg font-bold text-gray-900">10 Winning Products</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Features */}
            <div className="bg-white border-2 border-green-200 rounded-xl p-6 mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">✅ What's Been Set Up</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">10 AI-enhanced winning products</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Professional product descriptions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Multiple product variations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Optimized pricing strategy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Premium theme installed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Custom branding applied</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={handleViewStore}
                className="w-full sm:w-auto px-8 h-14 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ExternalLink className="mr-3 h-6 w-6" />
                View Your Live Store
              </Button>
              
              <p className="text-gray-600 text-sm mt-4">
                Your store is now live and ready to accept orders!
              </p>
            </div>

            {/* Next Steps */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">🚀 Next Steps</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Set up your payment methods (Stripe, PayPal, etc.)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Configure shipping rates and policies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Add your business information and legal pages</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Start marketing your new store!</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreSummaryStep;
