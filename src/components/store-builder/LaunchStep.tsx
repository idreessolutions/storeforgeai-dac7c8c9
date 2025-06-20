
import React from "react";
import { CheckCircle, ExternalLink, Crown, Sparkles, Zap, Star } from "lucide-react";

interface LaunchStepProps {
  formData: {
    shopifyUrl?: string;
    storeName?: string;
    selectedColor?: string;
    niche?: string;
  };
}

const LaunchStep = ({ formData }: LaunchStepProps) => {
  const cleanShopifyUrl = formData.shopifyUrl?.replace(/\/$/, '') || '';
  const storeUrl = cleanShopifyUrl.includes('myshopify.com') 
    ? cleanShopifyUrl 
    : `https://${cleanShopifyUrl}.myshopify.com`;

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
        <div className="relative bg-white rounded-3xl p-12 shadow-2xl border border-green-200">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Star className="h-6 w-6 text-purple-500 animate-spin" />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎉 Your Store is LIVE!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Congratulations! Your professional dropshipping store is now ready to accept orders and start generating revenue.
          </p>
        </div>
      </div>

      {/* Store Details */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-500" />
          Your Store Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-2">Store Name</h3>
            <p className="text-lg font-bold" style={{ color: formData.selectedColor || '#3B82F6' }}>
              {formData.storeName || 'Your Amazing Store'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-2">Niche</h3>
            <p className="text-lg font-bold text-gray-800">
              {formData.niche || 'General'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-2">Theme Color</h3>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300" 
                style={{ backgroundColor: formData.selectedColor || '#3B82F6' }}
              ></div>
              <p className="text-lg font-bold text-gray-800">
                {formData.selectedColor || '#3B82F6'}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-lg font-bold text-green-600">Live & Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <ExternalLink className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          View Your Live Store
        </a>
        
        <a
          href={`${storeUrl}/admin`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          Access Admin Panel
        </a>
      </div>

      {/* Success Checklist */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          What We've Set Up For You
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            '✅ Professional Shopify theme installed',
            '✅ Custom color scheme applied',
            '✅ 10 winning products with real images',
            '✅ Product variations and pricing set',
            '✅ Store name and branding configured',
            '✅ Niche-specific product descriptions',
            '✅ Mobile-responsive design',
            '✅ Ready to accept payments'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Next Steps to Success</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold mb-2">Customize Further</h3>
            <p className="text-sm text-gray-600">Add your logo, adjust settings, and personalize your store</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold mb-2">Set Up Payments</h3>
            <p className="text-sm text-gray-600">Configure Shopify Payments or your preferred payment gateway</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold mb-2">Start Marketing</h3>
            <p className="text-sm text-gray-600">Launch ads, create social media content, and drive traffic</p>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-4">
          🎊 Your journey to e-commerce success starts now!
        </p>
        <p className="text-sm text-gray-500">
          Need help? Contact our support team anytime.
        </p>
      </div>
    </div>
  );
};

export default LaunchStep;
