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
const predefinedNiches = ["Home & Living", "Beauty & Personal Care", "Health & Fitness", "Pets", "Fashion & Accessories", "Electronics & Gadgets", "Kids & Babies", "Seasonal & Events", "Hobbies & Lifestyle", "Trending Viral Products"];
const StoreDetailsStep = ({
  formData,
  onInputChange
}: StoreDetailsStepProps) => {
  const characterCount = formData.storeName.length;
  return <div className="space-y-12 relative">
      {/* Floating decorative shapes */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-16 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-75"></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-yellow-200 rounded-full opacity-20 animate-pulse delay-150"></div>
      
      <div className="text-center space-y-6 relative z-10">
        <div className="relative">
          <div className="text-8xl animate-bounce">🏪</div>
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Create Your Dream Shopify Store ✨
          </h1>
          <div className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed space-y-3">
            <p className="font-medium">Tell us about your store vision and our AI will generate:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>10 viral winning products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Professional branding & logo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>High-converting descriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Fully organized collections</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">...all in minutes 🚀</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-4 py-1.5 text-sm">🧠 AI-Powered</Badge>
            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 px-4 py-1.5 text-sm">🔥 10 Winning Products</Badge>
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 px-4 py-1.5 text-sm">🎨 Pro Branding</Badge>
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 px-4 py-1.5 text-sm">⚡ Ready in Minutes</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Store Identity - Enhanced */}
        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl group bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-blue-700 text-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/zquqhgki.json" trigger="morph" stroke="bold" state="morph-growth" colors="primary:#ffffff,secondary:#ffffff" style="width:32px;height:32px"></lord-icon>'
                  }}
                />
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
                <div 
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/hepdwhfz.json" trigger="hover" stroke="bold" colors="primary:#e8e230,secondary:#e8e230" style="width:20px;height:20px"></lord-icon>'
                  }}
                />
                Store Name
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Required</Badge>
              </Label>
              <Input id="storeName" placeholder="Enter your amazing store name..." value={formData.storeName} onChange={e => onInputChange('storeName', e.target.value)} className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg py-3 hover:shadow-md" />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 mt-1">This will be your official Shopify store name</p>
                <p className={`text-xs mt-1 ${characterCount >= 8 && characterCount <= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                  {characterCount} characters {characterCount >= 8 && characterCount <= 20 && '✓ (Recommended: 8-20)'}
                  {characterCount < 8 && '(Recommended: 8-20 characters)'}
                  {characterCount > 20 && '(Recommended: 8-20 characters)'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">🎯</span>
                Store Niche
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Required</Badge>
              </Label>
              <Select value={formData.niche} onValueChange={value => onInputChange('niche', value)}>
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg py-3 hover:shadow-md animate-fade-in">
                  <SelectValue placeholder="Choose your store niche ✨" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {predefinedNiches.map(niche => <SelectItem key={niche} value={niche.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>
                      {niche}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <p className="text-xs text-gray-600 font-medium mt-1">We'll add 10 winning products from this niche</p>
                <p className="text-xs text-gray-400 italic">Examples: Dog toys, beauty gadgets, kitchen tools, trending TikTok products, etc.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <span className="text-lg">💼</span>
                How will you sell?
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Required</Badge>
              </Label>
              <Select value={formData.businessType} onValueChange={value => onInputChange('businessType', value)}>
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg py-3 hover:shadow-md animate-fade-in">
                  <SelectValue placeholder="Choose your business model ✨" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="e-commerce">🛒 E-commerce Store</SelectItem>
                  <SelectItem value="dropshipping">📦 Dropshipping</SelectItem>
                  <SelectItem value="retail">🏪 Retail Business</SelectItem>
                  <SelectItem value="wholesale">🏷️ Wholesale</SelectItem>
                  <SelectItem value="subscription">🎁 Subscription Box</SelectItem>
                  <SelectItem value="marketplace">🛍️ Marketplace Seller</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 font-medium mt-1">This helps us organize products, pricing, and marketing strategy.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-8 max-w-4xl mx-auto shadow-lg border border-blue-100 relative z-10">
        <div className="text-center space-y-4">
          <div className="text-3xl animate-bounce">🚀</div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ready to Build Something Amazing?
          </h3>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Once you complete this step, our AI will instantly generate your Shopify store with:
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-xs font-bold text-gray-700">✅ Custom theme & branding</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-xs font-bold text-gray-700">✅ 10 premium winning products</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🖼️</div>
              <div className="text-xs font-bold text-gray-700">✅ 60+ product images</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">✨</div>
              <div className="text-xs font-bold text-gray-700">✅ AI-written descriptions & SEO titles</div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default StoreDetailsStep;