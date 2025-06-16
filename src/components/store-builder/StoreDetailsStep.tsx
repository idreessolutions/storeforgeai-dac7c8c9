
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormData } from "./StoreBuilderLogic";

interface StoreDetailsStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
              <Input
                id="niche"
                placeholder="What products will you sell? (e.g., Pet Products, Fitness, Beauty)"
                value={formData.niche}
                onChange={(e) => onInputChange('niche', e.target.value)}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg py-3"
              />
              <p className="text-xs text-gray-500 mt-1">AI will generate 10 premium products in this niche</p>
            </div>
          </CardContent>
        </Card>

        {/* Target Market - Enhanced */}
        <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-purple-700 text-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-2xl">👥</div>
              </div>
              <div>
                <div className="text-xl font-bold">Target Market</div>
                <div className="text-sm text-purple-600 font-normal">Who will love your products?</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">💝</span>
                Target Audience
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Required</Badge>
              </Label>
              <Input
                id="targetAudience"
                placeholder="Describe your ideal customers (e.g., Dog owners 25-45, Fitness enthusiasts)"
                value={formData.targetAudience}
                onChange={(e) => onInputChange('targetAudience', e.target.value)}
                className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg py-3"
              />
              <p className="text-xs text-gray-500 mt-1">This will shape your product descriptions and store tone</p>
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
                <SelectTrigger className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg py-3">
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

        {/* Design & Aesthetics - Enhanced */}
        <Card className="border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-green-700 text-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-2xl">🎨</div>
              </div>
              <div>
                <div className="text-xl font-bold">Design & Style</div>
                <div className="text-sm text-green-600 font-normal">Your store's personality</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeStyle" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">✨</span>
                Store Aesthetic
                <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">Required</Badge>
              </Label>
              <Select 
                value={formData.storeStyle} 
                onValueChange={(value) => onInputChange('storeStyle', value)}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg py-3">
                  <SelectValue placeholder="Choose your visual style 🌟" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">🔥 Modern & Minimalist</SelectItem>
                  <SelectItem value="luxury">💎 Luxury & Premium</SelectItem>
                  <SelectItem value="fun">🌈 Fun & Colorful</SelectItem>
                  <SelectItem value="professional">👔 Professional & Corporate</SelectItem>
                  <SelectItem value="rustic">🌿 Rustic & Natural</SelectItem>
                  <SelectItem value="trendy">🚀 Trendy & Hip</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Affects theme colors, typography, and overall design</p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Touch - Enhanced */}
        <Card className="border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-xl group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-orange-700 text-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-2xl">💭</div>
              </div>
              <div>
                <div className="text-xl font-bold">Personal Touch</div>
                <div className="text-sm text-orange-600 font-normal">Make it uniquely yours</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customInfo" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">🌟</span>
                Special Customizations
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">Optional</Badge>
              </Label>
              <Textarea
                id="customInfo"
                placeholder="Any special requests? Custom features, specific colors, unique requirements, or special messages you'd like to include..."
                value={formData.customInfo}
                onChange={(e) => onInputChange('customInfo', e.target.value)}
                rows={5}
                className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">We'll integrate these requests into your store design and setup</p>
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
