
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./StoreBuilderLogic";
import { Store, Target, Building, Palette, Info } from "lucide-react";

interface StoreDetailsStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const StoreDetailsStep = ({ formData, onInputChange }: StoreDetailsStepProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">🏪</div>
        <h2 className="text-3xl font-bold text-gray-900">Tell us about your dream store! ✨</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We'll create magic for your perfect audience! 🎯
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Store Information */}
        <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <div className="text-2xl">🏬</div>
              Store Basics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName" className="text-sm font-medium flex items-center gap-1">
                Store Name <span className="text-xl">🏷️</span>
              </Label>
              <Input
                id="storeName"
                placeholder="Batwood Store, Pet Paradise, FitLife Pro"
                value={formData.storeName}
                onChange={(e) => onInputChange('storeName', e.target.value)}
                className="focus:ring-blue-500"
              />
              <p className="text-xs text-blue-600 mt-1 font-medium">
                ✨ Your amazing brand name!
              </p>
            </div>
            
            <div>
              <Label htmlFor="niche" className="text-sm font-medium flex items-center gap-1">
                Store Niche <span className="text-xl">🎯</span>
              </Label>
              <Input
                id="niche"
                placeholder="Pet Products, Fitness, Beauty, Tech Gadgets"
                value={formData.niche}
                onChange={(e) => onInputChange('niche', e.target.value)}
                className="focus:ring-blue-500"
              />
              <p className="text-xs text-pink-600 mt-1 font-medium">
                🚀 We'll find 10 winning products for you!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <div className="text-2xl">👥</div>
              Your Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetAudience" className="text-sm font-medium flex items-center gap-1">
                Who loves your products? <span className="text-xl">💝</span>
              </Label>
              <Input
                id="targetAudience"
                placeholder="Dog owners 25-45, Fitness lovers, Busy moms"
                value={formData.targetAudience}
                onChange={(e) => onInputChange('targetAudience', e.target.value)}
                className="focus:ring-purple-500"
              />
              <p className="text-xs text-purple-600 mt-1 font-medium">
                🎨 Perfect customization just for them!
              </p>
            </div>

            <div>
              <Label htmlFor="businessType" className="text-sm font-medium flex items-center gap-1">
                Business Style <span className="text-xl">💼</span>
              </Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value) => onInputChange('businessType', value)}
              >
                <SelectTrigger className="focus:ring-purple-500">
                  <SelectValue placeholder="Pick your business vibe ✨" />
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
              <p className="text-xs text-gray-500 mt-1">
                💡 Smart pricing & presentation!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Store Style & Design */}
        <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <div className="text-2xl">🎨</div>
              Store Vibes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeStyle" className="text-sm font-medium flex items-center gap-1">
                Your Style <span className="text-xl">✨</span>
              </Label>
              <Select 
                value={formData.storeStyle} 
                onValueChange={(value) => onInputChange('storeStyle', value)}
              >
                <SelectTrigger className="focus:ring-green-500">
                  <SelectValue placeholder="Choose your aesthetic 🌟" />
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
              <p className="text-xs text-green-600 mt-1 font-medium">
                🎭 Perfect theme just for you!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <div className="text-2xl">💭</div>
              Extra Magic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customInfo" className="text-sm font-medium flex items-center gap-1">
                Special Wishes <span className="text-xl">🌟</span>
              </Label>
              <Textarea
                id="customInfo"
                placeholder="Tell us your dreams..."
                value={formData.customInfo}
                onChange={(e) => onInputChange('customInfo', e.target.value)}
                rows={4}
                className="focus:ring-orange-500"
              />
              <p className="text-xs text-orange-600 mt-1 font-medium">
                🪄 We'll make it happen!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreDetailsStep;
