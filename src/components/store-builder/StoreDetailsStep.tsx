
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormData } from "./StoreBuilderLogic";

interface StoreDetailsStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const predefinedNiches = [
  "Home & Living",
  "Beauty & Personal Care", 
  "Health & Fitness",
  "Pets",
  "Fashion & Accessories",
  "Electronics & Gadgets",
  "Kids & Babies",
  "Seasonal & Events",
  "Hobbies & Lifestyle",
  "Trending Viral Products"
];

const StoreDetailsStep = ({ formData, onInputChange }: StoreDetailsStepProps) => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="text-8xl animate-bounce">🏪</div>
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Create Your Dream Store ✨
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tell us about your vision and we'll create the perfect store with AI-powered products, 
            professional branding, and everything you need to succeed! 🚀
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">AI-Powered</Badge>
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">10 Premium Products</Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Professional Branding</Badge>
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">Ready in Minutes</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Store Identity - Enhanced */}
        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-blue-700 text-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-2xl">🏬</div>
              </div>
              <div>
                <div className="text-xl font-bold">Store Identity</div>
                <div className="text-sm text-blue-600 font-normal">The foundation of your brand</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">🏷️</span>
                Store Name
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Required</Badge>
              </Label>
              <Input
                id="storeName"
                placeholder="Enter your amazing store name..."
                value={formData.storeName}
                onChange={(e) => onInputChange('storeName', e.target.value)}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg py-3"
              />
              <p className="text-xs text-gray-500 mt-1">This will be your official Shopify store name</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">🎯</span>
                Store Niche
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Required</Badge>
              </Label>
              <Select 
                value={formData.niche} 
                onValueChange={(value) => onInputChange('niche', value)}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg py-3">
                  <SelectValue placeholder="Choose your store niche ✨" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedNiches.map((niche) => (
                    <SelectItem key={niche} value={niche.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>
                      {niche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">We'll add 10 winning products from this niche</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">💼</span>
                Business Model
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Required</Badge>
              </Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value) => onInputChange('businessType', value)}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg py-3">
                  <SelectValue placeholder="Choose your business model ✨" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="e-commerce">🛒 E-commerce Store</SelectItem>
                  <SelectItem value="dropshipping">📦 Dropshipping</SelectItem>
                  <SelectItem value="retail">🏪 Retail Business</SelectItem>
                  <SelectItem value="wholesale">📊 Wholesale</SelectItem>
                  <SelectItem value="subscription">📮 Subscription Box</SelectItem>
                  <SelectItem value="marketplace">🏛️ Marketplace Seller</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Affects store setup and product organization</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <div className="text-2xl">🚀</div>
          <h3 className="text-lg font-semibold text-gray-900">Ready to Create Magic?</h3>
          <p className="text-sm text-gray-600">
            Fill out the required fields above and we'll generate your complete store with:
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🎨</div>
              <div className="text-xs font-medium text-gray-700">Custom Theme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-xs font-medium text-gray-700">10 Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-xs font-medium text-gray-700">60+ Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-xs font-medium text-gray-700">AI Descriptions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsStep;
