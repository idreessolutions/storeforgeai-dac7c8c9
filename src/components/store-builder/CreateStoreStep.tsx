
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Store, Users, Briefcase, Palette } from "lucide-react";

interface CreateStoreStepProps {
  formData: {
    storeName: string;
    niche: string;
    targetAudience: string;
    businessType: string;
    storeStyle: string;
    customInfo: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const CreateStoreStep = ({ formData, handleInputChange }: CreateStoreStepProps) => {
  const knownNiches = [
    "Pet Supplies", "Beauty & Skincare", "Fitness & Health", "Home & Garden", 
    "Kitchen & Dining", "Fashion & Apparel", "Tech & Electronics", "Gaming", 
    "Travel & Outdoor", "Office & Business", "Baby & Kids", "Sports & Recreation",
    "Jewelry & Accessories", "Arts & Crafts", "Automotive", "Books & Education"
  ];

  const businessModelOptions = [
    "E-commerce Store", "Dropshipping", "Retail Business", 
    "Wholesale", "Subscription Box", "Marketplace Seller"
  ];

  const storeAestheticOptions = [
    "Modern & Minimalist", "Luxury & Premium", "Fun & Colorful", 
    "Professional & Corporate", "Rustic & Natural", "Trendy & Hip"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Create Your Dream Store 🚀
              </h1>
              <p className="text-gray-600 text-lg">
                Tell us about your store vision and we'll create something amazing
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Store Name */}
                <div>
                  <Label htmlFor="storeName" className="block text-gray-700 font-semibold text-lg mb-3">
                    <Store className="inline h-5 w-5 mr-2" />
                    Store Name
                  </Label>
                  <Input
                    id="storeName"
                    type="text"
                    placeholder="Enter your store name"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">This will be your actual Shopify store name</p>
                </div>

                {/* Store Niche */}
                <div>
                  <Label htmlFor="niche" className="block text-gray-700 font-semibold text-lg mb-3">
                    <Users className="inline h-5 w-5 mr-2" />
                    Store Niche
                  </Label>
                  <Select value={formData.niche} onValueChange={(value) => handleInputChange('niche', value)}>
                    <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select your niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {knownNiches.map((niche) => (
                        <SelectItem key={niche} value={niche.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>
                          {niche}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">We'll pull 10 winning products from this niche</p>
                </div>

                {/* Target Audience */}
                <div>
                  <Label htmlFor="targetAudience" className="block text-gray-700 font-semibold text-lg mb-3">
                    <Users className="inline h-5 w-5 mr-2" />
                    Target Audience
                  </Label>
                  <Input
                    id="targetAudience"
                    type="text"
                    placeholder="e.g., Young professionals, Pet owners, Fitness enthusiasts"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                  />
                </div>

                {/* Phone Number - Auto-filled */}
                <div>
                  <Label htmlFor="phoneNumber" className="block text-gray-700 font-semibold text-lg mb-3">
                    📞 Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="text"
                    value="+12345678910"
                    readOnly
                    className="h-12 text-base border-2 border-gray-200 bg-gray-50 rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">Auto-filled for your convenience</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Business Model */}
                <div>
                  <Label htmlFor="businessType" className="block text-gray-700 font-semibold text-lg mb-3">
                    <Briefcase className="inline h-5 w-5 mr-2" />
                    Business Model
                  </Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                    <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select your business model" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessModelOptions.map((model) => (
                        <SelectItem key={model} value={model.toLowerCase().replace(/ /g, '-')}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Store Aesthetic */}
                <div>
                  <Label htmlFor="storeStyle" className="block text-gray-700 font-semibold text-lg mb-3">
                    <Palette className="inline h-5 w-5 mr-2" />
                    Store Aesthetic
                  </Label>
                  <Select value={formData.storeStyle} onValueChange={(value) => handleInputChange('storeStyle', value)}>
                    <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select your store aesthetic" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeAestheticOptions.map((style) => (
                        <SelectItem key={style} value={style.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">Influences product descriptions and SEO</p>
                </div>

                {/* Additional Info */}
                <div>
                  <Label htmlFor="customInfo" className="block text-gray-700 font-semibold text-lg mb-3">
                    ✨ Additional Requirements
                  </Label>
                  <Textarea
                    id="customInfo"
                    placeholder="Any specific requirements or preferences for your store?"
                    value={formData.customInfo}
                    onChange={(e) => handleInputChange('customInfo', e.target.value)}
                    className="min-h-[100px] text-base border-2 border-gray-300 focus:border-blue-500 rounded-xl resize-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateStoreStep;
